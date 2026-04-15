import BusStatusBadge from './BusStatusBadge';
import FreshnessBadge from './FreshnessBadge';
import UnsupportedMetricsList from './UnsupportedMetricsList';

function formatTimestamp(value) {
  if (!value) {
    return 'No sample yet';
  }

  return new Date(value).toLocaleString();
}

export default function DeviceInventoryPanel({ inventory, isConnected }) {
  const devices = inventory?.devices ?? [];
  const buses = inventory?.buses ?? [];
  const summary = inventory?.summary ?? {
    totalDevices: 0,
    onlineDevices: 0,
    pendingDevices: 0,
    offlineDevices: 0,
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
      <section className="rounded-3xl border border-slate-700/60 bg-slate-900/75 p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Bus Runtime</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">RS485 Fleet</h3>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${isConnected ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
            {isConnected ? 'Socket live' : 'Socket offline'}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ['Total', summary.totalDevices],
            ['Online', summary.onlineDevices],
            ['Pending', summary.pendingDevices],
            ['Offline', summary.offlineDevices],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4 text-left">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {buses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/50 p-4 text-sm text-slate-400">
              No buses configured yet. Create one in the onboarding wizard to start staging RTU devices.
            </div>
          )}
          {buses.map((bus) => (
            <div key={bus.busId} className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <BusStatusBadge bus={bus} />
                <span className="text-xs text-slate-400">{bus.serialPort}</span>
                <span className="text-xs text-slate-500">{bus.baudRate} baud</span>
                <span className="text-xs text-slate-500">{bus.deviceCount} devices</span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {bus.lastError ? `Last error: ${bus.lastError.message}` : 'No active bus errors.'}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700/60 bg-slate-900/75 p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Inventory</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Onboarded Devices</h3>
          </div>
          <div className="text-sm text-slate-400">{devices.length} registered</div>
        </div>

        <div className="mt-5 space-y-4">
          {devices.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/50 p-6 text-sm text-slate-400">
              No devices onboarded yet. Run a connection test and save your first RTU endpoint.
            </div>
          )}

          {devices.map((device) => (
            <article key={device.deviceId} className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4 text-left">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold text-white">{device.name}</h4>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                      {device.deviceType}
                    </span>
                    <span className="rounded-full border border-slate-600/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                      {device.lifecycle}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    {device.site} / {device.rack} · Bus {device.busId} · Slave {device.slaveId}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Profile {device.profile.profileId}@{device.profile.profileVersion} ({device.profile.profileStatus})
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <FreshnessBadge freshness={device.freshness} />
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${device.online ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700/50 text-slate-300'}`}>
                    {device.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Last Seen</div>
                  <div className="mt-1 text-sm text-slate-300">{formatTimestamp(device.lastSeenAt)}</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">Last Error</div>
                  <div className="mt-1 text-sm text-slate-300">{device.lastError?.message ?? 'None'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Unsupported Metrics</div>
                  <div className="mt-2">
                    <UnsupportedMetricsList metrics={device.unsupportedMetrics} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
