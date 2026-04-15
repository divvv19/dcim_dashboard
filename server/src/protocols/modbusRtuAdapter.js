const ModbusRTU = require("modbus-serial");
const {
  ProtocolAdapterError,
  createConnectionResult,
  createProtocolAdapter,
  createSampleResult,
  toProtocolAdapterError,
} = require("./protocolAdapter");

function wordsToBuffer(words, register) {
  const values = [...words];
  if ((register.wordOrder ?? "big").toLowerCase() === "little" && values.length > 1) {
    values.reverse();
  }

  const buffer = Buffer.alloc(values.length * 2);
  values.forEach((word, index) => buffer.writeUInt16BE(word, index * 2));
  return buffer;
}

function decodeRegisterValue(register, words) {
  const buffer = wordsToBuffer(words, register);
  const scale = register.scale ?? 1;
  let value;

  switch (register.dataType) {
    case "uint16":
      value = buffer.readUInt16BE(0);
      break;
    case "int16":
      value = buffer.readInt16BE(0);
      break;
    case "uint32":
      value = buffer.readUInt32BE(0);
      break;
    case "int32":
      value = buffer.readInt32BE(0);
      break;
    case "float32":
      value = buffer.readFloatBE(0);
      break;
    default:
      throw new ProtocolAdapterError(`Unsupported data type: ${register.dataType}`, {
        code: "UNSUPPORTED_DATA_TYPE",
        retryable: false,
      });
  }

  return Number((value * scale).toFixed(3));
}

async function readRegister(client, register) {
  const length = Number(register.length ?? 1);
  switch (register.registerType) {
    case "holding":
      return client.readHoldingRegisters(register.address, length);
    case "input":
      return client.readInputRegisters(register.address, length);
    default:
      throw new ProtocolAdapterError(`Unsupported register type: ${register.registerType}`, {
        code: "UNSUPPORTED_REGISTER_TYPE",
        retryable: false,
      });
  }
}

function mapModbusError(error) {
  if (error instanceof ProtocolAdapterError) {
    return error;
  }

  const message = error?.message || "Unexpected Modbus RTU error.";
  if (/timed out/i.test(message)) {
    return new ProtocolAdapterError(message, { code: "TIMEOUT" });
  }

  if (/port/i.test(message)) {
    return new ProtocolAdapterError(message, { code: "SERIAL_PORT_ERROR" });
  }

  return toProtocolAdapterError(error, "MODBUS_ERROR");
}

function createModbusRtuAdapter({
  clientFactory = () => new ModbusRTU(),
  now = Date.now,
} = {}) {
  async function withClient(bus, profile, device, operation) {
    const client = clientFactory();

    try {
      await client.connectRTUBuffered(bus.serialPort, {
        baudRate: bus.baudRate,
        parity: bus.parity,
        dataBits: bus.dataBits,
        stopBits: bus.stopBits,
      });
      client.setID(device.slaveId);
      client.setTimeout(Number(profile.polling?.timeoutMs ?? bus.timeoutMs ?? 1500));
      return await operation(client);
    } catch (error) {
      throw mapModbusError(error);
    } finally {
      if (typeof client.close === "function") {
        await client.close();
      }
    }
  }

  async function testConnection(bus, device, profile) {
    const startedAt = now();
    const probe = profile.connectionProbe;
    if (!probe) {
      return createConnectionResult({
        mode: "hardware",
        bus,
        device,
        timestamp: new Date(startedAt).toISOString(),
        latencyMs: 0,
        details: { skipped: true },
      });
    }

    await withClient(bus, profile, device, async (client) => {
      await readRegister(client, probe);
    });

    return createConnectionResult({
      mode: "hardware",
      bus,
      device,
      timestamp: new Date(now()).toISOString(),
      latencyMs: now() - startedAt,
      details: {
        registerType: probe.registerType,
        address: probe.address,
      },
    });
  }

  async function collectSample(bus, device, profile) {
    const startedAt = now();
    const metrics = {};
    const raw = {};

    await withClient(bus, profile, device, async (client) => {
      for (const register of profile.registers ?? []) {
        if (register.supported === false || register.address === null) {
          continue;
        }

        const response = await readRegister(client, register);
        raw[register.metricId] = response.data;
        metrics[register.metricId] = {
          value: decodeRegisterValue(register, response.data),
          unit: register.unit ?? null,
        };
      }
    });

    return createSampleResult({
      mode: "hardware",
      bus,
      device,
      metrics,
      unsupportedMetrics: profile.unsupportedMetrics ?? [],
      latencyMs: now() - startedAt,
      timestamp: new Date(now()).toISOString(),
      raw,
    });
  }

  return createProtocolAdapter({
    mode: "hardware",
    testConnection,
    collectSample,
  });
}

module.exports = {
  createModbusRtuAdapter,
  decodeRegisterValue,
};
