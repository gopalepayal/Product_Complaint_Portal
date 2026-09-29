import { NextRequest, NextResponse } from "next/server";
import { verifyEmailOTPCode, verifyMobileOTPCode, verifyStoredOTP } from "@/lib/otp";
import { createComplaintFromData } from "@/lib/complaintSubmission";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json() as {
      email?: string;
      phone?: string;
      otp?: string;
      type?: "email" | "phone";
      complaintData?: Record<string, unknown>;
    };

    const { email, phone, otp, type, complaintData } = body;

    if (!otp) {
      return NextResponse.json({ error: "Verification OTP is required." }, { status: 400 });
    }

    if (type === "phone" || (!type && phone && !email)) {
      if (!phone) {
        return NextResponse.json({ error: "Mobile number is required for mobile verification." }, { status: 400 });
      }

      const res = await verifyMobileOTPCode(phone, otp, "PHONE_VERIFICATION", email);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      let userStatus = { emailVerified: false, phoneVerified: true, isVerified: false };
      const targetEmail = email?.trim().toLowerCase();
      const user = res.user || (targetEmail ? await prisma.user.findUnique({ where: { email: targetEmail } }) : null);

      if (user) {
        userStatus = {
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          isVerified: user.isVerified,
        };
      }

      return NextResponse.json({
        success: true,
        message: "Mobile number verified successfully!",
        ...userStatus,
      });
    } else {
      if (!email) {
        return NextResponse.json({ error: "Email is required for email verification." }, { status: 400 });
      }

      let res = await verifyEmailOTPCode(email, otp, "EMAIL_VERIFICATION");
      if (!res.success) {
        res = await verifyStoredOTP(email, "COMPLAINT", otp);
      }

      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = res.user || await prisma.user.findUnique({ where: { email: normalizedEmail } });
      const userStatus = user
        ? { emailVerified: user.emailVerified, phoneVerified: user.phoneVerified, isVerified: user.isVerified }
        : { emailVerified: true, phoneVerified: false, isVerified: false };

      if (complaintData && userStatus.isVerified) {
        const complaint = await createComplaintFromData(complaintData);
        return NextResponse.json(
          {
            success: true,
            complaintId: complaint.id,
            complaintNumber: complaint.complaintNumber,
            ...userStatus,
          },
          { status: 201 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Email verified successfully!",
        ...userStatus,
      });
    }
  } catch (error) {
    console.error("Verification failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed." },
      { status: 400 }
    );
  }
}
