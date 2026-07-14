import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ExpenseForm from '../../components/ExpenseForm';
import { getErrorMessage } from '../../utils/helpers';

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/expenses/${id}`)
      .then((res) => {
        if (res.data.status !== 'pending') {
          toast.error('Only pending expenses can be edited');
          navigate('/employee/expenses');
          return;
        }
        setExpense(res.data);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate('/employee/expenses');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await api.put(`/expenses/${id}`, payload);
      toast.success('Expense updated');
      navigate('/employee/expenses');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Edit expense</h2>
        <p className="text-sm text-ink-500">Update details while the request is still pending</p>
      </div>
      {expense && <ExpenseForm initial={expense} onSubmit={handleSubmit} submitting={submitting} />}
    </div>
  );
}
