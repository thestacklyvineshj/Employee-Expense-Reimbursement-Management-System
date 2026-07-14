import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

export default function Login() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await login(form.email, form.password);
      toast.success('Welcome back');
      navigate(`/${u.role}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
      </div>
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft lg:grid-cols-2">
        <div className="relative hidden bg-ink-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="font-display text-3xl font-bold tracking-tight">Expensly</p>
            <p className="mt-3 max-w-sm text-ink-300">
              Submit, approve, and track employee expense reimbursements in one secure workspace.
            </p>
          </div>
          <div className="space-y-3 text-sm text-ink-300">
            <p>Role-based workflows for employees, managers, and admins.</p>
            <p>Dashboard analytics · Approval trail · Monthly reports</p>
          </div>
        </div>
        <div className="p-8 sm:p-10">
          <h1 className="font-display text-2xl font-bold text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-ink-500">Use your work credentials to continue</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-500">
            New employee?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">
              Create an account
            </Link>
          </p>
          <div className="mt-6 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
            <p className="font-semibold text-ink-800">Demo accounts</p>
            <p>admin@expense.com / Admin@123</p>
            <p>manager@expense.com / Manager@123</p>
            <p>employee@expense.com / Employee@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
