const DEVICE_CLASS_DEFAULTS = Object.freeze({
  ups: { intervalMs: 5000, timeoutMs: 1500, retries: 2, backoffCapMs: 40000 },
  ac: { intervalMs: 10000, timeoutMs: 1500, retries: 2, backoffCapMs: 60000 },
  sensor: { intervalMs: 15000, timeoutMs: 1200, retries: 2, backoffCapMs: 60000 },
});

const OFFLINE_FAILURE_THRESHOLD = 3;

function getPollingDefaults(deviceType) {
  return DEVICE_CLASS_DEFAULTS[deviceType] ?? DEVICE_CLASS_DEFAULTS.sensor;
}

function resolvePollingConfig(device, profile) {
  const defaults = getPollingDefaults(device.deviceType);
  return {
    ...defaults,
    ...(profile.polling ?? {}),
  };
}

function getFreshnessThresholdMs(device, profile) {
  const config = resolvePollingConfig(device, profile);
  return config.intervalMs * 2;
}

function getNextDelayMs({ device, profile, failureCount = 0 }) {
  const config = resolvePollingConfig(device, profile);
  if (failureCount <= 0) {
    return config.intervalMs;
  }

  return Math.min(config.intervalMs * 2 ** Math.min(failureCount, 3), config.backoffCapMs);
}

function getFreshnessState({ online, lastSuccessAt, freshnessThresholdMs, now }) {
  if (!lastSuccessAt) {
    return online ? "fresh" : "unknown";
  }

  if (!online) {
    return "offline";
  }

  const elapsedMs = now - new Date(lastSuccessAt).getTime();
  return elapsedMs > freshnessThresholdMs ? "stale" : "fresh";
}

module.exports = {
  DEVICE_CLASS_DEFAULTS,
  OFFLINE_FAILURE_THRESHOLD,
  getFreshnessState,
  getFreshnessThresholdMs,
  getNextDelayMs,
  getPollingDefaults,
  resolvePollingConfig,
};
