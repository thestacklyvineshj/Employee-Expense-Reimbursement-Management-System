import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ExpenseFilters from '../../components/ExpenseFilters';
import ExpenseTable from '../../components/ExpenseTable';
import Pagination from '../../components/Pagination';
import { exportToCsv, getErrorMessage } from '../../utils/helpers';

export default function AdminExpenses() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    employee_id: '',
    sort: 'expense_date',
    order: 'DESC',
    page: 1,
    limit: 10,
  });
  const [data, setData] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/employees').then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">All expenses</h2>
        <p className="text-sm text-ink-500">Search and filter every reimbursement request</p>
      </div>
      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        employees={employees}
        showEmployee
        onExport={() =>
          exportToCsv(
            'all-expenses.csv',
            data.data.map((e) => ({
              employee: e.employee_name,
              title: e.title,
              category: e.category,
              amount: e.amount,
              date: e.expense_date,
              status: e.status,
              comments: e.manager_comments,
            }))
          )
        }
      />
      <ExpenseTable expenses={data.data} loading={loading} showEmployee />
      <Pagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </div>
  );
}
