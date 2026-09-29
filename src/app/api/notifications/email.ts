import nodemailer from 'nodemailer';

// Simple email sender using nodemailer (replace with actual service as needed)
export async function sendComplaintNotification(to: string, subject: string, html: string) {
  // Configure transporter (placeholder configuration)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST ?? 'smtp.example.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER ?? 'user@example.com',
      pass: process.env.EMAIL_PASS ?? 'password',
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'no-reply@yourdomain.com',
    to,
    subject,
    html,
  });

  console.log('Email sent: %s', info.messageId);
}
