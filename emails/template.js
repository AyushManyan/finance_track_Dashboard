
// template.js - Convert JSX email template to HTML for Nodemailer

export function generateEmailTemplate({ userName = "", type = "budget-alert", data = {} }) {
  if (type === "budget-alert") {
    return `
      <html>
        <head>
          <style>
            body { background-color: #f6f9fc; font-family: -apple-system, sans-serif; }
            .container { background-color: #ffffff; margin: 0 auto; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
            .title { color: #1f2937; font-size: 32px; font-weight: bold; text-align: center; margin: 0 0 20px; }
            .text { color: #4b5563; font-size: 16px; margin: 0 0 16px; }
            .stats-container { margin: 32px 0; padding: 20px; background-color: #f9fafb; border-radius: 5px; }
            .stat { margin-bottom: 16px; padding: 12px; background-color: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="title">Budget Alert</h1>
            <p class="text">Hello ${userName},</p>
            <p class="text">You’ve used ${data?.percentageUsed.toFixed(1)}% of your monthly budget.</p>
            <div class="stats-container">
              <div class="stat"><p class="text">Budget Amount</p><p class="title">$${data?.budgetAmount}</p></div>
              <div class="stat"><p class="text">Spent So Far</p><p class="title">$${data?.totalExpenses}</p></div>
              <div class="stat"><p class="text">Remaining</p><p class="title">$${data?.budgetAmount - data?.totalExpenses}</p></div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}




// import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
// import * as React from "react";

// export default function EmailTemplate({
//   userName = "",
//   type = "budget-alert",
//   data = {},
// }) {
//     if (type === "monthly-report") {

//     }
//     if (type === "budget-alert") {
//     console.log("Email Template invoked");
//     return (
//       <Html>
//         <><Head /><Preview>Budget Alert</Preview><Body style={styles.body}>
//         <Container style={styles.container}>
//           <Heading style={styles.title}>Budget Alert</Heading>
//           <Text style={styles.text}>Hello {userName},</Text>
//           <Text style={styles.text}>
//             You&rsquo;ve used {data?.percentageUsed.toFixed(1)}% of your
//             monthly budget.
//           </Text>
//           <Section style={styles.statsContainer}>
//             <div style={styles.stat}>
//               <Text style={styles.text}>Budget Amount</Text>
//               <Text style={styles.heading}>${data?.budgetAmount}</Text>
//             </div>
//             <div style={styles.stat}>
//               <Text style={styles.text}>Spent So Far</Text>
//               <Text style={styles.heading}>${data?.totalExpenses}</Text>
//             </div>
//             <div style={styles.stat}>
//               <Text style={styles.text}>Remaining</Text>
//               <Text style={styles.heading}>
//                 ${data?.budgetAmount - data?.totalExpenses}
//               </Text>
//             </div>
//           </Section>
//         </Container>
//       </Body></>
//       </Html>
//     );
//   }
// }



// const styles = {
//     body: {
//       backgroundColor: "#f6f9fc",
//       fontFamily: "-apple-system, sans-serif",
//     },
//     container: {
//       backgroundColor: "#ffffff",
//       margin: "0 auto",
//       padding: "20px",
//       borderRadius: "5px",
//       boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
//     },
//     title: {
//       color: "#1f2937",
//       fontSize: "32px",
//       fontWeight: "bold",
//       textAlign: "center",
//       margin: "0 0 20px",
//     },
//     heading: {
//       color: "#1f2937",
//       fontSize: "20px",
//       fontWeight: "600",
//       margin: "0 0 16px",
//     },
//     text: {
//       color: "#4b5563",
//       fontSize: "16px",
//       margin: "0 0 16px",
//     },
//     section: {
//       marginTop: "32px",
//       padding: "20px",
//       backgroundColor: "#f9fafb",
//       borderRadius: "5px",
//       border: "1px solid #e5e7eb",
//     },
//     statsContainer: {
//       margin: "32px 0",
//       padding: "20px",
//       backgroundColor: "#f9fafb",
//       borderRadius: "5px",
//     },
//     stat: {
//       marginBottom: "16px",
//       padding: "12px",
//       backgroundColor: "#fff",
//       borderRadius: "4px",
//       boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
//     },
//     // row: {
//     //   display: "flex",
//     //   justifyContent: "space-between",
//     //   padding: "12px 0",
//     //   borderBottom: "1px solid #e5e7eb",
//     // },
//     // footer: {
//     //   color: "#6b7280",
//     //   fontSize: "14px",
//     //   textAlign: "center",
//     //   marginTop: "32px",
//     //   paddingTop: "16px",
//     //   borderTop: "1px solid #e5e7eb",
//     // },
//   };