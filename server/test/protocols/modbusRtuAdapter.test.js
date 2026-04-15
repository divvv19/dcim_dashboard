const test = require("node:test");
const assert = require("node:assert/strict");

const { createProfileCatalog } = require("../../src/profiles/profileCatalog");
const { createModbusRtuAdapter, decodeRegisterValue } = require("../../src/protocols/modbusRtuAdapter");

test("decodeRegisterValue applies scaling to uint16 registers", () => {
  const value = decodeRegisterValue(
    { dataType: "uint16", scale: 0.1 },
    [2305],
  );

  assert.equal(value, 230.5);
});

test("modbus adapter performs probe and sample reads against injected client", async () => {
  const calls = [];
  const fakeClient = {
    async connectRTUBuffered(serialPort, options) {
      calls.push(["connect", serialPort, options]);
    },
    setID(unitId) {
      calls.push(["setID", unitId]);
    },
    setTimeout(timeoutMs) {
      calls.push(["setTimeout", timeoutMs]);
    },
    async readHoldingRegisters(address, length) {
      calls.push(["readHoldingRegisters", address, length]);
      return { data: [2305] };
    },
    async close() {
      calls.push(["close"]);
    },
  };

  const adapter = createModbusRtuAdapter({
    clientFactory: () => fakeClient,
    now: (() => {
      let value = 1000;
      return () => value++;
    })(),
  });
  const catalog = createProfileCatalog();
  const profile = catalog.resolveProfile("ups.generic", { version: 1 });
  const bus = { busId: "bus-a", serialPort: "COM2", baudRate: 9600, parity: "none", dataBits: 8, stopBits: 1, timeoutMs: 1500 };
  const device = { deviceId: "ups-1", slaveId: 3 };

  const probe = await adapter.testConnection(bus, device, profile);
  const sample = await adapter.collectSample(bus, device, profile);

  assert.equal(probe.ok, true);
  assert.equal(sample.metrics.inputVoltage.value, 230.5);
  assert.equal(calls.some((call) => call[0] === "readHoldingRegisters"), true);
});
