import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ExpenseFilters from '../../components/ExpenseFilters';
import ExpenseTable from '../../components/ExpenseTable';
import Pagination from '../../components/Pagination';
import { exportToCsv, getErrorMessage } from '../../utils/helpers';

export default function ManagerApprovals() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending',
    category: '',
    employee_id: '',
    sort: 'expense_date',
    order: 'DESC',
    page: 1,
    limit: 8,
  });
  const [data, setData] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);

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

  const closeModal = () => {
    setModal(null);
    setComment('');
  };

  const confirmAction = async () => {
    if (!modal) return;
    if (modal.type === 'reject' && !comment.trim()) {
      toast.error('Rejection comment is required');
      return;
    }
    setActing(true);
    try {
      if (modal.type === 'approve') {
        await api.put(`/expenses/${modal.expense.id}/approve`, {
          manager_comments: comment || undefined,
        });
        toast.success('Expense approved');
      } else {
        await api.put(`/expenses/${modal.expense.id}/reject`, {
          manager_comments: comment,
        });
        toast.success('Expense rejected');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Manager approvals</h2>
        <p className="text-sm text-ink-500">Approve or reject employee expense requests</p>
      </div>
      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        employees={employees}
        showEmployee
        onExport={() =>
          exportToCsv(
            'approvals.csv',
            data.data.map((e) => ({
              employee: e.employee_name,
              title: e.title,
              category: e.category,
              amount: e.amount,
              date: e.expense_date,
              status: e.status,
            }))
          )
        }
      />
      <ExpenseTable
        expenses={data.data}
        loading={loading}
        showEmployee
        actions={(exp) =>
          exp.status === 'pending' ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary !px-2 !py-1 text-xs"
                onClick={() => setModal({ type: 'approve', expense: exp })}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn-danger !px-2 !py-1 text-xs"
                onClick={() => setModal({ type: 'reject', expense: exp })}
              >
                Reject
              </button>
            </div>
          ) : (
            <span className="max-w-[140px] truncate text-xs text-ink-500" title={exp.manager_comments || ''}>
              {exp.manager_comments || '—'}
            </span>
          )
        }
      />
      <Pagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="card-surface w-full max-w-md p-6 animate-fadeUp">
            <h3 className="font-display text-lg font-semibold text-ink-900">
              {modal.type === 'approve' ? 'Approve expense' : 'Reject expense'}
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              {modal.expense.title} — {modal.expense.employee_name}
            </p>
            <label className="label mt-4">
              {modal.type === 'reject' ? 'Rejection comment (required)' : 'Comment (optional)'}
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add feedback for the employee"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={closeModal} disabled={acting}>
                Cancel
              </button>
              <button
                type="button"
                className={modal.type === 'approve' ? 'btn-primary' : 'btn-danger'}
                onClick={confirmAction}
                disabled={acting}
              >
                {acting ? 'Saving...' : modal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
