const FRESHNESS_STYLES = {
  fresh: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  stale: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  offline: 'border-red-500/30 bg-red-500/10 text-red-200',
  unknown: 'border-slate-600/60 bg-slate-700/30 text-slate-300',
};

export default function FreshnessBadge({ freshness = 'unknown' }) {
  const value = FRESHNESS_STYLES[freshness] ? freshness : 'unknown';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${FRESHNESS_STYLES[value]}`}>
      {value}
    </span>
  );
}
