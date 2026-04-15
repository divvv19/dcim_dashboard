const test = require("node:test");
const assert = require("node:assert/strict");

const { createBusRegistry } = require("../../src/buses/busRegistry");
const { createOnboardingService } = require("../../src/onboarding/onboardingService");
const { createConnectorStateStore } = require("../../src/polling/connectorState");
const { createProfileCatalog } = require("../../src/profiles/profileCatalog");
const { createDeviceStateStore } = require("../../src/state/deviceStateStore");

function createService() {
  const busRegistry = createBusRegistry();
  busRegistry.create({ busId: "bus-a", serialPort: "COM1" });
  const deviceStore = createDeviceStateStore();
  const profileCatalog = createProfileCatalog();
  const connectorState = createConnectorStateStore();
  const adapter = {
    async testConnection(bus, device) {
      return {
        ok: true,
        busId: bus.busId,
        slaveId: device.slaveId,
        timestamp: new Date(Date.UTC(2026, 0, 1)).toISOString(),
      };
    },
  };
  const scheduler = { resyncCalls: 0, resync() { this.resyncCalls += 1; } };

  return {
    service: createOnboardingService({
      busRegistry,
      deviceStore,
      profileCatalog,
      adapter,
      connectorState,
      scheduler,
    }),
    scheduler,
  };
}

test("onboarding service creates active mapped devices after connection test", async () => {
  const { service, scheduler } = createService();
  const result = await service.createDevice({
    name: "UPS-1",
    site: "S1",
    rack: "R1",
    deviceType: "ups",
    busId: "bus-a",
    slaveId: 3,
    profileId: "ups.generic",
  });

  assert.equal(result.device.lifecycle, "Active");
  assert.equal(result.device.profileStatus, "mapped");
  assert.equal(Boolean(result.connectionResult), true);
  assert.equal(scheduler.resyncCalls, 1);
});

test("onboarding service keeps unsupported profiles pending", async () => {
  const { service } = createService();
  const result = await service.createDevice({
    name: "Unknown sensor",
    site: "S1",
    rack: "R4",
    deviceType: "sensor",
    busId: "bus-a",
    slaveId: 8,
    profileId: "sensor.pending",
  });

  assert.equal(result.device.lifecycle, "Pending");
  assert.equal(result.device.pollingEligible, false);
  assert.equal(result.connectionResult, null);
});
