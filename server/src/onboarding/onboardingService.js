const { createDeviceRecord } = require("./contracts");
const { validateOnboardingPayload } = require("./validators");

function createOnboardingService({
  busRegistry,
  deviceStore,
  profileCatalog,
  adapter,
  connectorState,
  scheduler,
} = {}) {
  function listBuses() {
    return busRegistry.list();
  }

  function createBus(payload) {
    return busRegistry.create(payload);
  }

  function updateBus(busId, payload) {
    return busRegistry.update(busId, payload);
  }

  function listProfiles(deviceType = null) {
    return profileCatalog.list(deviceType);
  }

  function listDevices() {
    return deviceStore.list();
  }

  function resolveProfile(payload) {
    return profileCatalog.resolveProfile(payload.profileId, {
      version: payload.profileVersion,
      overrides: payload.profileOverrides,
    });
  }

  async function runConnectionTest(payload) {
    const profile = resolveProfile(payload);
    validateOnboardingPayload(payload, {
      busRegistry,
      deviceStore,
      profileDefinition: profile,
      existingDeviceId: payload.deviceId ?? null,
    });

    const device = createDeviceRecord({
      ...payload,
      lifecycle: profile.supportedPolling ? "Tested" : "Pending",
      profileStatus: profile.supportedPolling ? "mapped" : "pending",
    });
    const bus = busRegistry.get(device.busId);
    const result = await adapter.testConnection(bus, device, profile);
    connectorState.markConnectionTest(device, result);
    return result;
  }

  async function createDevice(payload) {
    const profile = resolveProfile(payload);
    const normalizedPayload = validateOnboardingPayload(payload, {
      busRegistry,
      deviceStore,
      profileDefinition: profile,
    });

    let connectionResult = null;
    let lifecycle = "Pending";
    const profileStatus = profile.supportedPolling ? "mapped" : "pending";

    if (profile.supportedPolling) {
      connectionResult = await runConnectionTest(normalizedPayload);
      lifecycle = "Active";
    }

    const device = deviceStore.create({
      ...normalizedPayload,
      lifecycle,
      profileStatus,
      lastConnectionTestAt: connectionResult?.timestamp ?? null,
      lastConnectionTest: connectionResult,
    });

    scheduler.resync();
    return {
      device,
      connectionResult,
    };
  }

  async function updateDevice(deviceId, payload) {
    const existing = deviceStore.get(deviceId);
    if (!existing) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    const profile = resolveProfile(payload);
    const normalizedPayload = validateOnboardingPayload(payload, {
      busRegistry,
      deviceStore,
      profileDefinition: profile,
      existingDeviceId: deviceId,
    });

    let connectionResult = null;
    const lifecycle = profile.supportedPolling ? "Active" : "Pending";
    const profileStatus = profile.supportedPolling ? "mapped" : "pending";

    if (profile.supportedPolling) {
      connectionResult = await runConnectionTest({
        ...normalizedPayload,
        deviceId,
      });
    }

    const device = deviceStore.update(deviceId, {
      ...normalizedPayload,
      lifecycle,
      profileStatus,
      lastConnectionTestAt: connectionResult?.timestamp ?? existing.lastConnectionTestAt,
      lastConnectionTest: connectionResult ?? existing.lastConnectionTest,
    });

    scheduler.resync();
    return {
      device,
      connectionResult,
    };
  }

  return {
    createBus,
    createDevice,
    listBuses,
    listDevices,
    listProfiles,
    runConnectionTest,
    updateBus,
    updateDevice,
  };
}

module.exports = {
  createOnboardingService,
};
