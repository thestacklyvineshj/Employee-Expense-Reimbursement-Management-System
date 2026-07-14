import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  employee: [
    { to: '/employee', label: 'Dashboard', end: true },
    { to: '/employee/expenses', label: 'My Expenses' },
    { to: '/employee/submit', label: 'Submit Expense' },
  ],
  manager: [
    { to: '/manager', label: 'Dashboard', end: true },
    { to: '/manager/approvals', label: 'Approvals' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/expenses', label: 'All Expenses' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/reports', label: 'Reports' },
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-ink-100 bg-ink-900 text-white lg:border-b-0 lg:border-r lg:border-ink-800">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">Expensly</p>
            <p className="mt-0.5 text-xs text-ink-300">Expense Reimbursement</p>
          </div>
          <button type="button" className="btn-secondary lg:hidden" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible lg:px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-ink-200 hover:bg-ink-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-ink-800 px-5 py-4 lg:block">
          <p className="font-medium text-white">{user?.name}</p>
          <p className="text-xs capitalize text-ink-300">{user?.role}</p>
          <button type="button" onClick={handleLogout} className="btn-secondary mt-3 w-full">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-8">
          <div>
            <h1 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">
              {user?.role === 'admin' && 'Admin Console'}
              {user?.role === 'manager' && 'Manager Workspace'}
              {user?.role === 'employee' && 'Employee Portal'}
            </h1>
            <p className="text-sm text-ink-500">Signed in as {user?.email}</p>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
