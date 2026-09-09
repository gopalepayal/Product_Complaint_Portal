import { Resend } from "resend";

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
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!fromEmail) {
    throw new Error(
      "Application code is ready, but Resend domain verification is required before OTP/confirmation emails can be delivered to arbitrary user email addresses. Set RESEND_FROM_EMAIL to a sender address from your verified Resend domain."
    );
  }
  
  if (!apiKey || apiKey.includes("your-resend-api-key") || apiKey.includes("paste_your_api_key")) {
    throw new Error(
      "Resend API key is not configured. Set RESEND_API_KEY on the server before sending email."
    );
  }

  // Initialize inside the function to prevent Next.js from crashing the entire route file
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      text,
      html: html || text,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully! ID:", data?.id);
    return true;
  } catch (error: any) {
    console.error("Error sending email via Resend:", error);
    const message = error.message || "Unknown error";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("testing") || lowerMessage.includes("only send") || lowerMessage.includes("recipient")) {
      throw new Error(
        "Resend rejected the sender because the account or domain cannot deliver to this recipient. Verify your sending domain in Resend and set RESEND_FROM_EMAIL to an address on that domain. Details: " +
          message
      );
    }

    throw new Error(
      "Failed to send email. Please check your Resend configuration. Details: " + message
    );
  }
}
