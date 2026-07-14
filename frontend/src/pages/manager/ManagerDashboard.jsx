import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StatCards from '../../components/StatCards';
import ExpenseTable from '../../components/ExpenseTable';
import { getErrorMessage } from '../../utils/helpers';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/manager')
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Approval overview</h2>
          <p className="text-sm text-ink-500">Monitor pending reimbursements across the team</p>
        </div>
        <Link to="/manager/approvals" className="btn-primary">
          Open approvals
        </Link>
      </div>
      <StatCards stats={data?.stats} loading={loading} />
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">Pending queue</h3>
        <ExpenseTable expenses={data?.pending || []} loading={loading} showEmployee />
      </section>
    </div>
  );
}
