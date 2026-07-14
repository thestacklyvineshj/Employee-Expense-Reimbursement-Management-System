import { useState } from 'react';
import { CATEGORIES } from '../utils/helpers';

const empty = {
  title: '',
  category: 'Travel',
  amount: '',
  expense_date: '',
  description: '',
  receipt: '',
};

export default function ExpenseForm({ initial = null, onSubmit, submitting }) {
  const [form, setForm] = useState({
    ...empty,
    ...initial,
    amount: initial?.amount ?? '',
    expense_date: initial?.expense_date
      ? String(initial.expense_date).slice(0, 10)
      : '',
  });
  const [fileName, setFileName] = useState(initial?.receipt || '');
  const [errors, setErrors] = useState({});

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.category) next.category = 'Category is required';
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Enter a valid amount';
    if (!form.expense_date) next.expense_date = 'Expense date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      amount: Number(form.amount),
      receipt: fileName || form.receipt || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6 animate-fadeUp">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Expense Title</label>
          <input
            className="input-field"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Client travel"
          />
          {errors.title && <p className="mt-1 text-xs text-orange-700">{errors.title}</p>}
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Amount (INR)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
          {errors.amount && <p className="mt-1 text-xs text-orange-700">{errors.amount}</p>}
        </div>
        <div>
          <label className="label">Expense Date</label>
          <input
            type="date"
            className="input-field"
            value={form.expense_date}
            onChange={(e) => set('expense_date', e.target.value)}
          />
          {errors.expense_date && (
            <p className="mt-1 text-xs text-orange-700">{errors.expense_date}</p>
          )}
        </div>
        <div>
          <label className="label">Receipt (mock upload)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            className="input-field"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setFileName(file ? file.name : '');
            }}
          />
          {(fileName || form.receipt) && (
            <p className="mt-2 text-xs text-ink-500">
              Selected: <span className="font-medium text-ink-800">{fileName || form.receipt}</span>
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea
            rows={3}
            className="input-field"
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Brief description of the expense"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Update Expense' : 'Submit Expense'}
        </button>
      </div>
    </form>
  );
}
