import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StatCards from '../../components/StatCards';
import ExpenseTable from '../../components/ExpenseTable';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/employee')
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Your overview</h2>
          <p className="text-sm text-ink-500">Track submissions and reimbursement progress</p>
        </div>
        <Link to="/employee/submit" className="btn-primary">
          New expense
        </Link>
      </div>
      <StatCards stats={data?.stats} loading={loading} />
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">Recent expenses</h3>
        <ExpenseTable expenses={data?.recent || []} loading={loading} />
      </section>
      {!loading && data?.stats && (
        <p className="text-sm text-ink-500 animate-fadeUpDelay">
          Approved reimbursements total {formatCurrency(data.stats.total_reimbursement)} as of{' '}
          {formatDate(new Date())}.
        </p>
      )}
    </div>
  );
}
