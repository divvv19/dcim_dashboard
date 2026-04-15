const {
  buildEndpointKey,
  createDeviceRecord,
  updateDeviceRecord,
} = require("../onboarding/contracts");

function createDeviceStateStore({ seedDevices = [], now = Date.now } = {}) {
  const devices = new Map();
  const endpointIndex = new Map();

  function indexDevice(device) {
    endpointIndex.set(buildEndpointKey(device.busId, device.slaveId), device.deviceId);
  }

  function unindexDevice(device) {
    endpointIndex.delete(buildEndpointKey(device.busId, device.slaveId));
  }

  function create(deviceInput) {
    const device = createDeviceRecord(deviceInput, now());
    const endpointKey = buildEndpointKey(device.busId, device.slaveId);
    const existingDeviceId = endpointIndex.get(endpointKey);

    if (existingDeviceId) {
      throw new Error(`Endpoint already exists: ${endpointKey}`);
    }

    devices.set(device.deviceId, device);
    indexDevice(device);
    return device;
  }

  function update(deviceId, patch) {
    const existing = devices.get(deviceId);
    if (!existing) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    const updated = updateDeviceRecord(existing, patch, now());
    const endpointKey = buildEndpointKey(updated.busId, updated.slaveId);
    const existingDeviceId = endpointIndex.get(endpointKey);
    if (existingDeviceId && existingDeviceId !== deviceId) {
      throw new Error(`Endpoint already exists: ${endpointKey}`);
    }

    unindexDevice(existing);
    devices.set(deviceId, updated);
    indexDevice(updated);
    return updated;
  }

  function get(deviceId) {
    return devices.get(deviceId) ?? null;
  }

  function list() {
    return [...devices.values()].sort((left, right) => left.name.localeCompare(right.name));
  }

  function getByEndpoint(busId, slaveId) {
    const deviceId = endpointIndex.get(buildEndpointKey(busId, slaveId));
    return deviceId ? devices.get(deviceId) ?? null : null;
  }

  function hasEndpoint(busId, slaveId, ignoreDeviceId = null) {
    const device = getByEndpoint(busId, slaveId);
    return Boolean(device && device.deviceId !== ignoreDeviceId);
  }

  for (const seedDevice of seedDevices) {
    create(seedDevice);
  }

  return {
    create,
    get,
    getByEndpoint,
    hasEndpoint,
    list,
    update,
  };
}

module.exports = {
  createDeviceStateStore,
};
