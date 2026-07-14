import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { exportToCsv, formatCurrency, getErrorMessage } from '../../utils/helpers';

const COLORS = ['#317e6a', '#256455', '#b45309', '#c2410c', '#667690', '#0ea5e9'];

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const monthly = [...(data?.monthly || [])].reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Monthly reports</h2>
          <p className="text-sm text-ink-500">Expense trends by month, category, and status</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            exportToCsv(
              'monthly-report.csv',
              (data?.monthly || []).map((m) => ({
                month: m.month,
                count: m.count,
                total_amount: m.total_amount,
                approved_amount: m.approved_amount,
              }))
            )
          }
        >
          Export monthly CSV
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="mb-4 font-display font-semibold text-ink-900">Monthly expense volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="total_amount" name="Total amount" fill="#317e6a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="approved_amount" name="Approved" fill="#76bba6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="mb-4 font-display font-semibold text-ink-900">By category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.byCategory || []}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category }) => category}
                >
                  {(data?.byCategory || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Requests</th>
              <th className="px-4 py-3">Total amount</th>
              <th className="px-4 py-3">Approved amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {(data?.monthly || []).map((m) => (
              <tr key={m.month}>
                <td className="px-4 py-3 font-medium">{m.month}</td>
                <td className="px-4 py-3">{m.count}</td>
                <td className="px-4 py-3">{formatCurrency(m.total_amount)}</td>
                <td className="px-4 py-3">{formatCurrency(m.approved_amount)}</td>
              </tr>
            ))}
            {!data?.monthly?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-500">
                  No monthly data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
