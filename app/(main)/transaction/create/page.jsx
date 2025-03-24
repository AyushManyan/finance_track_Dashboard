import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/categories';
import React from 'react'
import AddTranscationForm from '../_component/transcation-form';
import { getTransactions } from '@/actions/transcation';

const AddTranscationPage = async({searchParams}) => {
    const accounts = await getUserAccounts();

    const editId = searchParams?.edit;

    let initialData = null;
    if(editId){
      const transaction = await getTransactions(editId);
      initialData = transaction;
    }
    

  return (
    <div className='max-w-3xl mx-auto px-5'>
        <h1 className='text-5xl gradient-title mb-8'>{editId ? "Edit": "Add"} Transaction</h1>

        <AddTranscationForm
            accounts={accounts}
            categories={defaultCategories}
            editMode={!!editId}
            initialData={initialData}
        />
    </div>
  )
}

export default AddTranscationPage