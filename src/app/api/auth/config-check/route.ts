import { NextResponse } from "next/server";

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.trim().toLowerCase();
  return (
    lower.includes("yourgmail") ||
    lower.includes("your-16-character") ||
    lower.includes("your-app-password") ||
    lower.includes("your_msg91") ||
    lower.includes("actual-msg91") ||
    lower.includes("your-msg91") ||
    lower.includes("placeholder") ||
    lower.includes("example")
  );
}

export async function GET() {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();
  const msg91AuthKey = process.env.MSG91_AUTH_KEY?.trim();
  const msg91TemplateId = process.env.MSG91_OTP_TEMPLATE_ID?.trim();

  return NextResponse.json({
    gmailUserConfigured: Boolean(gmailUser) && !isPlaceholder(gmailUser),
    gmailAppPasswordConfigured: Boolean(gmailAppPassword) && !isPlaceholder(gmailAppPassword),
    msg91AuthKeyConfigured: Boolean(msg91AuthKey) && !isPlaceholder(msg91AuthKey),
    msg91TemplateConfigured: Boolean(msg91TemplateId) && !isPlaceholder(msg91TemplateId),
  });
}
