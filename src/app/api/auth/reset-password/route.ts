import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const resetSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { email, newPassword } = parsed.data;

    // We only allow reset if they recently verified the OTP
    // i.e., there is a VerificationCode with purpose PASSWORD_RESET and verifiedAt != null
    const verificationCode = await prisma.verificationCode.findFirst({
      where: { email, purpose: "PASSWORD_RESET", verifiedAt: { not: null } },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationCode) {
      return NextResponse.json({ error: "No verified OTP session found. Please try the reset process again." }, { status: 403 });
    }

    // Check if the verified session is too old (e.g., verified more than 15 minutes ago)
    const sessionAge = Date.now() - verificationCode.verifiedAt!.getTime();
    if (sessionAge > 15 * 60 * 1000) {
      return NextResponse.json({ error: "Session expired. Please request a new OTP." }, { status: 403 });
    }

    // Update the password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Invalidate/delete the OTP session
    await prisma.verificationCode.deleteMany({
      where: { email, purpose: "PASSWORD_RESET" },
    });

    return NextResponse.json({ success: true, message: "Password reset successfully." }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
