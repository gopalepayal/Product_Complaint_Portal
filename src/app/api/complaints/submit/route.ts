import { NextRequest, NextResponse } from "next/server";
import { createComplaintFromData } from "@/lib/complaintSubmission";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { complaintData?: Record<string, unknown> };
    if (!body.complaintData) return NextResponse.json({ error: "Complaint details are required." }, { status: 400 });
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    let complaintData = body.complaintData;
    if (session?.user?.id && role === "CONSUMER") {
      const consumer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, legalName: true, displayName: true, email: true, isActive: true },
      });
      if (!consumer?.email || !consumer.isActive) {
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
    const complaint = await createComplaintFromData(complaintData);
    return NextResponse.json({ success: true, complaintId: complaint.id, complaintNumber: complaint.complaintNumber }, { status: 201 });
  } catch (error) {
    console.error("Complaint submission failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to submit complaint." }, { status: 400 });
  }
}
