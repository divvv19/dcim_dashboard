const test = require("node:test");
const assert = require("node:assert/strict");

const { createProfileCatalog } = require("../../src/profiles/profileCatalog");
const { createSimulatedRtuAdapter } = require("../../src/protocols/simulatedRtuAdapter");

const bus = { busId: "bus-a", serialPort: "COM4" };
const profileCatalog = createProfileCatalog();
const upsProfile = profileCatalog.resolveProfile("ups.generic");

test("simulation adapter returns deterministic healthy samples", async () => {
  const adapter = createSimulatedRtuAdapter({ now: () => Date.UTC(2026, 0, 1, 0, 0, 0) });
  const device = { deviceId: "ups-1", busId: "bus-a", slaveId: 1, simulationScenario: "nominal" };

  const connection = await adapter.testConnection(bus, device, upsProfile);
  const sample = await adapter.collectSample(bus, device, upsProfile);

  assert.equal(connection.ok, true);
  assert.equal(sample.ok, true);
  assert.equal(sample.metrics.inputVoltage.value > 0, true);
});

test("simulation adapter surfaces timeout failures", async () => {
  const adapter = createSimulatedRtuAdapter();
  const device = { deviceId: "ups-1", busId: "bus-a", slaveId: 1, simulationScenario: "timeout" };

  await assert.rejects(
    () => adapter.collectSample(bus, device, upsProfile),
    (error) => error.code === "TIMEOUT",
  );
});

test("simulation adapter can emit stale samples and unsupported metrics", async () => {
  const adapter = createSimulatedRtuAdapter({ now: () => Date.UTC(2026, 0, 1, 0, 2, 0) });
  const profile = profileCatalog.resolveProfile("sensor.environment");
  const device = { deviceId: "sensor-1", busId: "bus-a", slaveId: 6, simulationScenario: "stale" };

  const sample = await adapter.collectSample(bus, device, profile);

  assert.equal(new Date(sample.timestamp).getUTCMinutes(), 0);
  assert.deepEqual(sample.unsupportedMetrics, ["leakageStatus"]);
});
