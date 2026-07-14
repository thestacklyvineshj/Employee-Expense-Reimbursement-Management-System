import { CATEGORIES, STATUS_OPTIONS } from '../utils/helpers';

export default function ExpenseFilters({
  filters,
  onChange,
  employees = [],
  showEmployee = false,
  onExport,
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[180px] flex-1">
        <label className="label">Search title</label>
        <input
          className="input-field"
          placeholder="Search expenses..."
          value={filters.search || ''}
          onChange={(e) => set('search', e.target.value)}
        />
      </div>
      <div className="w-full sm:w-40">
        <label className="label">Status</label>
        <select
          className="input-field"
          value={filters.status || ''}
          onChange={(e) => set('status', e.target.value)}
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-44">
        <label className="label">Category</label>
        <select
          className="input-field"
          value={filters.category || ''}
          onChange={(e) => set('category', e.target.value)}
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {showEmployee && (
        <div className="w-full sm:w-48">
          <label className="label">Employee</label>
          <select
            className="input-field"
            value={filters.employee_id || ''}
            onChange={(e) => set('employee_id', e.target.value)}
          >
            <option value="">All</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="w-full sm:w-40">
        <label className="label">Sort by date</label>
        <select
          className="input-field"
          value={filters.order || 'DESC'}
          onChange={(e) => set('order', e.target.value)}
        >
          <option value="DESC">Newest first</option>
          <option value="ASC">Oldest first</option>
        </select>
      </div>
      {onExport && (
        <button type="button" className="btn-secondary" onClick={onExport}>
          Export CSV
        </button>
      )}
    </div>
  );
}
