import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { sendOTPAndStore } from "@/lib/otp";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "No active account found with this email." }, { status: 404 });
    }

    await sendOTPAndStore(email, "PASSWORD_RESET");

    return NextResponse.json(
      { success: true, message: "OTP sent successfully to your email." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
  }
}

