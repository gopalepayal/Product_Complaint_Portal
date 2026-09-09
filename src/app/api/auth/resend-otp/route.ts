import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { sendOTPAndStore } from "@/lib/otp";

const resendSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["REGISTRATION", "PASSWORD_RESET"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { purpose } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();

    // Optional: check for 60s cooldown
    const lastCode = await prisma.verificationCode.findFirst({
      where: { email, purpose },
      orderBy: { createdAt: "desc" },
    });

    if (lastCode) {
      const timeDiff = Date.now() - lastCode.createdAt.getTime();
      if (timeDiff < 60 * 1000) {
        return NextResponse.json({ error: "Please wait 60 seconds before requesting a new OTP." }, { status: 429 });
      }
    }

    // Send new OTP
    await sendOTPAndStore(email, purpose);

    return NextResponse.json({ success: true, message: "A new OTP has been sent." }, { status: 200 });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: error.message || "Failed to resend OTP." }, { status: 500 });
  }
}
