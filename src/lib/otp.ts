import { hash, compare } from "bcryptjs";
import { randomInt } from "crypto";
import type { VerificationPurpose } from "@prisma/client";
import { prisma } from "./prisma";
import { sendEmail } from "./email";

export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

export async function sendOTPAndStore(
  email: string,
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "COMPLAINT"
) {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOTP();
  const otpHash = await hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  const verificationPurpose: VerificationPurpose = purpose === "COMPLAINT"
    ? "COMPLAINT_POSTING"
    : purpose;

  // Invalidate previous active OTPs for same email + purpose
  await prisma.verificationCode.deleteMany({
    where: { email: normalizedEmail, purpose: verificationPurpose, verifiedAt: null },
  });

  // Store hashed OTP
  await prisma.verificationCode.create({
    data: { email: normalizedEmail, purpose: verificationPurpose, otpHash, expiresAt },
  });

  let subject = "";
  let text = "";
  let html = "";

  if (purpose === "COMPLAINT") {
    subject = "Verify your Product Complaint Portal complaint";
    text = `Dear Consumer,\n\nWe received your complaint submission request for Product Complaint Portal.\n\nYour verification OTP is:\n${otp}\n\nThis OTP is valid for 5 minutes.\nPlease do not share this OTP with anyone.\n\nRegards,\nProduct Complaint Portal`;
    html = `
      <div style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <div style="background:#1d4ed8;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">Product Complaint Portal</h1>
        </div>
        <div style="padding:30px;">
          <p>Dear Consumer,</p>
          <p>We received your complaint submission request for <strong>Product Complaint Portal</strong>.</p>
          <p>Your verification OTP is:</p>
          <div style="text-align:center;margin:30px 0;">
            <span style="font-size:36px;letter-spacing:8px;color:#1d4ed8;padding:16px 32px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-weight:bold;">${otp}</span>
          </div>
          <p style="color:#ef4444;font-weight:bold;font-size:14px;">This OTP is valid for 5 minutes.</p>
          <p>Please do not share this OTP with anyone.</p>
          <hr style="border:0;border-top:1px solid #e2e8f0;margin:30px 0;" />
          <p style="font-size:12px;color:#64748b;text-align:center;">Regards,<br/>Product Complaint Portal</p>
        </div>
      </div>
    `;
  } else {
    subject = purpose === "REGISTRATION"
      ? "Verify your Product Complaint Portal registration"
      : "Product Complaint Portal password reset code";
    text = `Your verification code is: ${otp}. It will expire in 5 minutes. Do not share this code.`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
        <h2 style="color:#1e3a8a;">Product Complaint Portal verification</h2>
        <p>Your secure verification code is:</p>
        <h1 style="font-size:36px;letter-spacing:8px;color:#1d4ed8;padding:12px;background:#f8fafc;border-radius:8px;text-align:center;">${otp}</h1>
        <p style="color:#64748b;font-size:14px;">This code will expire in 5 minutes. Do not share it with anyone.</p>
      </div>
    `;
  }

  try {
    await sendEmail({ to: normalizedEmail, subject, text, html });
  } catch (emailError: any) {
    console.error(`[EMAIL ERROR] OTP send failed for purpose=${purpose} to masked email:`, emailError.message);
    throw new Error(`Failed to send verification email. Details: ${emailError.message}`);
  }

  return true;
}

export async function verifyStoredOTP(
  email: string,
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "COMPLAINT",
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const verificationPurpose: VerificationPurpose = purpose === "COMPLAINT"
    ? "COMPLAINT_POSTING"
    : purpose;
  const record = await prisma.verificationCode.findFirst({
    where: { email: normalizedEmail, purpose: verificationPurpose, verifiedAt: null },
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

  // Mark as used
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { verifiedAt: new Date() },
  });

  return { success: true };
}
