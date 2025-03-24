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



// import { Resend } from "resend";

// export async function sendEmail({ to, subject, react }) {
//   const resend = new Resend(process.env.RESEND_API_KEY || "");

//   try {
    
//     console.log("Sending email to:", to);
//     console.log("Subject:", subject);
//     console.log("React Component:", react);

    

//     const data = await resend.emails.send({
//       from: "Finance App <onboarding@resend.dev>",
//       to,
//       subject,
//       react,
//     });

//     console.log("resend response ", data);
    
//     return { success: true, data };
//   } catch (error) {
//     console.error("Failed to send email:", error);
//     return { success: false, error };
//   }
// }





// // import { Resend } from "resend";

// // export async function sendEmail({to, subject, react}){
// //     const resend = new Resend(process.env.RESEND_API_KEY||"");
// //     console.log("Sending email to:", to);
// //     console.log("Subject:", subject);
// //     console.log("React Component:", react);

// //     try {
        
// //         const data = await resend.emails.send({
// //             from:"Finance App <onboarding@resend.dev>",
// //             to,
// //             subject,
// //             react
// //         });

// //         console.log("Resend API Response:", data);

// //         return {success:true, data};


// //     } catch (error) {
// //         console.log("failed to send email", error);
// //         return {success:false, error};
        
// //     }

// // }