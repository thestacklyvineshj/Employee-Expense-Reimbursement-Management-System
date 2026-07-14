import { formatCurrency } from '../utils/helpers';

export default function StatCards({ stats, loading }) {
  const cards = [
    { label: 'Total Submitted', value: stats?.total_submitted ?? 0, tone: 'from-sky-500/10 to-transparent' },
    { label: 'Pending', value: stats?.pending ?? 0, tone: 'from-amber-500/10 to-transparent' },
    { label: 'Approved', value: stats?.approved ?? 0, tone: 'from-emerald-500/10 to-transparent' },
    { label: 'Rejected', value: stats?.rejected ?? 0, tone: 'from-orange-500/10 to-transparent' },
    {
      label: 'Total Reimbursement',
      value: formatCurrency(stats?.total_reimbursement ?? 0),
      tone: 'from-brand-500/15 to-transparent',
      wide: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card-surface h-28 animate-pulseSoft bg-ink-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, idx) => (
        <div
          key={card.label}
          className={`card-surface relative overflow-hidden p-5 animate-fadeUp bg-gradient-to-br ${card.tone}`}
          style={{ animationDelay: `${idx * 40}ms` }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{card.label}</p>
          <p className="mt-3 font-display text-2xl font-bold text-ink-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
