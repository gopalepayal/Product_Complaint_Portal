import { NextRequest, NextResponse } from "next/server";
import { sendEmailOTPAndStore, sendMobileOTPAndStore } from "@/lib/otp";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { email, phone, type } = await req.json() as { email?: string; phone?: string; type?: "email" | "phone" };

    if (type === "phone" || (!type && phone && !email)) {
      if (!phone) {
        return NextResponse.json({ error: "Mobile phone number is required." }, { status: 400 });
      }

      const res = await sendMobileOTPAndStore(phone, "PHONE_VERIFICATION", userId, email);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: res.message || "Mobile OTP sent." });
    } else {
      if (!email) {
        return NextResponse.json({ error: "Email address is required." }, { status: 400 });
      }

      const res = await sendEmailOTPAndStore(email, "EMAIL_VERIFICATION", userId);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: res.message || "Email OTP sent." });
    }
  } catch (error: any) {
    console.error("Error in request-otp:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send verification code. Please try again." },
      { status: 500 }
    );
  }
}
