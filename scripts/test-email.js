// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log("\n==========================================");
  console.log("       TESTING GMAIL SMTP CONFIGURATION   ");
  console.log("==========================================\n");

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`[CONFIG] Host: ${host}`);
  console.log(`[CONFIG] Port: ${port}`);
  console.log(`[CONFIG] User: ${user}`);
  console.log(`[CONFIG] Pass: ${pass ? "******** (Set)" : "MISSING!"}`);
  console.log(`[CONFIG] Secure Mode: ${port === 465 ? "True (SSL)" : "False (STARTTLS)"}\n`);

  if (!pass || pass.includes("paste-your") || pass.length < 10) {
    console.error("❌ ERROR: SMTP_PASS in .env is missing or invalid.");
    console.error("   You MUST generate a Gmail App Password and paste it into .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  try {
    console.log("⏳ Attempting to connect to Gmail servers...");
    await transporter.verify();
    console.log("✅ SUCCESS: Connected and authenticated with Gmail successfully!\n");
    
    console.log("⏳ Sending test email to yourself...");
    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: user,
      subject: "TrustPortal - SMTP Test Successful",
      text: "If you are reading this, your Gmail SMTP configuration in .env is 100% correct!"
    });
    console.log("✅ SUCCESS: Test email sent! Check your inbox.");
    
  } catch (err) {
    console.error("\n❌ FAILED TO CONNECT OR SEND EMAIL:");
    console.error(err.message);
    if (err.message.includes("Invalid login")) {
      console.error("\n💡 FIX: Your Gmail App Password is wrong or missing.");
    }
  }
}

testSMTP();
