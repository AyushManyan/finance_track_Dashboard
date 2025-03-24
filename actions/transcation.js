




"use server";

import aj, { checkRateLimit } from "@/lib/arcject";
import { db } from "@/lib/prisma";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
})

export async function createTransaction(data) {
  try {

    const { userId } = await auth();
    if (!userId) throw new Error('User not authenticated');

    // add arject to add rate limiting to this api

    const rateLimit = await checkRateLimit(userId, 10, 3600); // 10 requests per 10 seconds

    if (!rateLimit.allowed) {
      console.error("Rate Limit Exceeded:", rateLimit.reason);
      throw new Error(`${rateLimit.message} Try again in ${rateLimit.retryAfter} seconds.`);
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) throw new Error('User not found');

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      }
    })
    if (!account) throw new Error('Account not found');


    const balanceChange = data.type === 'Expense' ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // this prsima transaction will ensure that the balance is updated correctly
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await db.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null,

        }
      })

      await tx.account.update({
        where: {
          id: account.id
        },
        data: {
          balance: newBalance
        }
      });

      return newTransaction;

    })


    revalidatePath("/dashboard");
    revalidatePath(`account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };




  } catch (error) {
    throw new Error(error.message);
  }
}


// helper function to calculate the next recurring date

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



export async function scanReceipt(file){

  try {
    const model = genAi.getGenerativeModel({model:"gemini-1.5-flash"});

    // convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    // convert array buffer to base64
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    const prompt =`
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData:{
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```(?:json)?\n?/g,"").trim();


    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      throw new Error("Invalid JSON response from AI model");
    
    }



  } catch (error) {

    console.error("Error scanning receipt:", error.message);
    throw new Error("Failed scanning receipt");
    
  }

}