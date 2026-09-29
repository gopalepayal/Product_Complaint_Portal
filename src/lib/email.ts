 
import nodemailer from "nodemailer";

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.trim().toLowerCase();
  return (
    lower.includes("yourgmail") ||
    lower.includes("your-16-character") ||
    lower.includes("your-app-password") ||
    lower.includes("example.com") ||
    lower.includes("placeholder")
  );
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const rawAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();

  // Validate presence and non-placeholder status of Gmail credentials
  if (!gmailUser || isPlaceholder(gmailUser)) {
    console.error("[Gmail SMTP Configuration Error] GMAIL_USER is missing or set to placeholder in .env");
    throw new Error(
      "GMAIL_USER is not configured in .env. Please set your actual Gmail address."
    );
  }

  if (!rawAppPassword || isPlaceholder(rawAppPassword)) {
    console.error("[Gmail SMTP Configuration Error] GMAIL_APP_PASSWORD is missing or set to placeholder in .env");
    throw new Error(
      "GMAIL_APP_PASSWORD is not configured in .env. Please set your 16-character Google App Password."
    );
  }

  // Strip spaces from Google App Password (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const gmailAppPassword = rawAppPassword.replace(/\s+/g, "");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL/TLS
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const maskedEmail = gmailUser.replace(/(?<=.{2}).(?=.*@)/g, "*");
  console.log(`[Gmail SMTP Request] Attempting to send email to ${to} via ${maskedEmail}`);

  try {
    const info = await transporter.sendMail({
      from: `"Product Complaint Portal" <${gmailUser}>`,
      to,
      subject,
      text,
      html: html || text,
      // RFC-standard headers that signal this is a legitimate automated notification.
      // These are evaluated by Gmail's spam classifier alongside SPF/DKIM/DMARC.
      // - Auto-Submitted: RFC 3834 — tells receiving MTA this is system-generated (not forged human)
      // - Precedence: standard signal for automated/transactional mail
      // - X-Mailer: identifies the sending application
      headers: {
        "Auto-Submitted": "auto-generated",
        "Precedence": "bulk",
        "X-Mailer": "Product-Complaint-Portal/1.0",
      },
    });

    console.log(`[Gmail SMTP Success] Email delivered. MessageID: ${info.messageId}`);
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Gmail SMTP Failure] Failed to send email to ${to}:`, message);

    if (message.includes("535") || message.includes("BadCredentials") || message.includes("Username and Password not accepted")) {
      throw new Error(
        "Gmail SMTP Authentication Failed (535 Bad Credentials). Please check your GMAIL_USER and 16-character GMAIL_APP_PASSWORD in your .env file."
      );
    }

    throw error;
  }
}