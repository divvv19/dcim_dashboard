export default function UnsupportedMetricsList({ metrics = [] }) {
  if (!metrics.length) {
    return <span className="text-xs text-emerald-300">All mapped</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map((metric) => (
        <span
          key={metric}
          className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-200"
        >
          {metric}
        </span>
      ))}
    </div>
  );
}
