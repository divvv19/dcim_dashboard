const { normalizeDeviceType } = require("../onboarding/contracts");

const DEFAULT_PROFILES = Object.freeze([
  {
    profileId: "ups.generic",
    version: 1,
    label: "Generic UPS RTU",
    deviceType: "ups",
    modelKey: "generic-ups",
    supportedPolling: true,
    polling: { intervalMs: 5000, timeoutMs: 1500, retries: 2, backoffCapMs: 40000 },
    overrideAllowlist: ["polling.intervalMs", "polling.timeoutMs"],
    registers: [
      { metricId: "inputVoltage", registerType: "holding", address: 0, length: 1, dataType: "uint16", scale: 0.1, unit: "V", supported: true, required: true },
      { metricId: "outputVoltage", registerType: "holding", address: 1, length: 1, dataType: "uint16", scale: 0.1, unit: "V", supported: true, required: true },
      { metricId: "batteryVoltage", registerType: "holding", address: 2, length: 1, dataType: "uint16", scale: 0.1, unit: "V", supported: true, required: true },
      { metricId: "chargingCurrent", registerType: "holding", address: 3, length: 1, dataType: "uint16", scale: 0.1, unit: "A", supported: true, required: false },
    ],
  },
  {
    profileId: "ups.generic",
    version: 2,
    label: "Generic UPS RTU",
    deviceType: "ups",
    modelKey: "generic-ups-v2",
    supportedPolling: true,
    polling: { intervalMs: 5000, timeoutMs: 1500, retries: 2, backoffCapMs: 40000 },
    overrideAllowlist: ["polling.intervalMs", "polling.timeoutMs"],
    registers: [
      { metricId: "inputVoltage", registerType: "holding", address: 0, length: 1, dataType: "uint16", scale: 0.1, unit: "V", supported: true, required: true },
      { metricId: "outputVoltage", registerType: "holding", address: 1, length: 1, dataType: "uint16", scale: 0.1, unit: "V", supported: true, required: true },
      { metricId: "batteryVoltage", registerType: "holding", address: 2, length: 1, dataType: "uint16", scale: 0.1, unit: "V", supported: true, required: true },
      { metricId: "chargingCurrent", registerType: "holding", address: 3, length: 1, dataType: "uint16", scale: 0.1, unit: "A", supported: true, required: false },
      { metricId: "upsMode", registerType: "holding", address: 4, length: 1, dataType: "uint16", unit: "state", supported: false, required: false },
    ],
  },
  {
    profileId: "ac.precision",
    version: 1,
    label: "Precision AC RTU",
    deviceType: "ac",
    modelKey: "generic-ac",
    supportedPolling: true,
    polling: { intervalMs: 10000, timeoutMs: 1500, retries: 2, backoffCapMs: 60000 },
    overrideAllowlist: ["polling.intervalMs", "polling.timeoutMs"],
    registers: [
      { metricId: "supplyTemp", registerType: "holding", address: 100, length: 1, dataType: "int16", scale: 0.1, unit: "C", supported: true, required: true },
      { metricId: "returnTemp", registerType: "holding", address: 101, length: 1, dataType: "int16", scale: 0.1, unit: "C", supported: true, required: true },
      { metricId: "fanStatus", registerType: "holding", address: 102, length: 1, dataType: "uint16", unit: "state", supported: true, required: false },
      { metricId: "compressorStatus", registerType: "holding", address: 103, length: 1, dataType: "uint16", unit: "state", supported: true, required: false },
    ],
  },
  {
    profileId: "sensor.environment",
    version: 1,
    label: "Environmental Sensor RTU",
    deviceType: "sensor",
    modelKey: "generic-sensor",
    supportedPolling: true,
    polling: { intervalMs: 15000, timeoutMs: 1200, retries: 2, backoffCapMs: 60000 },
    overrideAllowlist: ["polling.intervalMs", "polling.timeoutMs"],
    registers: [
      { metricId: "coldAisleTemp", registerType: "holding", address: 200, length: 1, dataType: "int16", scale: 0.1, unit: "C", supported: true, required: true },
      { metricId: "coldAisleHum", registerType: "holding", address: 201, length: 1, dataType: "uint16", scale: 0.1, unit: "%", supported: true, required: true },
      { metricId: "leakageStatus", registerType: "holding", address: null, length: 1, dataType: "uint16", unit: "state", supported: false, required: false },
    ],
  },
  {
    profileId: "sensor.pending",
    version: 1,
    label: "Pending Sensor Mapping",
    deviceType: "sensor",
    modelKey: "pending-sensor",
    supportedPolling: false,
    polling: { intervalMs: 15000, timeoutMs: 1200, retries: 2, backoffCapMs: 60000 },
    overrideAllowlist: ["polling.intervalMs", "polling.timeoutMs"],
    registers: [],
  },
]);

function clone(value) {
  return structuredClone(value);
}

function deepMergeProfile(target, overrides) {
  const output = clone(target);

  for (const [key, value] of Object.entries(overrides ?? {})) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = deepMergeProfile(output[key] ?? {}, value);
    } else {
      output[key] = value;
    }
  }

  return output;
}

function createProfileCatalog({ profiles = DEFAULT_PROFILES } = {}) {
  const profileMap = new Map();

  for (const profile of profiles) {
    const deviceType = normalizeDeviceType(profile.deviceType);
    const versions = profileMap.get(profile.profileId) ?? new Map();
    versions.set(profile.version, {
      ...clone(profile),
      deviceType,
      key: `${profile.profileId}@${profile.version}`,
    });
    profileMap.set(profile.profileId, versions);
  }

  function list(deviceType = null) {
    const normalizedType = deviceType ? normalizeDeviceType(deviceType) : null;
    const values = [...profileMap.values()].flatMap((versions) => [...versions.values()]);
    return values
      .filter((profile) => !normalizedType || profile.deviceType === normalizedType)
      .sort((left, right) => left.label.localeCompare(right.label) || left.version - right.version)
      .map((profile) => clone(profile));
  }

  function getProfileDefinition(profileId, version = null) {
    const versions = profileMap.get(profileId);
    if (!versions) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    const resolvedVersion = version ?? Math.max(...versions.keys());
    const profile = versions.get(resolvedVersion);
    if (!profile) {
      throw new Error(`Profile version not found: ${profileId}@${resolvedVersion}`);
    }

    return clone(profile);
  }

  function resolveProfile(profileId, { version = null, overrides = {} } = {}) {
    const profile = getProfileDefinition(profileId, version);
    const resolved = deepMergeProfile(profile, overrides);
    const registers = resolved.registers ?? [];
    const unsupportedMetrics = registers
      .filter((register) => register.supported === false || register.address === null)
      .map((register) => register.metricId);

    return {
      ...resolved,
      registers,
      unsupportedMetrics,
      connectionProbe:
        resolved.connectionProbe ??
        registers.find((register) => register.supported !== false && register.address !== null) ??
        null,
    };
  }

  return {
    getProfileDefinition,
    list,
    resolveProfile,
  };
}

module.exports = {
  DEFAULT_PROFILES,
  createProfileCatalog,
};
