import { NextRequest, NextResponse } from "next/server";
import { verifyStoredOTP } from "@/lib/otp";
import { createComplaintFromData } from "@/lib/complaintSubmission";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; otp?: string; complaintData?: Record<string, unknown> };
    if (!body.email || !body.otp || !body.complaintData) return NextResponse.json({ error: "Missing verification details." }, { status: 400 });
    const verification = await verifyStoredOTP(body.email, "COMPLAINT", body.otp);
    if (!verification.success) return NextResponse.json({ error: verification.error }, { status: 400 });
    const complaint = await createComplaintFromData(body.complaintData);
    return NextResponse.json({ success: true, complaintId: complaint.id, complaintNumber: complaint.complaintNumber }, { status: 201 });
  } catch (error) {
    console.error("Verified complaint submission failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to submit complaint." }, { status: 400 });
  }
}
