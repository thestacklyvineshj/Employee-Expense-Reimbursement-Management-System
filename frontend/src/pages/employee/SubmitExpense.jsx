import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ExpenseForm from '../../components/ExpenseForm';
import { getErrorMessage } from '../../utils/helpers';

export default function SubmitExpense() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await api.post('/expenses', payload);
      toast.success('Expense submitted');
      navigate('/employee/expenses');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Submit expense</h2>
        <p className="text-sm text-ink-500">Attach a receipt filename and send for manager approval</p>
      </div>
      <ExpenseForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
