/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Product Complaint Portal transactional email notifications
 * All emails use the existing Resend integration via sendEmail().
 * NEVER log OTPs, API keys, or passwords.
 */
import { sendEmail } from "./email";
import { sendTransactionalSMS } from "./msg91";


const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function portalHeader() {
  return `<div style="background:#1d4ed8;padding:20px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;">Product Complaint Portal</h1>
    <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Independent consumer platform</p>
  </div>`;
}

function portalFooter() {
  return `<hr style="border:0;border-top:1px solid #e2e8f0;margin:30px 0;" />
  <p style="font-size:12px;color:#64748b;text-align:center;">
    Product Complaint Portal<br/>
    This is an automated message. Please do not reply to this email.
  </p>`;
}

function wrap(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Product Complaint Portal</title></head>
<body style="margin:0;padding:16px;background:#f8fafc;">
<div style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#ffffff;">
    ${portalHeader()}
    <div style="padding:28px;">${body}</div>
  </div>
</body>
</html>`;
}

function infoBox(rows: { label: string; value: string }[]) {
  return `<div style="background:#f8fafc;padding:16px;border-radius:6px;margin:20px 0;border:1px solid #e2e8f0;">
    ${rows.map(r => `<p style="margin:5px 0;"><strong>${r.label}:</strong> ${r.value}</p>`).join("")}
  </div>`;
}

function badge(label: string, color = "#1e40af", bg = "#dbeafe") {
  return `<span style="background:${bg};color:${color};padding:2px 10px;border-radius:12px;font-size:12px;font-weight:bold;">${label}</span>`;
}

function ctaButton(label: string, url: string) {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="background:#1d4ed8;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">${label}</a>
  </div>`;
}

// ─────────────────────────────────────────────
// 1. COMPLAINT SUBMITTED CONFIRMATION (email)
// ─────────────────────────────────────────────
export async function sendComplaintConfirmation(opts: {
  to: string;
  consumerName: string;
  complaintNumber: string;
  complaintTitle: string;
  productName: string;
  brandName: string;
  submittedAt: Date;
}) {
  const { to, consumerName, complaintNumber, productName, brandName, submittedAt } = opts;
  const subject = `Complaint Submitted Successfully – ${complaintNumber}`;

  const body = `
    <p>Dear ${consumerName},</p>
    <p>Your complaint has been submitted successfully and is currently <strong>Under Review</strong>.</p>
    ${infoBox([
      { label: "Complaint ID", value: complaintNumber },
      { label: "Complaint Title", value: opts.complaintTitle },
      { label: "Product", value: productName },
      { label: "Brand", value: brandName },
      { label: "Submitted On", value: submittedAt.toLocaleString("en-IN") },
      { label: "Current Status", value: "Under Review" },
    ])}
    <p>Your complaint has been received and is currently Under Review. We will notify you when the status changes.</p>
    ${ctaButton("Track Your Complaint", `${APP_URL}/track?number=${complaintNumber}`)}
    ${portalFooter()}
  `;

  try {
    await sendEmail({
      to,
      subject,
      text: [
        `Dear ${consumerName},`,
        "",
        "Your complaint has been submitted successfully and is currently Under Review.",
        "",
        `Complaint ID: ${complaintNumber}`,
        `Product: ${productName}`,
        `Brand: ${brandName}`,
        "Status: Under Review",
        "",
        "Product Complaint Portal",
      ].join("\n"),
      html: wrap(body),
    });
  } catch (e: unknown) {
    console.error(`[EMAIL] Complaint confirmation failed for ${complaintNumber}:`, e);
    // Do not re-throw — email failure must never block the complaint save
  }
}

// ─────────────────────────────────────────────────────────────
// 1b. UNIFIED COMPLAINT NOTIFICATION (dispatches per preference)
// ─────────────────────────────────────────────────────────────
/**
 * Sends a confirmation notification automatically.
 * Emails are sent if an email address is provided.
 * SMS are sent if a phone number is provided.
 */
