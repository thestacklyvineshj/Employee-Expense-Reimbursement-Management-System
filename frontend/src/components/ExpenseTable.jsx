import { formatCurrency, formatDate, statusClass } from '../utils/helpers';

export default function ExpenseTable({
  expenses,
  loading,
  showEmployee = false,
  actions,
}) {
  if (loading) {
    return (
      <div className="card-surface flex h-48 items-center justify-center text-ink-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!expenses?.length) {
    return (
      <div className="card-surface flex h-40 items-center justify-center text-ink-500">
        No expenses found.
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              {showEmployee && <th className="px-4 py-3 font-semibold">Employee</th>}
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Receipt</th>
              {actions && <th className="px-4 py-3 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {expenses.map((exp) => (
              <tr key={exp.id} className="transition hover:bg-ink-50/60">
                {showEmployee && (
                  <td className="px-4 py-3 font-medium text-ink-800">{exp.employee_name}</td>
                )}
                <td className="px-4 py-3">
                  <p className="font-medium text-ink-900">{exp.title}</p>
                  {exp.description && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-ink-500">{exp.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-700">{exp.category}</td>
                <td className="px-4 py-3 font-semibold text-ink-900">{formatCurrency(exp.amount)}</td>
                <td className="px-4 py-3 text-ink-700">{formatDate(exp.expense_date)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass(
                      exp.status
                    )}`}
                  >
                    {exp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-600">{exp.receipt || '—'}</td>
                {actions && <td className="px-4 py-3">{actions(exp)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
