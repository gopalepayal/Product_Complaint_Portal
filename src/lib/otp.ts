/* eslint-disable @typescript-eslint/no-explicit-any */
import { hash, compare } from "bcryptjs";
import { randomInt } from "crypto";
import type { VerificationPurpose } from "@prisma/client";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { sendMobileOTP, normalizePhone } from "./msg91";

export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

/**
 * Check if a recent OTP was requested within the cooldown window (default 60s).
 */
export async function checkOTPCooldown(identifier: { email?: string; phone?: string }, purpose: VerificationPurpose): Promise<boolean> {
  const whereClause: any = { purpose };
  if (identifier.email) whereClause.email = identifier.email.trim().toLowerCase();
  if (identifier.phone) whereClause.phone = normalizePhone(identifier.phone);

  const lastCode = await prisma.verificationCode.findFirst({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  if (lastCode) {
    const elapsedSeconds = (Date.now() - lastCode.createdAt.getTime()) / 1000;
    if (elapsedSeconds < 60) {
      return true; // Is in cooldown
    }
  }

  return false; // Safe to send
}

/**
 * Send Email OTP & Store Hashed Code
 */
export async function sendEmailOTPAndStore(
  email: string,
  purpose: VerificationPurpose = "EMAIL_VERIFICATION",
  userId?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const isCooldown = await checkOTPCooldown({ email: normalizedEmail }, purpose);
  if (isCooldown) {
    return { success: false, error: "Please wait 60 seconds before requesting a new verification code." };
  }

  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) resolvedUserId = existingUser.id;
  }

  const otp = generateOTP();
  const otpHash = await hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate previous active OTPs for same email + purpose
  await prisma.verificationCode.deleteMany({
    where: { email: normalizedEmail, purpose, verifiedAt: null },
  });

  // Store hashed OTP
  const codeRecord = await prisma.verificationCode.create({
    data: {
      email: normalizedEmail,
      purpose,
      otpHash,
      expiresAt,
      userId: resolvedUserId || null,
    },
  });

  const subject = "Your Verification OTP - Product Complaint Portal";
  const text = `Your email verification code is: ${otp}. It will expire in 5 minutes. Do not share this code.`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <div style="background:#0f766e;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Product Complaint Portal</h1>
      </div>
      <div style="padding:30px;">
        <p>Dear Consumer,</p>
        <p>Your email verification code is:</p>
        <div style="text-align:center;margin:30px 0;">
          <span style="font-size:36px;letter-spacing:8px;color:#0f766e;padding:16px 32px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-weight:bold;">${otp}</span>
        </div>
        <p style="color:#ef4444;font-weight:bold;font-size:14px;">This OTP is valid for 5 minutes.</p>
        <p>Please do not share this OTP with anyone.</p>
        <hr style="border:0;border-top:1px solid #e2e8f0;margin:30px 0;" />
        <p style="font-size:12px;color:#64748b;text-align:center;">Product Complaint Portal</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to: normalizedEmail, subject, text, html });
    return { success: true, message: "Verification OTP sent to your email." };
  } catch (emailError: any) {
    // If sending email fails, remove the newly created code record so no orphaned code exists
    await prisma.verificationCode.delete({ where: { id: codeRecord.id } }).catch(() => {});
    return { success: false, error: emailError.message || "Failed to send verification email." };
  }
}

/**
 * Send Mobile OTP (via MSG91) & Store Hashed Code
 */
export async function sendMobileOTPAndStore(
  phone: string,
  purpose: VerificationPurpose = "PHONE_VERIFICATION",
  userId?: string,
  email?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const normalized = normalizePhone(phone);

  if (!normalized || normalized.length < 10) {
    return { success: false, error: "Please enter a valid mobile number." };
  }

  const isCooldown = await checkOTPCooldown({ phone: normalized }, purpose);
  if (isCooldown) {
    return { success: false, error: "Please wait 60 seconds before requesting a new SMS OTP." };
  }

  let resolvedUserId = userId;
  if (!resolvedUserId && email) {
    const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) resolvedUserId = existingUser.id;
  }
  if (!resolvedUserId) {
    const existingUser = await prisma.user.findFirst({ where: { phone: normalized } });
    if (existingUser) resolvedUserId = existingUser.id;
  }

  const otp = generateOTP();
  const otpHash = await hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate previous active OTPs for same phone + purpose
  await prisma.verificationCode.deleteMany({
    where: { phone: normalized, purpose, verifiedAt: null },
  });

  // Store hashed OTP
  const codeRecord = await prisma.verificationCode.create({
    data: {
      phone: normalized,
      purpose,
      otpHash,
      expiresAt,
      userId: resolvedUserId || null,
    },
  });

  // Trigger MSG91 send passing generated OTP
  const msg91Res = await sendMobileOTP(normalized, otp);
  if (!msg91Res.success) {
    // Clean up stored code if SMS dispatch fails
    await prisma.verificationCode.delete({ where: { id: codeRecord.id } }).catch(() => {});
    return { success: false, error: msg91Res.error || "Failed to send mobile OTP via SMS." };
  }

  return { success: true, message: msg91Res.message || "OTP sent to your mobile via SMS!" };
}

