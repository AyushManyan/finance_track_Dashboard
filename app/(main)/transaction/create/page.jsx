import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/categories';
import React from 'react'
import AddTranscationForm from '../_component/transcation-form';

const AddTranscationPage = async() => {
    const accounts = await getUserAccounts();
  return (
    <div className='max-w-3xl mx-auto px-5'>
        <h1 className='text-5xl gradient-title mb-8'>Add Transaction</h1>

        <AddTranscationForm
            accounts={accounts}
            categories={defaultCategories}
        />
    </div>
  )
}

export default AddTranscationPage