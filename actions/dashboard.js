"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";



const serializeTransaction = (obj) => {
    const serialized = { ...obj };
    if (obj.balance) {
      serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount) {
      serialized.amount = obj.amount.toNumber();
    }
    return serialized;
  };

  



export async function createAccount(data){
    try {
        const {userId} = await auth();
        if(!userId) throw new Error('Unauthorized');

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
          });

        console.log('User:', user);
        
        if(!user) throw new Error('user not found');

        // convert balance to float before saving
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)) throw new Error('Invalid balance');

        // check if this is the user;s first account    
        const existingAccounts = await db.account.findMany({
            where: {
                userId: user.id
            }
        });

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

        // if this account should be default, make all other accounts not default
        if(shouldBeDefault){
            await db.account.updateMany({
                where:{
                    userId: user.id,
                    isDefault: true,
                },
                data:{
                    isDefault: false
                }
            });
        }

        // create account
       const account = await db.account.create({
           data:{
               ...data,
               balance: balanceFloat,
               userId: user.id,
               isDefault: shouldBeDefault,
           }
       }); 


        const serializedAccount = serializeTransaction(account);
        
        revalidatePath("/dashboard");   

        return {success : true, data: serializedAccount};

    } catch (error) {
        console.error("dashboard.js");
        throw new Error(error.message);
        
    }
}


export async function getUserAccounts(){
    const {userId} = await auth();
    if(!userId) throw new Error('Unauthorized');

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });

    if(!user) throw new Error('User not found');

    const accounts = await db.account.findMany({
        where: {
            userId: user.id
        },
        orderBy:{
            createdAt: 'desc'
        },
        include:{
            _count:{
                select:{
                    transactions:true
                }
            }
        }
    });

    const serializedAccounts = accounts.map(serializeTransaction);
    return serializedAccounts;
}


export async function getDashboardData(){
    const {userId} = await auth();
    if(!userId) throw new Error('Unauthorized');

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });

    if(!user) throw new Error('User not found');

    const transactions = await db.transaction.findMany({
        where: {
            userId: user.id
        },
        orderBy:{
            createdAt: 'desc'
        }
    });

    return transactions.map(serializeTransaction);

}