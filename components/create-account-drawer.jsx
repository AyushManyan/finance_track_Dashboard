"use client";
import React, { useState } from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from './ui/drawer'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
 } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';



const CreateAccountDrawer = ({ children }) => {
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: '',
            type: 'CURRENT',
            balance: '',
            isDefault: false
        }
    })

    const onSubmit = async (data) => {
        console.log(data);
        reset();
        setOpen(false);
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Create New Account</DrawerTitle>
                </DrawerHeader>

                <div className='px-4 pb-4'>
                    <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
                        <div className='space-y-4'>
                            <label htmlFor="name" className='text-sm font-medium'>Account Name</label>
                            <Input id="name" placeholder="e.g., Main Checking" {...register("name")} />

                            {errors.name && <p className='text-sm text-red-500 '>{errors.name.message}</p>}
                        </div>
                        <div className='space-y-4'>
                            <label htmlFor="type" className='text-sm font-medium'>Account Type</label>
                            <Select onValueChange={(value) => setValue('type', value)} defaultValues={watch('type')}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Acc. type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT">Current</SelectItem>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>
                                </SelectContent>
                            </Select>

                            {errors.type && <p className='text-sm text-red-500 '>{errors.type.message}</p>}
                        </div>
                        <div className='space-y-4'>
                            <label htmlFor="balnace" className='text-sm font-medium'>Initial Balance</label>
                            <Input id="balnace" placeholder="0.00" type="number" step="0.01" {...register("balnace")} />

                            {errors.balnace && <p className='text-sm text-red-500 '>{errors.balnace.message}</p>}
                        </div>



                        <div className='flexe itmes-center justify-between rounded-lg border p-3'>

                            <div className='space-y-0.5'>

                            <label htmlFor="isDefault" className='text-sm font-medium cursor-pointer'>Set as Default</label>

                            <p className='text-sm text-muted-foreground '>This account will be selected by default for transaction</p>

                            </div>
                            <Switch id='isDefault' onCheckedChange={(checked)=> setValue("isDefault",checked)} defaultValue={watch('isDefault')} />
                            
                        </div>

                        <div className='space-x-4'>
                            <DrawerClose asChild>
                                <Button type="button" variant="outline" className="flex-1 ">Cancel</Button>
                            </DrawerClose>
                            <Button type="submit" className="flex-1 ">Create Account</Button>
                        </div>
                        
                    </form>
                </div>

            </DrawerContent>
        </Drawer>

    )
}

export default CreateAccountDrawer