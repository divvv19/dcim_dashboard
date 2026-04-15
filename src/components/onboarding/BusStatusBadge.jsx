const BUS_STATUS_STYLES = {
  healthy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  busy: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  error: 'border-red-500/30 bg-red-500/10 text-red-200',
};

function getBusStatus(bus) {
  if (bus.lastError) {
    return 'error';
  }

  if (bus.inFlight) {
    return 'busy';
  }

  return 'healthy';
}

export default function BusStatusBadge({ bus }) {
  const status = getBusStatus(bus);
  const label = status === 'error' ? 'Attention' : status === 'busy' ? 'Polling' : 'Ready';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${BUS_STATUS_STYLES[status]}`}>
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      <span>{bus.name}</span>
      <span className="text-[10px] uppercase tracking-[0.25em] opacity-70">{label}</span>
    </div>
  );
}
