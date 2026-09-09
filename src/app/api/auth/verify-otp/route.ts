import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { verifyStoredOTP } from "@/lib/otp";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  purpose: z.enum(["REGISTRATION", "PASSWORD_RESET"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { email, otp, purpose } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const verification = await verifyStoredOTP(normalizedEmail, purpose, otp);
    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    if (purpose === "REGISTRATION") {
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user || user.role !== "CONSUMER") {
        return NextResponse.json({ error: "Consumer registration could not be completed." }, { status: 400 });
      }
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { isActive: true },
      });
    }

    return NextResponse.json({ success: true, message: "Verification successful!" }, { status: 200 });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