/**
 * Update user's verification status in DB.
 * Only sets isVerified = true when BOTH emailVerified AND phoneVerified are true.
 */
export async function updateUserVerificationState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, phoneVerified: true, isVerified: true },
  });

  if (!user) return;

  const bothVerified = user.emailVerified && user.phoneVerified;

  if (bothVerified && !user.isVerified) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
  } else if (!bothVerified && user.isVerified) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: false,
        verifiedAt: null,
      },
    });
  }
}

/**
 * Verify Email OTP
 */
export async function verifyEmailOTPCode(
  email: string,
  otp: string,
  purpose: VerificationPurpose = "EMAIL_VERIFICATION"
): Promise<{ success: boolean; error?: string; user?: any }> {
  const normalizedEmail = email.trim().toLowerCase();

  const record = await prisma.verificationCode.findFirst({
    where: { email: normalizedEmail, purpose, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { success: false, error: "This verification code has expired. Please request a new code." };
  }

  if (record.attempts >= 5) {
    return { success: false, error: "Too many incorrect attempts. Please request a new verification code." };
  }

  if (new Date() > record.expiresAt) {
    return { success: false, error: "This verification code has expired. Please request a new code." };
  }

  const isValid = await compare(otp, record.otpHash);
  if (!isValid) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { success: false, error: "Invalid verification code. Please try again." };
  }

  // Mark OTP as used
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { verifiedAt: new Date() },
  });

  // Find or create matching user and update emailVerified
  const now = new Date();
  let user = record.userId
    ? await prisma.user.findUnique({ where: { id: record.userId } })
    : await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        legalName: "Consumer",
        email: normalizedEmail,
        role: "CONSUMER",
        emailVerified: true,
        emailVerifiedAt: now,
        phoneVerified: false,
        isVerified: false,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: now,
      },
    });
  }

  await updateUserVerificationState(user.id);
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

  return { success: true, user: updatedUser };
}

/**
 * Verify Mobile OTP
 */
export async function verifyMobileOTPCode(
  phone: string,
  otp: string,
  purpose: VerificationPurpose = "PHONE_VERIFICATION",
  email?: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  const normalized = normalizePhone(phone);

  const record = await prisma.verificationCode.findFirst({
    where: { phone: normalized, purpose, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { success: false, error: "No active verification code found for this mobile number. Please request a new code." };
  }

  if (record.attempts >= 5) {
    return { success: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  if (new Date() > record.expiresAt) {
    return { success: false, error: "This verification code has expired. Please request a new code." };
  }

  const isValid = await compare(otp, record.otpHash);
  if (!isValid) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { success: false, error: "Invalid mobile OTP. Please try again." };
  }

  // Mark OTP as used
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { verifiedAt: new Date() },
  });

  // Update matching user in DB
  const now = new Date();
  const normalizedEmail = email?.trim().toLowerCase();

  let user = record.userId
    ? await prisma.user.findUnique({ where: { id: record.userId } })
    : null;

  if (!user && normalizedEmail) {
    user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  }

  if (!user) {
    user = await prisma.user.findFirst({ where: { phone: normalized } });
  }

  if (!user && normalizedEmail) {
    user = await prisma.user.create({
      data: {
        legalName: "Consumer",
        email: normalizedEmail,
        phone: normalized,
        role: "CONSUMER",
        emailVerified: false,
        phoneVerified: true,
        phoneVerifiedAt: now,
        isVerified: false,
      },
    });
  } else if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: normalized,
        phoneVerified: true,
        phoneVerifiedAt: now,
      },
    });
  }

  if (user) {
    await updateUserVerificationState(user.id);
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    return { success: true, user: updatedUser };
  }

  return { success: true };
}

/**
 * Legacy wrapper for sendOTPAndStore (backward compatible)
 */
export async function sendOTPAndStore(
  email: string,
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "COMPLAINT"
) {
  const verificationPurpose: VerificationPurpose = purpose === "COMPLAINT"
    ? "COMPLAINT_POSTING"
    : purpose;

  const result = await sendEmailOTPAndStore(email, verificationPurpose);
  if (!result.success) {
    throw new Error(result.error || "Failed to send OTP.");
  }
  return true;
}

/**
 * Legacy wrapper for verifyStoredOTP (backward compatible)
 */
export async function verifyStoredOTP(
  email: string,
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "COMPLAINT",
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const verificationPurpose: VerificationPurpose = purpose === "COMPLAINT"
    ? "COMPLAINT_POSTING"
    : purpose;

  return verifyEmailOTPCode(email, otp, verificationPurpose);
}
