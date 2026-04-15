const { toProtocolAdapterError } = require("../protocols/protocolAdapter");
const { getNextDelayMs } = require("./pollingPolicy");

function createPollScheduler({
  busRegistry,
  deviceStore,
  profileCatalog,
  adapter,
  connectorState,
  now = Date.now,
  timers = { setTimeout, clearTimeout },
  onUpdate = () => {},
} = {}) {
  const busTimers = new Map();
  const busLocks = new Set();
  const deviceSchedule = new Map();

  function getEligibleDevices(busId) {
    return deviceStore
      .list()
      .filter((device) => device.busId === busId && device.pollingEligible);
  }

  function getProfile(device) {
    return profileCatalog.resolveProfile(device.profileId, {
      version: device.profileVersion,
      overrides: device.profileOverrides,
    });
  }

  function ensureDeviceSchedule(device, profile) {
    const existing = deviceSchedule.get(device.deviceId);
    if (existing) {
      return existing;
    }

    const schedule = {
      deviceId: device.deviceId,
      nextDueAt: now(),
      lastAttemptAt: null,
      lastProfileKey: profile.key,
    };
    deviceSchedule.set(device.deviceId, schedule);
    return schedule;
  }

  function scheduleBus(busId, delayMs) {
    const existingTimer = busTimers.get(busId);
    if (existingTimer) {
      timers.clearTimeout(existingTimer);
    }

    if (delayMs === null) {
      busTimers.delete(busId);
      return;
    }

    const timer = timers.setTimeout(() => {
      runBusCycle(busId).catch(() => {});
    }, Math.max(0, delayMs));

    busTimers.set(busId, timer);
  }

  async function pollDevice(bus, device) {
    const profile = getProfile(device);
    const schedule = ensureDeviceSchedule(device, profile);
    schedule.lastAttemptAt = now();

    try {
      const sample = await adapter.collectSample(bus, device, profile);
      connectorState.recordPollSuccess(device, profile, sample);
      schedule.nextDueAt = now() + getNextDelayMs({ device, profile, failureCount: 0 });
      onUpdate();
      return sample;
    } catch (error) {
      const adapterError = toProtocolAdapterError(error);
      const runtime = connectorState.getDeviceRuntime(device.deviceId) ?? { consecutiveFailures: 0 };
      connectorState.recordPollFailure(device, profile, adapterError);
      schedule.nextDueAt = now() + getNextDelayMs({
        device,
        profile,
        failureCount: runtime.consecutiveFailures + 1,
      });
      onUpdate();
      throw adapterError;
    }
  }

  async function runBusCycle(busId) {
    if (busLocks.has(busId)) {
      return false;
    }

    const bus = busRegistry.get(busId);
    if (!bus) {
      return false;
    }

    const devices = getEligibleDevices(busId);
    if (devices.length === 0) {
      scheduleBus(busId, null);
      return true;
    }

    busLocks.add(busId);
    connectorState.markBusInflight(busId, true);

    try {
      const dueDevices = devices.filter((device) => {
        const schedule = ensureDeviceSchedule(device, getProfile(device));
        return schedule.nextDueAt <= now();
      });

      for (const device of dueDevices) {
        try {
          await pollDevice(bus, device);
        } catch {
          // Failure is already captured in connector state.
        }
      }

      const nextDueAt = devices
        .map((device) => ensureDeviceSchedule(device, getProfile(device)).nextDueAt)
        .reduce((minimum, value) => Math.min(minimum, value), Infinity);
      scheduleBus(busId, nextDueAt === Infinity ? null : nextDueAt - now());
      return true;
    } finally {
      connectorState.markBusInflight(busId, false);
      busLocks.delete(busId);
    }
  }

  function start() {
    for (const bus of busRegistry.list()) {
      scheduleBus(bus.busId, 0);
    }
  }

  function stop() {
    for (const timer of busTimers.values()) {
      timers.clearTimeout(timer);
    }
    busTimers.clear();
  }

  function resync() {
    stop();
    start();
  }

  return {
    pollDevice,
    resync,
    runBusCycle,
    start,
    stop,
  };
}

module.exports = {
  createPollScheduler,
};
