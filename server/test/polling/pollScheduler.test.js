const test = require("node:test");
const assert = require("node:assert/strict");

const { createBusRegistry } = require("../../src/buses/busRegistry");
const { createProfileCatalog } = require("../../src/profiles/profileCatalog");
const { createDeviceStateStore } = require("../../src/state/deviceStateStore");
const { createConnectorStateStore } = require("../../src/polling/connectorState");
const { createPollScheduler } = require("../../src/polling/pollScheduler");

function createDeferred() {
  let resolve;
  const promise = new Promise((innerResolve) => {
    resolve = innerResolve;
  });

  return { promise, resolve };
}

test("poll scheduler serializes polls on the same RS485 bus", async () => {
  let clock = 0;
  const busRegistry = createBusRegistry();
  busRegistry.create({ busId: "bus-a", serialPort: "COM1" });

  const deviceStore = createDeviceStateStore();
  deviceStore.create({
    name: "UPS-1",
    site: "S1",
    rack: "R1",
    deviceType: "ups",
    busId: "bus-a",
    slaveId: 1,
    profileId: "ups.generic",
    profileVersion: 1,
    lifecycle: "Active",
    profileStatus: "mapped",
  });

  const profileCatalog = createProfileCatalog();
  const connectorState = createConnectorStateStore({ now: () => clock });
  const deferred = createDeferred();
  let activeCalls = 0;
  let maxConcurrent = 0;
  const adapter = {
    async collectSample() {
      activeCalls += 1;
      maxConcurrent = Math.max(maxConcurrent, activeCalls);
      await deferred.promise;
      activeCalls -= 1;
      return {
        ok: true,
        timestamp: new Date(clock).toISOString(),
        metrics: { inputVoltage: { value: 230.5, unit: "V" } },
        unsupportedMetrics: [],
      };
    },
  };

  const scheduler = createPollScheduler({
    busRegistry,
    deviceStore,
    profileCatalog,
    adapter,
    connectorState,
    now: () => clock,
    timers: { setTimeout: () => 1, clearTimeout: () => {} },
  });

  const firstRun = scheduler.runBusCycle("bus-a");
  const secondRun = scheduler.runBusCycle("bus-a");
  deferred.resolve();
  await firstRun;
  const secondResult = await secondRun;

  assert.equal(maxConcurrent, 1);
  assert.equal(secondResult, false);
});

test("poll scheduler marks devices offline after repeated failures and stale over time", async () => {
  let clock = 0;
  const busRegistry = createBusRegistry();
  busRegistry.create({ busId: "bus-a", serialPort: "COM1" });

  const deviceStore = createDeviceStateStore();
  const device = deviceStore.create({
    name: "Sensor-1",
    site: "S1",
    rack: "R1",
    deviceType: "sensor",
    busId: "bus-a",
    slaveId: 9,
    profileId: "sensor.environment",
    lifecycle: "Active",
    profileStatus: "mapped",
  });

  const profileCatalog = createProfileCatalog();
  const connectorState = createConnectorStateStore({ now: () => clock });
  let shouldFail = false;
  const adapter = {
    async collectSample() {
      if (shouldFail) {
        const error = new Error("timeout");
        error.code = "TIMEOUT";
        throw error;
      }

      return {
        ok: true,
        timestamp: new Date(clock).toISOString(),
        metrics: { coldAisleTemp: { value: 22, unit: "C" } },
        unsupportedMetrics: ["leakageStatus"],
      };
    },
  };

  const scheduler = createPollScheduler({
    busRegistry,
    deviceStore,
    profileCatalog,
    adapter,
    connectorState,
    now: () => clock,
    timers: { setTimeout: () => 1, clearTimeout: () => {} },
  });

  await scheduler.runBusCycle("bus-a");
  clock = 40000;
  assert.equal(connectorState.getDeviceRuntime(device.deviceId, clock).freshness, "stale");

  shouldFail = true;
  await scheduler.runBusCycle("bus-a");
  clock = 70000;
  await scheduler.runBusCycle("bus-a");
  clock = 130000;
  await scheduler.runBusCycle("bus-a");

  assert.equal(connectorState.getDeviceRuntime(device.deviceId, clock).freshness, "offline");
});
