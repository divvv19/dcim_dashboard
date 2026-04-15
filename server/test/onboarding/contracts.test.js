const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildEndpointKey,
  computePollingEligibility,
  createBusRecord,
  createDeviceRecord,
} = require("../../src/onboarding/contracts");
const { createBusRegistry } = require("../../src/buses/busRegistry");
const { createDeviceStateStore } = require("../../src/state/deviceStateStore");

test("bus contracts apply RTU-safe defaults", () => {
  const bus = createBusRecord({ serialPort: "COM5" }, Date.UTC(2026, 0, 1));

  assert.equal(bus.name, "Bus COM5");
  assert.equal(bus.baudRate, 9600);
  assert.equal(bus.parity, "none");
  assert.equal(bus.timeoutMs, 1500);
});

test("device contracts derive endpoint identity and polling eligibility", () => {
  const device = createDeviceRecord({
    name: "UPS Alpha",
    site: "Site-A",
    rack: "Rack-01",
    deviceType: "ups",
    busId: "bus-a",
    slaveId: 4,
    profileId: "ups.generic",
    profileStatus: "mapped",
    lifecycle: "Active",
  });

  assert.equal(device.deviceId, "ups-alpha");
  assert.equal(buildEndpointKey(device.busId, device.slaveId), "bus-a::4");
  assert.equal(device.pollingEligible, true);
});

test("pending devices are not polling eligible", () => {
  assert.equal(
    computePollingEligibility({ lifecycle: "Pending", profileStatus: "pending" }),
    false,
  );
});

test("bus and device registries keep endpoint identity unique", () => {
  const busRegistry = createBusRegistry();
  const deviceStore = createDeviceStateStore();

  const bus = busRegistry.create({ busId: "bus-a", serialPort: "COM3" });
  deviceStore.create({
    name: "AC-1",
    site: "S1",
    rack: "R1",
    deviceType: "ac",
    busId: bus.busId,
    slaveId: 7,
    profileId: "ac.precision",
    lifecycle: "Active",
    profileStatus: "mapped",
  });

  assert.equal(deviceStore.hasEndpoint("bus-a", 7), true);
  assert.equal(deviceStore.getByEndpoint("bus-a", 7).name, "AC-1");
});
