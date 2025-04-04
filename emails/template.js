
// template.js - Convert JSX email template to HTML for Nodemailer

export function generateEmailTemplate({ userName = "", type = "budget-alert", data = {} }) {

  if (type === "monthly-report") {
    return `
      <html>
      <head>
        <style>
          body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
          }
          .container {
        max-width: 600px;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        margin: auto;
          }
          .title {
        font-size: 22px;
        font-weight: bold;
        text-align: center;
        color: #333;
          }
          .text {
        font-size: 16px;
        margin: 10px 0;
        color: #555;
        font-weight: bold;
          }
          .statsContainer {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 6px;
          }
          .stat {
        text-align: center;
        flex: 1;
        padding: 10px;
          }
          .stat p {
        margin: 5px 0;
        font-weight: bold;
          }
          .stat .amount {
        font-size: 18px;
        font-weight: bold;
        color: #007bff;
          }
          .section {
        margin-top: 25px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 6px;
          }
          .row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #ddd;
          }
          .row:last-child {
        border-bottom: none;
          }
          .footer {
        margin-top: 20px;
        font-size: 14px;
        color: #777;
        text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="title">Monthly Financial Report</h2>
          <p class="text">Hello ${userName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')},</p>
          <p class="text">Here’s your financial summary for <strong>${data?.month}</strong>:</p>
      
          <div class="statsContainer">
        <div class="stat">
          <p class="text">Total Income</p>
          <p class="amount">$${data?.stats.totalIncome}</p>
        </div>
        <div class="stat">
          <p class="text">Total Expenses</p>
          <p class="amount">$${data?.stats.totalExpenses}</p>
        </div>
        <div class="stat">
          <p class="text">Net</p>
          <p class="amount">$${(data?.stats.totalIncome - data?.stats.totalExpenses).toFixed(2)}</p>
        </div>
          </div>
      
          ${data?.stats?.byCategory ? `
        <div class="section">
          <h3 class="title">Expenses by Category</h3>
          ${Object.entries(data.stats.byCategory)
        .map(([category, amount]) => `
          <div class="row">
        <p class="text">${category}</p>
        <p class="text"> - $${(amount).toFixed(2)}</p>
          </div>`)
        .join("")}
        </div>` : ""}
      
          ${data?.insights ? `
        <div class="section">
          <h3 class="title">Wealth Insights</h3>
          ${data.insights.map(insight => `<p class="text">• ${insight}</p>`).join("")}
        </div>` : ""}
      
          <p class="footer">Thank you for using Wealth. Keep tracking your finances for better financial health!</p>
        </div>
      </body>
      </html>
        `;
  }
  

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
