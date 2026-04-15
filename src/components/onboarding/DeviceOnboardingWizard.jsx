import { useEffect, useMemo, useState } from 'react';
import {
  createBus,
  fetchBuses,
  fetchProfiles,
  testDeviceConnection,
  createDevice,
} from '../../services/deviceApi';

const INITIAL_FORM = {
  name: '',
  site: '',
  rack: '',
  deviceType: 'ups',
  busId: '',
  slaveId: '1',
  profileId: '',
};

const INITIAL_BUS_FORM = {
  name: '',
  serialPort: 'COM1',
  baudRate: '9600',
  parity: 'none',
  dataBits: '8',
  stopBits: '1',
  timeoutMs: '1500',
};

function stablePayload(form) {
  return JSON.stringify({
    ...form,
    slaveId: Number(form.slaveId),
  });
}

export default function DeviceOnboardingWizard({ inventory, onSaved }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [busForm, setBusForm] = useState(INITIAL_BUS_FORM);
  const [buses, setBuses] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBusForm, setShowBusForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testedPayload, setTestedPayload] = useState('');

  const formFingerprint = useMemo(() => stablePayload(form), [form]);
  const profileOptions = useMemo(() => {
    const latestById = new Map();
    profiles.forEach((profile) => {
      const existing = latestById.get(profile.profileId);
      if (!existing || profile.version > existing.version) {
        latestById.set(profile.profileId, profile);
      }
    });
    return [...latestById.values()];
  }, [profiles]);
  const isTestCurrent = testResult?.ok && testedPayload === formFingerprint;
  const selectedProfile = profileOptions.find((profile) => profile.profileId === form.profileId) ?? null;
  const knownEndpoint = inventory?.devices?.find(
    (device) => device.busId === form.busId && Number(device.slaveId) === Number(form.slaveId),
  );

  useEffect(() => {
    let active = true;
    fetchBuses()
      .then((nextBuses) => {
        if (!active) return;
        setBuses(nextBuses);
        setForm((current) => ({
          ...current,
          busId: current.busId || nextBuses[0]?.busId || '',
        }));
      })
      .catch((fetchError) => {
        if (!active) return;
        setError(fetchError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProfiles(form.deviceType)
      .then((nextProfiles) => {
        if (!active) return;
        setProfiles(nextProfiles);
        setForm((current) => ({
          ...current,
          profileId: nextProfiles.some((profile) => profile.profileId === current.profileId)
            ? current.profileId
            : nextProfiles[0]?.profileId || '',
        }));
      })
      .catch((fetchError) => {
        if (!active) return;
        setError(fetchError.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.deviceType]);

  useEffect(() => {
    setTestResult(null);
    setTestedPayload('');
  }, [formFingerprint]);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setMessage('');
    setError('');
  }

  async function handleCreateBus(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const bus = await createBus({
        ...busForm,
        baudRate: Number(busForm.baudRate),
        dataBits: Number(busForm.dataBits),
        stopBits: Number(busForm.stopBits),
        timeoutMs: Number(busForm.timeoutMs),
      });
      const nextBuses = await fetchBuses();
      setBuses(nextBuses);
      setForm((current) => ({ ...current, busId: bus.busId }));
      setShowBusForm(false);
      setBusForm(INITIAL_BUS_FORM);
      setMessage(`Bus ${bus.name} created.`);
    } catch (busError) {
      setError(busError.message);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setError('');
    setMessage('');

    try {
      const result = await testDeviceConnection({
        ...form,
        slaveId: Number(form.slaveId),
      });
      setTestResult(result);
      setTestedPayload(formFingerprint);
      setMessage(`Connection test passed on ${result.busId} / slave ${result.slaveId}.`);
    } catch (testError) {
      setTestResult(null);
      setTestedPayload('');
      setError(testError.message);
    } finally {
      setTesting(false);
    }
  }

  async function handleSaveDevice(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const result = await createDevice({
        ...form,
        slaveId: Number(form.slaveId),
      });
      setMessage(`${result.device.name} saved as ${result.device.lifecycle}.`);
      setForm((current) => ({
        ...INITIAL_FORM,
        deviceType: current.deviceType,
        busId: current.busId,
      }));
      setTestResult(null);
      setTestedPayload('');
      onSaved?.();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-700/60 bg-slate-900/75 p-5 shadow-2xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Onboarding</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Single Device Wizard</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            We keep Phase 1 bus-first: select the RS485 line, assign the slave ID, run a connection test,
            then save the device with its register profile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowBusForm((current) => !current)}
          className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
        >
          {showBusForm ? 'Hide Bus Form' : 'Add RS485 Bus'}
        </button>
      </div>

      {showBusForm && (
        <form onSubmit={handleCreateBus} className="mt-5 grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['name', 'Bus Name'],
            ['serialPort', 'Serial Port'],
            ['baudRate', 'Baud Rate'],
            ['timeoutMs', 'Timeout (ms)'],
          ].map(([field, label]) => (
            <label key={field} className="text-left text-sm text-slate-300">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">{label}</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
                value={busForm[field]}
                onChange={(event) => setBusForm((current) => ({ ...current, [field]: event.target.value }))}
              />
            </label>
          ))}

          <label className="text-left text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Parity</span>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
              value={busForm.parity}
              onChange={(event) => setBusForm((current) => ({ ...current, parity: event.target.value }))}
            >
              <option value="none">None</option>
              <option value="even">Even</option>
              <option value="odd">Odd</option>
            </select>
          </label>

          <label className="text-left text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Data Bits</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
              value={busForm.dataBits}
              onChange={(event) => setBusForm((current) => ({ ...current, dataBits: event.target.value }))}
            />
          </label>

          <label className="text-left text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Stop Bits</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
              value={busForm.stopBits}
              onChange={(event) => setBusForm((current) => ({ ...current, stopBits: event.target.value }))}
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Save Bus
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSaveDevice} className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ['name', 'Device Name'],
            ['site', 'Site'],
            ['rack', 'Rack'],
          ].map(([field, label]) => (
            <label key={field} className="text-left text-sm text-slate-300">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">{label}</span>
              <input
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
                value={form[field]}
                onChange={(event) => updateForm(field, event.target.value)}
              />
            </label>
          ))}

          <label className="text-left text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Device Type</span>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
              value={form.deviceType}
              onChange={(event) => updateForm('deviceType', event.target.value)}
            >
              <option value="ups">UPS</option>
              <option value="ac">AC</option>
              <option value="sensor">Sensor</option>
            </select>
          </label>

          <label className="text-left text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">RS485 Bus</span>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
              value={form.busId}
              onChange={(event) => updateForm('busId', event.target.value)}
            >
              {buses.map((bus) => (
                <option key={bus.busId} value={bus.busId}>
                  {bus.name} ({bus.serialPort})
                </option>
              ))}
            </select>
          </label>

          <label className="text-left text-sm text-slate-300">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Slave ID</span>
            <input
              required
              min="1"
              max="247"
              type="number"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
              value={form.slaveId}
              onChange={(event) => updateForm('slaveId', event.target.value)}
            />
          </label>

          <label className="text-left text-sm text-slate-300 md:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Register Profile</span>
            <select
              disabled={loading}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition focus:border-cyan-400 disabled:opacity-60"
              value={form.profileId}
              onChange={(event) => updateForm('profileId', event.target.value)}
            >
              {profileOptions.map((profile) => (
                <option key={`${profile.profileId}@${profile.version}`} value={profile.profileId}>
                  {profile.label} · v{profile.version}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4 text-left">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Preflight</div>
          <div className="mt-3 space-y-3 text-sm text-slate-300">
            <p>
              Transport is locked to <span className="font-semibold text-cyan-200">Modbus RTU</span> for this phase.
            </p>
            <p>
              Selected profile: <span className="font-semibold text-white">{selectedProfile?.label ?? 'Choose a profile'}</span>
            </p>
            <p>
              Duplicate endpoint: <span className={knownEndpoint ? 'text-rose-300' : 'text-emerald-300'}>
                {knownEndpoint ? `${knownEndpoint.name} already uses this bus/slave.` : 'No duplicate detected.'}
              </span>
            </p>
            <p>
              Save gate: <span className={isTestCurrent ? 'text-emerald-300' : 'text-amber-300'}>
                {isTestCurrent ? 'Connection test is current.' : 'Run a fresh connection test before saving.'}
              </span>
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || saving}
              className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              type="submit"
              disabled={!isTestCurrent || saving || Boolean(knownEndpoint)}
              className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {saving ? 'Saving...' : 'Save Device'}
            </button>
          </div>

          {(message || error) && (
            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
              {error || message}
            </div>
          )}

          {testResult && (
            <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              <div className="font-semibold text-white">Last test passed</div>
              <div className="mt-2 text-xs text-slate-400">
                Bus {testResult.busId} / slave {testResult.slaveId} · latency {testResult.latencyMs} ms
              </div>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
