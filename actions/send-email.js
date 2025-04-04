"use server";
// send-email.js - Using Nodemailer instead of Resend

import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email provider (or SMTP settings)
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password (use an app password, not your regular password)
    },
  });

  try {
    // console.log("Sending email to:", to);
    // console.log("Subject:", subject);

    const mailOptions = {
      from: `Finance App <${process.env.EMAIL_USER}>`, // Use your verified domain email
      to,
      subject,
      html, // Send HTML content instead of JSX
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log("Nodemailer response", info);
    return { success: true, data: info };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
