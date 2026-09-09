import { NextRequest, NextResponse } from "next/server";
import { sendOTPAndStore } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Send the OTP
    await sendOTPAndStore(email, "COMPLAINT");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in request-otp:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "We could not send the verification code. Please try again." }, { status: 500 });
  }
}