export async function sendComplaintNotification(opts: {
  email?: string | null;
  phone?: string | null;
  consumerName: string;
  complaintNumber: string;
  complaintTitle: string;
  productName: string;
  brandName: string;
  submittedAt: Date;
}) {
  let emailSent = false;
  let smsSent = false;

  // ── Email ──────────────────────────────────────────────────
  if (opts.email) {
    const validEmail = opts.email.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validEmail)) {
      console.log(`[EMAIL] Attempting to send complaint confirmation to: ${validEmail} for ${opts.complaintNumber}`);
      try {
        const subject = `Complaint Submitted Successfully - ${opts.complaintNumber}`;
        const text = [
          `Dear Customer,`,
          ``,
          `Your complaint has been submitted successfully and is currently Under Review.`,
          ``,
          `Complaint ID: ${opts.complaintNumber}`,
          `Product: ${opts.productName}`,
          `Brand: ${opts.brandName}`,
          `Status: Under Review`,
          ``,
          `Our team will review your complaint and you will receive the next update shortly.`,
          ``,
          `Regards,`,
          `Product Complaint Portal`,
        ].join(`\n`);

        const html = wrap(
          `<p>Dear Customer,</p>
           <p>Your complaint has been submitted successfully and is currently <strong>Under Review</strong>.</p>
           ${infoBox([
             { label: "Complaint ID", value: opts.complaintNumber },
             { label: "Product",      value: opts.productName },
             { label: "Brand",        value: opts.brandName },
             { label: "Status",       value: "Under Review" },
           ])}
           <p>Our team will review your complaint and you will receive the next update shortly.</p>
           <p>Regards,<br/>Product Complaint Portal</p>
           ${portalFooter()}`
        );

        await sendEmail({
          to: validEmail,
          subject,
          text,
          html,
        });
        emailSent = true;
        console.log(`[EMAIL] ✅ Complaint confirmation sent successfully to: ${validEmail} for ${opts.complaintNumber}`);
      } catch (err: unknown) {
        console.error(`[EMAIL] ❌ SMTP FAILED — complaint: ${opts.complaintNumber} | recipient: ${validEmail}`, err);
      }
    } else {
      console.error(`[EMAIL] ❌ Invalid email address — skipping send. Value received: "${validEmail}" for ${opts.complaintNumber}`);
    }
  } else {
    console.warn(`[EMAIL] No email address provided — skipping email notification for ${opts.complaintNumber}`);
  }


  // ── SMS ────────────────────────────────────────────────────
  if (opts.phone) {
    const messageText = `Your complaint has been submitted successfully.\n\nComplaint ID: ${opts.complaintNumber}\nStatus: Under Review\nProduct: ${opts.productName}\nBrand: ${opts.brandName}\n\nWe have received your complaint and it is currently under review.`;
    const result = await sendTransactionalSMS(opts.phone, messageText);
    if (!result.success) {
      console.warn(
        `[NOTIFY] SMS notification failed for ${opts.complaintNumber}: ${result.error}`
      );
    } else {
      smsSent = true;
    }
  }

  return { emailSent, smsSent };
}

// ─────────────────────────────────────────────────────────────
// 1c. ADMIN SUBMIT – second email sent only after admin clicks
//     "Submit" and the DB status update succeeds.
// ─────────────────────────────────────────────────────────────
/**
 * Send the second customer-facing email when an admin submits/publishes a complaint.
 * NEVER call this on the initial customer submission; call it only after the admin action.
 * recipient = complaint.contactEmail (dynamic, never GMAIL_USER)
 */
export async function sendComplaintSubmittedByAdmin(opts: {
  contactEmail: string | null | undefined;
  complaintNumber: string;
  productName: string;
  brandName: string;
}): Promise<{ emailSent: boolean }> {
  const { contactEmail, complaintNumber, productName, brandName } = opts;

  if (!contactEmail) {
    console.warn(`[EMAIL] No contactEmail on complaint ${complaintNumber}; skipping admin-submit email.`);
    return { emailSent: false };
  }

  const recipient = contactEmail.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    console.error(`[EMAIL] Invalid contactEmail "${recipient}" for complaint ${complaintNumber}; skipping admin-submit email.`);
    return { emailSent: false };
  }

  const subject = `Your Complaint Has Been Submitted – ${complaintNumber}`;

  const text = [
    "Dear Customer,",
    "",
    "Your complaint has been successfully reviewed and submitted by our team.",
    "",
    `Complaint ID: ${complaintNumber}`,
    `Product: ${productName}`,
    `Brand: ${brandName}`,
    "Status: Submitted",
    "",
    "You will receive the next follow-up/update shortly.",
    "",
    "Regards,",
    "Product Complaint Portal",
  ].join("\n");

  const html = wrap(
    `<p>Dear Customer,</p>
     <p>Your complaint has been successfully reviewed and submitted by our team.</p>
     ${infoBox([
       { label: "Complaint ID", value: complaintNumber },
       { label: "Product",      value: productName },
       { label: "Brand",        value: brandName },
       { label: "Status",       value: "Submitted" },
     ])}
     <p>You will receive the next follow-up/update shortly.</p>
     <p>Regards,<br/>Product Complaint Portal</p>`
  );

  try {
    await sendEmail({ to: recipient, subject, text, html });
    console.log(`[EMAIL] Admin-submit confirmation sent to ${recipient} for ${complaintNumber}`);
    return { emailSent: true };
  } catch (err: unknown) {
    console.error(`[EMAIL] SMTP Error: Failed to send admin-submit email to ${recipient} for ${complaintNumber}:`, err);
    return { emailSent: false };
  }
}

