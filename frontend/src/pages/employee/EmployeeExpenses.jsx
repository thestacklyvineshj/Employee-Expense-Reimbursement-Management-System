import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ExpenseFilters from '../../components/ExpenseFilters';
import ExpenseTable from '../../components/ExpenseTable';
import Pagination from '../../components/Pagination';
import { exportToCsv, getErrorMessage } from '../../utils/helpers';

export default function EmployeeExpenses() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    sort: 'expense_date',
    order: 'DESC',
    page: 1,
    limit: 8,
  });
  const [data, setData] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/expenses', { params: filters });
      setData(res);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, filters.search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, filters.search]);

  const cancelExpense = async (id) => {
    if (!window.confirm('Cancel this pending expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense cancelled');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">My expenses</h2>
          <p className="text-sm text-ink-500">Search, filter, and manage your submissions</p>
        </div>
        <Link to="/employee/submit" className="btn-primary">
          Submit expense
        </Link>
      </div>
      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        onExport={() =>
          exportToCsv(
            'my-expenses.csv',
            data.data.map((e) => ({
              title: e.title,
              category: e.category,
              amount: e.amount,
              date: e.expense_date,
              status: e.status,
              receipt: e.receipt,
            }))
          )
        }
      />
      <ExpenseTable
        expenses={data.data}
        loading={loading}
        actions={(exp) =>
          exp.status === 'pending' ? (
            <div className="flex flex-wrap gap-2">
              <Link to={`/employee/expenses/${exp.id}/edit`} className="btn-secondary !px-2 !py-1 text-xs">
                Edit
              </Link>
              <button
                type="button"
                className="btn-danger !px-2 !py-1 text-xs"
                onClick={() => cancelExpense(exp.id)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <span className="text-xs text-ink-400">—</span>
          )
        }
      />
      <Pagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </div>
  );
}
