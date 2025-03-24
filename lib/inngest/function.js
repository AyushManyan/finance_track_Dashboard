
// function.js - Updated to use Nodemailer

import { generateEmailTemplate } from "@/emails/template";
import { db } from "../prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import { err } from "inngest/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
    { name: "Check Budget Alerts" },
    { cron: "0 */6 * * *" }, // Every 6 hours
    async ({ step }) => {
        const budgets = await step.run("fetch-budgets", async () => {
            return await db.budget.findMany({
                include: {
                    user: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        for (const budget of budgets) {
            const defaultAccount = budget.user.accounts[0];
            if (!defaultAccount) continue; // Skip if no default account

            await step.run(`check-budget-${budget.id}`, async () => {
                const startDate = new Date();
                startDate.setDate(1); // Start of current month

                // Calculate total expenses for the default account only
                const expenses = await db.transaction.aggregate({
                    where: {
                        userId: budget.userId,
                        accountId: defaultAccount.id, // Only consider default account
                        type: "EXPENSE",
                        date: {
                            gte: startDate,
                        },
                    },
                    _sum: {
                        amount: true,
                    },
                });

                const totalExpenses = expenses._sum.amount?.toNumber() || 0;
                const budgetAmount = budget.amount;
                const percentageUsed = (totalExpenses / budgetAmount) * 100;

                console.log("percentageUsed: ", percentageUsed);

                if (
                    percentageUsed >= 80 && // Default threshold of 80%
                    (!budget.lastAlertSent ||
                      isNewMonth(new Date(budget.lastAlertSent), new Date()))
                ) {
                    console.log("Sending budget alert email...");
                    
                    // ✅ Ensure we send only once & update lastAlertSent BEFORE sending the email
                    await db.budget.update({
                        where: { id: budget.id },
                        data: { lastAlertSent: new Date() },
                    });

                    await sendEmail({
                        to: budget.user.email,
                        subject: `Budget Alert for ${defaultAccount.name}`,
                        html: generateEmailTemplate({
                            userName: budget.user.name,
                            type: "budget-alert",
                            data: {
                                percentageUsed,
                                budgetAmount: parseInt(budgetAmount).toFixed(1),
                                totalExpenses: parseInt(totalExpenses).toFixed(1),
                                accountName: defaultAccount.name,
                            },
                        }),
                    });

                    console.log("sendEmail function invoked.");
                }
            });
        }

        // ✅ Mark function as complete
        console.log("Function execution completed.");
        return { success: true };
    }
);



function isNewMonth(lastAlertDate, currentDate) {
    return lastAlertDate.getMonth() !== currentDate.getMonth() || lastAlertDate.getFullYear() !== currentDate.getFullYear();
}



export const triggerRecurringTransactions = inngest.createFunction(
    {
        id: "trigger-recurring-transactions",
        name: "Trigger Recurring Transactions",
    },
    {
        cron: "0 0 * * *", // Every day at midnight
    },
    async ({ step }) => {
        const recurringTransactions = await step.run("fetch-recurring-transactions",
            async () => {
            return await db.transaction.findMany({
                where: {
                    isRecurring: true,
                    status:"COMPLETED",
                    OR:[
                        {lastProcessed:null},// never processed
                        {nextRecurringDate:{
                            lte: new Date()
                            }
                        }
                    ],
                },
            });
        });

        // 2. create event for each recurring transaction

        if(recurringTransactions.length >0){
            const events = recurringTransactions.map((transaction) => ({
            
                    name: "transaction.recurring.process",
                    data: {
                        transactionId: transaction.id,
                        userId: transaction.userId,
                    },
            
            }));

            // 3. Send events to Inngest
            await inngest.send(events);

        }
        return {triggered: recurringTransactions.length};
    }
);


export const processRecurringTransaction = inngest.createFunction(
    {
        id: "process-recurring-transaction",
        throttle:{
            limit:10,
            period: "1m",
            key:"event.data.userId"
        },

    },
    {event:"transaction.recurring.process"},

    async ({event, step}) => {
        // validate event
        if(!event?.data?.transactionId || !event?.data?.userId){
            console.error("Invalid event data", event);
            return{error: "Invalid event data"};
        }

        await step.run("process-transaction", async () => {
            const transaction  = await db.transaction.findUnique({
                where: {
                    id: event.data.transactionId,
                    userId: event.data.userId,
                },
                include:{
                    account:true,
                }
            });

            if(!transaction || !isTransactionDue(transaction)) return;

            await db.$transaction(async(tx)=>{
                // create new transaction
                await tx.transaction.create({
                    data:{
                        type: transaction.type,
                        amount: transaction.amount,
                        description:`${transaction.description} (Recurring)`,
                        date: new Date(),
                        category: transaction.category,
                        userId: transaction.userId,
                        accountId: transaction.accountId,
                        isRecurring: false,
                        
                    },
                });

                // update the balance
                const balanceChange = transaction.type === "EXPENSE" ? -transaction.amount.toNumber() : transaction.amount.toNumber();

                await tx.account.update({
                    where: {
                        id: transaction.accountId,
                    },
                    data:{
                        balance:{
                            increment: balanceChange,
                        },
                    },
                });


                // update the lastProcessed and nextRecurringDate
                await tx.transaction.update({
                    where: {
                        id: transaction.id,
                    },
                    data:{
                        lastProcessed: new Date(),
                        nextRecurringDate: calculateNextRecurringDate(
                            new Date(),
                            transaction.recurringInterval
                        ),
                    },
                });

            })

        });
            
    }
)

function isTransactionDue(transaction){
    // If no lastProcessed date, then it's due
    if(!transaction.lastProcessed) return true;

    const today = new Date();
    const nextDue = new Date(transaction.nextRecurringDate);

    // compare today's date with nextRecurringDate
    return nextDue <= today;
}


function calculateNextRecurringDate(startDate, interval) {
    const date = new Date(startDate);
    switch (interval) {
      case 'DAILY':
        date.setDate(date.getDate() + 1);
        break;
      case 'WEEKLY':
        date.setDate(date.getDate() + 7);
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }


export const generateMonthlyReports = inngest.createFunction(
    {
        id: "generate-monthly-reports",
        name: "Generate Monthly Reports",
    },
    {
        cron: "0 0 1 * *", // Every month on the 1st day
    },
    async ({step})=>{
        const users = await step.run("fetch-users", async () => {
            return await db.user.findMany({
                include: {
                    accounts: true,
                },
            });
        });

        for(const user of users){
            await step.run(`generate-report-${user.id}`, async () => {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);

                const stats = await getMonthlyStats(user.id, lastMonth);
                const monthName = lastMonth.toLocaleString("default", { month: "long" });

                const insights = await generateFinancialInsights(stats , monthName);

                // console.log("insights: ", insights);
                

                await sendEmail({
                    to: user.email,
                    subject: `Your Monthly Financial Report - ${monthName}`,
                    html: generateEmailTemplate({
                        userName: user.name,
                        type: "monthly-report",
                        data: {
                            stats,
                            month: monthName,
                            insights,
                        },
                    }),
                });
            })
        }

        return {processed: users.length};
    }
);

async function generateFinancialInsights(stats, month){
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model:"gemini-1.5-flash"});

    const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    
    const result = await model.generateContent(prompt);
    const reponse = await result.response;
    const text = reponse.text();
    const cleanedText = text.replace(/```(?:json)?\n/g, "").trim();
    // console.log("cleanedText: ", cleanedText);
    
    return JSON.parse(cleanedText);
    
  } catch (error) {

    console.error("Failed to generate insights", error);
    return [
        "Your highest expense category this month might need attentions.",
        "Consider setting up a budget for better financial management.",
        "Track your recurring expenses to identify potential savings. "
    ]
    
    
  }

}





const getMonthlyStats=async(userId , month)=>{
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const transactions = await db.transaction.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    return transactions.reduce(
        (stats, t)=>{
            const amount = t.amount.toNumber();
            if(t.type === "EXPENSE"){
                stats.totalExpenses += amount;
                stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
            }else{
                stats.totalIncome += amount;
            }
            return stats;
        },
        {
            totalExpenses: 0,
            totalIncome: 0,
            byCategory: {},
            transactionCount: transactions.length,
        }
    )
     
}



// import { db } from "../prisma";
// import { inngest } from "./client";
// import { sendEmail } from "@/actions/send-email";
// import EmailTemplate from "@/emails/template";


// // 3. Budget Alerts with Event Batching
// export const checkBudgetAlerts = inngest.createFunction(
//     { name: "Check Budget Alerts" },
//     { cron: "0 */6 * * *" }, // Every 6 hours
//     async ({ step }) => {
//         const budgets = await step.run("fetch-budgets", async () => {
//             return await db.budget.findMany({
//                 include: {
//                     user: {
//                         include: {
//                             accounts: {
//                                 where: {
//                                     isDefault: true,
//                                 },
//                             },
//                         },
//                     },
//                 },
//             });
//         });

//         for (const budget of budgets) {
//             const defaultAccount = budget.user.accounts[0];
//             if (!defaultAccount) continue; // Skip if no default account

//             await step.run(`check-budget-${budget.id}`, async () => {
//                 const startDate = new Date();
//                 startDate.setDate(1); // Start of current month

//                 // Calculate total expenses for the default account only
//                 const expenses = await db.transaction.aggregate({
//                     where: {
//                         userId: budget.userId,
//                         accountId: defaultAccount.id, // Only consider default account
//                         type: "EXPENSE",
//                         date: {
//                             gte: startDate,
//                         },
//                     },
//                     _sum: {
//                         amount: true,
//                     },
//                 });

//                 const totalExpenses = expenses._sum.amount?.toNumber() || 0;
//                 const budgetAmount = budget.amount;
//                 const percentageUsed = (totalExpenses / budgetAmount) * 100;

//                 // Check if we should send an alert
//                 console.log("before if statement...");
//                 console.log("percentageUsed: ", percentageUsed);
                
//                 if (
//                     percentageUsed >= 80 && // Default threshold of 80%
//                     (!budget.lastAlertSent ||
//                       isNewMonth(new Date(budget.lastAlertSent), new Date()))
//                   ) {
//                     await sendEmail({
//                       to: budget.user.email,
//                       subject: `Budget Alert for ${defaultAccount.name}`,
//                       react: EmailTemplate({
//                         userName: budget.user.name,
//                         type: "budget-alert",
//                         data: {
//                           percentageUsed,
//                           budgetAmount: parseInt(budgetAmount).toFixed(1),
//                           totalExpenses: parseInt(totalExpenses).toFixed(1),
//                           accountName: defaultAccount.name,
//                         },
//                       }),
//                     });
                    
//                     console.log("sendEmail function invoked.");
//                     // Update last alert sent
//                     await db.budget.update({
//                         where: { id: budget.id },
//                         data: { lastAlertSent: new Date() },
//                     });
//                 }
//             });
//         }
//     }
// );

// function isNewMonth(lastAlertDate, currentDate) {
//     return lastAlertDate.getMonth() !== currentDate.getMonth() || lastAlertDate.getFullYear() !== currentDate.getFullYear();
// }
