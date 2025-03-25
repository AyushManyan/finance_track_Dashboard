"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

const colors = ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0', '#FFC107', '#00BCD4', '#8BC34A'];


const DashboardOverview = ({ accounts, transactions }) => {

    const [selectedAccountId, setSelectedAccountId] = useState(
        accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
    );

    // filter transactions by selected account
    const accountTransactions = transactions.filter((t) => t.accountId === selectedAccountId);

    const recentTransactions = accountTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    // calculate expense breakdown for current month
    const currentDate = new Date();
    const currentMonthExpenses = accountTransactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
            t.type === 'EXPENSE' &&
            transactionDate.getMonth() === currentDate.getMonth() &&
            transactionDate.getFullYear() === currentDate.getFullYear()
        )
    });

    // group expenses by category
    const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
    }, {});

    // format data for pie chart
    const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: amount,
    }));

    return (
        <div className='grid md:grid-cols-2 gap-4 overflow-auto'>
            <Card>
                <CardHeader className="flex flex-row justify-between items-center spacce-y-0 pb-4">
                    <CardTitle className="text-base font-normal">Recent Transactions</CardTitle>

                    <Select
                        value={selectedAccountId}
                        onValueChange={setSelectedAccountId}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id}
                                    value={account.id}
                                >{account.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>



                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {recentTransactions.length === 0 ? (
                            <p className="text-muted-foreground py-4">No transactions found</p>
                        ) : (
                            <div className="space-y-4">
                                {recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className="flex flex-row justify-between items-center">

                                        <div className="space-y-1">
                                            <p>{transaction.description || "Untitled Transaction"}</p>
                                            <p className='text-sm text-muted-foreground'>
                                                {format(new Date(transaction.date), 'PP')}
                                            </p>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <div className={cn("flex items-center", transaction.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500')}>
                                                {
                                                    transaction.type === 'EXPENSE' ? (
                                                        <ArrowDownRight className="w-4 h-4 mr-1" />
                                                    ) : (
                                                        <ArrowUpRight className="w-4 h-4 mr-1" />
                                                    )
                                                }
                                                ${transaction.amount.toFixed(2)}
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>

            </Card>


            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-normal">Monthly Expense Breakdown </CardTitle>
                </CardHeader>
                <CardContent className="p-0 ob-5">
                    {
                        pieChartData.length === 0 ? (
                            <p className="text-muted-foreground py-4">No expenses this month</p>
                        ) : (
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">

                                    <PieChart >
                                        <Pie data={pieChartData} 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={80} 
                                        fill='#8884d8'
                                        dataKey="value"
                                        label ={({name, value}) => `${name} - $${value.toFixed(2)}`}>
                                            {
                                                pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={colors[index%colors.length]} />
                                                ))
                                            }
                                        </Pie>
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )
                    }
                </CardContent>

            </Card>

        </div>
    )
}

export default DashboardOverview