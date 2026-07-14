import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeExpenses from './pages/employee/EmployeeExpenses';
import SubmitExpense from './pages/employee/SubmitExpense';
import EditExpense from './pages/employee/EditExpense';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerApprovals from './pages/manager/ManagerApprovals';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';

function HomeRedirect() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute roles={['employee']} />}>
            <Route element={<AppLayout />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/expenses" element={<EmployeeExpenses />} />
              <Route path="/employee/submit" element={<SubmitExpense />} />
              <Route path="/employee/expenses/:id/edit" element={<EditExpense />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['manager']} />}>
            <Route element={<AppLayout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/approvals" element={<ManagerApprovals />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/expenses" element={<AdminExpenses />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