// ─────────────────────────────────────────────
// 2. COMPLAINT STATUS CHANGED
// ─────────────────────────────────────────────
export async function sendComplaintStatusUpdate(opts: {
  to?: string | null;
  phone?: string | null;
  complaintNumber: string;
  previousStatus: string;
  newStatus: string;
  note?: string;
  changedAt: Date;
}) {
  const {
    complaintNumber,
    previousStatus,
    newStatus,
    note,
    changedAt,
  } = opts;

  const friendlyStatus = newStatus.replace(/_/g, " ");
  const subject = `Complaint Status Updated – ${complaintNumber}`;

  const body = `
    <p>Dear Consumer,</p>
    <p>The status of your complaint has been updated.</p>
    ${infoBox([
      { label: "Complaint ID", value: complaintNumber },
      { label: "Previous Status", value: previousStatus.replace(/_/g, " ") },
      { label: "New Status", value: friendlyStatus },
      { label: "Updated On", value: changedAt.toLocaleString("en-IN") },
      ...(note ? [{ label: "Note", value: note }] : []),
    ])}
    ${ctaButton("Track Your Complaint", `${APP_URL}/track?number=${complaintNumber}`)}
    ${portalFooter()}
  `;

  if (opts.to) {
    try {
      await sendEmail({
        to: opts.to,
        subject,
        text: `Complaint ${complaintNumber} status changed to ${friendlyStatus}.`,
        html: wrap(body),
      });
    } catch (e: unknown) {
      console.error(
        `[EMAIL] Status update email failed for ${complaintNumber}:`,
        e
      );
    }
  }

  if (opts.phone) {
    const smsText = [
      `Complaint ID: ${complaintNumber}`,
      `Status updated to: ${friendlyStatus}`,
      ...(note ? [`Note: ${note}`] : []),
      "- Product Complaint Portal",
    ].join(" | ");
    const result = await sendTransactionalSMS(opts.phone, smsText);
    if (!result.success) {
      console.warn(
        `[SMS] Status update SMS failed for ${complaintNumber}: ${result.error}`
      );
    }
  }
}

// ─────────────────────────────────────────────
// 3. RETURN REQUESTED
// ─────────────────────────────────────────────
export async function sendReturnRequestedEmail(opts: {
  to: string;
  consumerName: string;
  returnNumber: string;
  orderNumber: string;
  productName: string;
  createdAt: Date;
}) {
  const { to, consumerName, returnNumber, orderNumber, productName, createdAt } = opts;
  const subject = `Your Return Request Has Been Confirmed`;

  const body = `
    <p>Hello ${consumerName},</p>
    <p>Your request has been successfully submitted to Product Complaint Portal.</p>
    ${infoBox([
      { label: "Return ID", value: returnNumber },
      { label: "Product", value: productName },
      { label: "Order ID", value: orderNumber || "N/A" },
      { label: "Status", value: "RETURN REQUESTED" },
      { label: "Submitted Date", value: createdAt.toLocaleString("en-IN") },
    ])}
    <p>We have successfully received your return request and it is now under review.</p>
    <p>You can track your complaint status from the Product Complaint Portal.</p>
    <div style="display:flex; gap:10px;">
      ${ctaButton("Track Return", `${APP_URL}/track?q=${returnNumber}`)}
      ${ctaButton("View My Orders", `${APP_URL}/orders`)}
    </div>
    ${portalFooter()}
  `;

  try {
    await sendEmail({ to, subject, text: `Return ${returnNumber} confirmed.`, html: wrap(body) });
  } catch (e: any) {
    console.error(`[EMAIL] Return requested email failed for ${returnNumber}:`, e.message);
  }
}

