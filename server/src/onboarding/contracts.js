const DEVICE_TYPES = Object.freeze(["ac", "ups", "sensor"]);
const DEVICE_LIFECYCLE_STATES = Object.freeze(["Pending", "Tested", "Active", "Failed"]);
const PARITY_OPTIONS = Object.freeze(["none", "even", "odd"]);
const PROFILE_STATUSES = Object.freeze(["mapped", "pending"]);

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asIsoTimestamp(now = Date.now()) {
  return new Date(now).toISOString();
}

function normalizeText(value) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : "";
}

function normalizeDeviceType(deviceType) {
  const normalized = normalizeText(deviceType).toLowerCase();
  if (!DEVICE_TYPES.includes(normalized)) {
    throw new Error(`Unsupported device type: ${deviceType}`);
  }

  return normalized;
}

function normalizeLifecycle(lifecycle) {
  const normalized = normalizeText(lifecycle) || "Pending";
  if (!DEVICE_LIFECYCLE_STATES.includes(normalized)) {
    throw new Error(`Unsupported lifecycle state: ${lifecycle}`);
  }

  return normalized;
}

function normalizeParity(parity) {
  const normalized = normalizeText(parity).toLowerCase() || "none";
  if (!PARITY_OPTIONS.includes(normalized)) {
    throw new Error(`Unsupported parity: ${parity}`);
  }

  return normalized;
}

function normalizeProfileStatus(profileStatus) {
  const normalized = normalizeText(profileStatus).toLowerCase() || "mapped";
  if (!PROFILE_STATUSES.includes(normalized)) {
    throw new Error(`Unsupported profile status: ${profileStatus}`);
  }

  return normalized;
}

function buildEndpointKey(busId, slaveId) {
  return `${normalizeText(busId)}::${Number(slaveId)}`;
}

function getDefaultBusName(serialPort) {
  const cleanPort = normalizeText(serialPort);
  return cleanPort ? `Bus ${cleanPort}` : "RS485 Bus";
}

function createBusRecord(input, now = Date.now()) {
  const serialPort = normalizeText(input.serialPort ?? input.path);
  const busId = normalizeText(input.busId) || slugify(input.name) || slugify(serialPort) || `bus-${Date.now()}`;
  const timestamp = asIsoTimestamp(now);

  return {
    busId,
    name: normalizeText(input.name) || getDefaultBusName(serialPort),
    serialPort,
    baudRate: Number(input.baudRate ?? 9600),
    parity: normalizeParity(input.parity),
    dataBits: Number(input.dataBits ?? 8),
    stopBits: Number(input.stopBits ?? 1),
    timeoutMs: Number(input.timeoutMs ?? 1500),
    createdAt: input.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function computePollingEligibility(device) {
  const lifecycle = normalizeLifecycle(device.lifecycle);
  const profileStatus = normalizeProfileStatus(device.profileStatus);

  return lifecycle === "Active" && profileStatus === "mapped";
}

function createDeviceRecord(input, now = Date.now()) {
  const deviceType = normalizeDeviceType(input.deviceType);
  const lifecycle = normalizeLifecycle(input.lifecycle);
  const profileStatus = normalizeProfileStatus(input.profileStatus);
  const deviceId =
    normalizeText(input.deviceId) ||
    slugify(input.name) ||
    `${deviceType}-${normalizeText(input.busId)}-${Number(input.slaveId)}`;
  const timestamp = asIsoTimestamp(now);

  return {
    deviceId,
    name: normalizeText(input.name) || `${deviceType.toUpperCase()} ${Number(input.slaveId)}`,
    site: normalizeText(input.site),
    rack: normalizeText(input.rack),
    deviceType,
    protocol: "modbus-rtu",
    transportMode: normalizeText(input.transportMode) || "simulation",
    busId: normalizeText(input.busId),
    slaveId: Number(input.slaveId),
    modelKey: normalizeText(input.modelKey) || "generic",
    profileId: normalizeText(input.profileId),
    profileVersion: Number(input.profileVersion ?? 1),
    profileStatus,
    profileOverrides: input.profileOverrides ? structuredClone(input.profileOverrides) : {},
    lifecycle,
    statusReason: input.statusReason ?? null,
    simulationScenario: normalizeText(input.simulationScenario) || null,
    pollingEligible: computePollingEligibility({ lifecycle, profileStatus }),
    lastConnectionTestAt: input.lastConnectionTestAt ?? null,
    lastConnectionTest: input.lastConnectionTest ?? null,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function updateDeviceRecord(existingDevice, patch, now = Date.now()) {
  return createDeviceRecord(
    {
      ...existingDevice,
      ...patch,
      deviceId: existingDevice.deviceId,
      createdAt: existingDevice.createdAt,
    },
    now,
  );
}

module.exports = {
  DEVICE_LIFECYCLE_STATES,
  DEVICE_TYPES,
  PARITY_OPTIONS,
  PROFILE_STATUSES,
  asIsoTimestamp,
  buildEndpointKey,
  computePollingEligibility,
  createBusRecord,
  createDeviceRecord,
  normalizeDeviceType,
  normalizeLifecycle,
  normalizeParity,
  normalizeProfileStatus,
  normalizeText,
  updateDeviceRecord,
};
