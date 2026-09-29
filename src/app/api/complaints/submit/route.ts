import { NextRequest, NextResponse } from "next/server";
import { createComplaintFromData } from "@/lib/complaintSubmission";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


/**
 * Handles complaint submission.
 * - Accepts complaint data (including consumerEmail, consumerMobile, etc.)
 * - Enriches data when an authenticated consumer session exists.
 * - Persists the complaint via `createComplaintFromData`.
 * - Sends a confirmation email and/or SMS to the consumer using the unified notification utility.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { complaintData?: Record<string, unknown> };
    if (!body.complaintData) {
      return NextResponse.json({ error: "Complaint details are required." }, { status: 400 });
    }

    // Authenticate consumer if a session exists.
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    let complaintData = body.complaintData;

    // Enrich with consumer profile when applicable.
    const consumerEmail = ((complaintData.consumerEmail as string) || "").trim().toLowerCase();
    if (session?.user?.id && role === "CONSUMER" && consumerEmail) {
      const consumer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, legalName: true, displayName: true, email: true, isActive: true },
      });
      if (consumer && consumer.email === consumerEmail) {
        if (!consumer.isActive) {
          return NextResponse.json({ error: "Your consumer account is not active." }, { status: 403 });
        }
        complaintData = {
          ...body.complaintData,
          consumerName: consumer.legalName,
          displayName: consumer.displayName || consumer.legalName,
          consumerEmail: consumer.email,
          authenticatedConsumerId: consumer.id,
        };
      }
    }

    // Persist the complaint.
    const complaint = await createComplaintFromData(complaintData);



    // TODO: Trigger public grouping logic for same‑brand and same‑product complaints.

    return NextResponse.json(
      { success: true, complaintId: complaint.id, complaintNumber: complaint.complaintNumber },
      { status: 201 }
    );
  } catch (err) {
    console.error("Complaint submission failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit complaint." },
      { status: 400 }
    );
  }
}
