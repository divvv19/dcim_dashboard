const {
  OFFLINE_FAILURE_THRESHOLD,
  getFreshnessState,
  getFreshnessThresholdMs,
} = require("./pollingPolicy");

function createConnectorStateStore({ now = Date.now } = {}) {
  const busRuntime = new Map();
  const deviceRuntime = new Map();

  function ensureBus(busId) {
    if (!busRuntime.has(busId)) {
      busRuntime.set(busId, {
        busId,
        inFlight: false,
        lastActivityAt: null,
        lastError: null,
      });
    }

    return busRuntime.get(busId);
  }

  function ensureDevice(device) {
    if (!deviceRuntime.has(device.deviceId)) {
      deviceRuntime.set(device.deviceId, {
        deviceId: device.deviceId,
        busId: device.busId,
        online: false,
        freshness: "unknown",
        consecutiveFailures: 0,
        lastSuccessAt: null,
        lastFailureAt: null,
        lastError: null,
        lastSample: null,
        unsupportedMetrics: [],
        lastConnectionTestAt: null,
        lastConnectionTest: null,
        freshnessThresholdMs: null,
      });
    }

    return deviceRuntime.get(device.deviceId);
  }

  function markBusInflight(busId, inFlight) {
    const bus = ensureBus(busId);
    bus.inFlight = inFlight;
    bus.lastActivityAt = new Date(now()).toISOString();
  }

  function markConnectionTest(device, result) {
    const runtime = ensureDevice(device);
    runtime.lastConnectionTestAt = result.timestamp;
    runtime.lastConnectionTest = result;
    runtime.lastError = null;
  }

  function recordPollSuccess(device, profile, sample) {
    const runtime = ensureDevice(device);
    runtime.online = true;
    runtime.consecutiveFailures = 0;
    runtime.lastSuccessAt = sample.timestamp;
    runtime.lastError = null;
    runtime.lastSample = sample.metrics;
    runtime.unsupportedMetrics = sample.unsupportedMetrics ?? [];
    runtime.freshnessThresholdMs = getFreshnessThresholdMs(device, profile);
    runtime.freshness = getFreshnessState({
      online: true,
      lastSuccessAt: sample.timestamp,
      freshnessThresholdMs: runtime.freshnessThresholdMs,
      now: new Date(sample.timestamp).getTime(),
    });
    ensureBus(device.busId).lastActivityAt = sample.timestamp;
  }

  function recordPollFailure(device, profile, error) {
    const runtime = ensureDevice(device);
    const nextFailureCount = runtime.consecutiveFailures + 1;
    runtime.consecutiveFailures = nextFailureCount;
    runtime.lastFailureAt = new Date(now()).toISOString();
    runtime.lastError = {
      code: error.code ?? "ADAPTER_ERROR",
      message: error.message,
    };
    runtime.freshnessThresholdMs = getFreshnessThresholdMs(device, profile);
    runtime.online = nextFailureCount < OFFLINE_FAILURE_THRESHOLD;
    runtime.freshness = runtime.online
      ? getFreshnessState({
        online: runtime.online,
        lastSuccessAt: runtime.lastSuccessAt,
        freshnessThresholdMs: runtime.freshnessThresholdMs,
        now: now(),
      })
      : "offline";
    ensureBus(device.busId).lastError = runtime.lastError;
  }

  function listDeviceRuntime(currentNow = now()) {
    return [...deviceRuntime.values()].map((runtime) => ({
      ...runtime,
      freshness:
        runtime.online && runtime.lastSuccessAt && runtime.freshnessThresholdMs
          ? getFreshnessState({
            online: runtime.online,
            lastSuccessAt: runtime.lastSuccessAt,
            freshnessThresholdMs: runtime.freshnessThresholdMs,
            now: currentNow,
          })
          : runtime.freshness,
    }));
  }

  function getDeviceRuntime(deviceId, currentNow = now()) {
    return listDeviceRuntime(currentNow).find((entry) => entry.deviceId === deviceId) ?? null;
  }

  function listBusRuntime() {
    return [...busRuntime.values()];
  }

  return {
    ensureBus,
    ensureDevice,
    getDeviceRuntime,
    listBusRuntime,
    listDeviceRuntime,
    markBusInflight,
    markConnectionTest,
    recordPollFailure,
    recordPollSuccess,
  };
}

module.exports = {
  createConnectorStateStore,
};
