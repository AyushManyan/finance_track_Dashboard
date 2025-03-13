"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/dist/types/server";
import { revalidatePath } from "next/cache";



const serializeTransaction = (obj) => {
    const serialized = {...obj};
    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }
}


export async function createAccount(data){
    try {
        const {userId} = await auth();
        if(!userId) throw new Error('Unauthorized');

        const user  = await db.user.findUnique({
            where: {
                id: userId
            }
        });
        if(!user) throw new Error('user not found');

        // convert balance to float before saving
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)) throw new Error('Invalid balance');

        // check if this is the user;s first account    
        const existingAccounts = await db.account.findUnique({
            where:{
                userId: userId
            }
        });

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

        // if this account should be default, make all other accounts not default
        if(shouldBeDefault){
            await db.account.updateMany({
                where:{
                    userId: userId,
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

        throw new Error(error.message);
        
    }
}