// ─────────────────────────────────────────────
// 4. PICKUP CONFIRMED (After OTP verified)
// ─────────────────────────────────────────────
export async function sendPickupConfirmedEmail(opts: {
  to: string;
  returnNumber: string;
  complaintNumber: string;
  productName: string;
  pickedUpAt: Date;
}) {
  const { to, returnNumber, complaintNumber, productName, pickedUpAt } = opts;
  const subject = `Return Pickup Confirmed – ${returnNumber}`;

  const body = `
    <p>Dear Consumer,</p>
    <p>Your return pickup has been confirmed and verified successfully.</p>
    ${infoBox([
      { label: "Return ID", value: returnNumber },
      { label: "Complaint ID", value: complaintNumber },
      { label: "Product", value: productName },
      { label: "Picked Up At", value: pickedUpAt.toLocaleString("en-IN") },
      { label: "Status", value: badge("PICKED UP", "#166534", "#dcfce7") },
    ])}
    <p>Your product has been handed over to our pickup agent. Once received at our facility, it will proceed to inspection.</p>
    <p><em>Courier tracking will be available once the shipment is scanned by the courier.</em></p>
    ${ctaButton("Track Your Return", `${APP_URL}/returns/${returnNumber}`)}
    ${portalFooter()}
  `;

  try {
    await sendEmail({ to, subject, text: `Return ${returnNumber} pickup confirmed.`, html: wrap(body) });
  } catch (e: any) {
    console.error(`[EMAIL] Pickup confirmed email failed for ${returnNumber}:`, e.message);
  }
}

// ─────────────────────────────────────────────
// 5. REFUND INITIATED
// ─────────────────────────────────────────────
export async function sendRefundInitiatedEmail(opts: {
  to: string;
  returnNumber: string;
  complaintNumber: string;
  productName: string;
  refundAmount?: number;
}) {
  const { to, returnNumber, complaintNumber, productName, refundAmount } = opts;
  const subject = `Refund Initiated – ${returnNumber}`;

  const body = `
    <p>Dear Consumer,</p>
    <p>Your refund has been initiated for the returned product.</p>
    ${infoBox([
      { label: "Return ID", value: returnNumber },
      { label: "Complaint ID", value: complaintNumber },
      { label: "Product", value: productName },
      ...(refundAmount ? [{ label: "Refund Amount", value: `₹${refundAmount.toFixed(2)}` }] : []),
      { label: "Status", value: badge("REFUND INITIATED", "#1e40af", "#dbeafe") },
    ])}
    <p>The refund will be credited to your original payment method within 5–7 business days.</p>
    ${ctaButton("Track Your Return", `${APP_URL}/returns/${returnNumber}`)}
    ${portalFooter()}
  `;

  try {
    await sendEmail({ to, subject, text: `Refund initiated for Return ${returnNumber}.`, html: wrap(body) });
  } catch (e: any) {
    console.error(`[EMAIL] Refund initiated email failed for ${returnNumber}:`, e.message);
  }
}

// ─────────────────────────────────────────────
// 6. GENERIC RETURN STATUS UPDATE
// ─────────────────────────────────────────────
export async function sendReturnStatusUpdate(opts: {
  to: string;
  returnNumber: string;
  complaintNumber: string;
  productName: string;
  status: string;
  location?: string;
  note?: string;
}) {
  const { to, returnNumber, complaintNumber, productName, status, location, note } = opts;
  const subject = `Return Update – ${returnNumber}: ${status.replace(/_/g, " ")}`;

  const body = `
    <p>Dear Consumer,</p>
    <p>Your return status has been updated.</p>
    ${infoBox([
      { label: "Return ID", value: returnNumber },
      { label: "Complaint ID", value: complaintNumber },
      { label: "Product", value: productName },
      { label: "New Status", value: status.replace(/_/g, " ") },
      ...(location ? [{ label: "Location", value: location }] : []),
      ...(note ? [{ label: "Note", value: note }] : []),
    ])}
    ${ctaButton("Track Your Return", `${APP_URL}/returns/${returnNumber}`)}
    ${portalFooter()}
  `;

  try {
    await sendEmail({ to, subject, text: `Return ${returnNumber} status: ${status}.`, html: wrap(body) });
  } catch (e: any) {
    console.error(`[EMAIL] Return status update email failed for ${returnNumber}:`, e.message);
  }
}
