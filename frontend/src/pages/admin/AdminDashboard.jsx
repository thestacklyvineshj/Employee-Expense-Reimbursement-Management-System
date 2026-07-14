import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StatCards from '../../components/StatCards';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Admin dashboard</h2>
          <p className="text-sm text-ink-500">Organization-wide reimbursement monitoring</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users" className="btn-secondary">
            Manage users
          </Link>
          <Link to="/admin/reports" className="btn-primary">
            View reports
          </Link>
        </div>
      </div>
      <StatCards stats={data?.stats} loading={loading} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-5 animate-fadeUp">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Users</p>
          <p className="mt-2 font-display text-3xl font-bold">{data?.users?.total_users ?? '—'}</p>
          <p className="mt-2 text-sm text-ink-500">
            {data?.users?.employees ?? 0} employees · {data?.users?.managers ?? 0} managers
          </p>
        </div>
        <div className="card-surface p-5 animate-fadeUpDelay lg:col-span-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Top categories
          </p>
          <div className="space-y-2">
            {(data?.byCategory || []).slice(0, 5).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-800">{c.category}</span>
                <span className="text-ink-600">
                  {c.count} · {formatCurrency(c.total)}
                </span>
              </div>
            ))}
            {!loading && !data?.byCategory?.length && (
              <p className="text-sm text-ink-500">No expense data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
