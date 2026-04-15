const {
  ProtocolAdapterError,
  createConnectionResult,
  createProtocolAdapter,
  createSampleResult,
} = require("./protocolAdapter");

function metricBaseValue(metricId) {
  const defaults = {
    inputVoltage: 230.5,
    outputVoltage: 230.1,
    batteryVoltage: 260.4,
    chargingCurrent: 2.1,
    supplyTemp: 18.4,
    returnTemp: 24.6,
    fanStatus: 1,
    compressorStatus: 1,
    coldAisleTemp: 22.2,
    coldAisleHum: 47.5,
  };

  return defaults[metricId] ?? 1;
}

function createMetricsFromProfile(profile, callCount) {
  const metrics = {};

  for (const register of profile.registers ?? []) {
    if (register.supported === false || register.address === null) {
      continue;
    }

    const baseValue = metricBaseValue(register.metricId);
    const nextValue = typeof baseValue === "number" ? Number((baseValue + callCount * 0.1).toFixed(2)) : baseValue;
    metrics[register.metricId] = {
      value: nextValue,
      unit: register.unit ?? null,
    };
  }

  return metrics;
}

function createSimulatedRtuAdapter({ defaultScenario = "nominal", now = Date.now } = {}) {
  const callCounts = new Map();

  function nextCount(bus, device) {
    const key = `${bus.busId}::${device.slaveId}`;
    const current = (callCounts.get(key) ?? 0) + 1;
    callCounts.set(key, current);
    return current;
  }

  function resolveScenario(device, profile) {
    return device.simulationScenario || profile.simulationScenario || defaultScenario;
  }

  async function testConnection(bus, device, profile) {
    const scenario = resolveScenario(device, profile);
    const callCount = nextCount(bus, device);

    if (scenario === "timeout") {
      throw new ProtocolAdapterError("Timed out while probing the RTU endpoint.", { code: "TIMEOUT" });
    }

    if (scenario === "flapping" && callCount % 2 === 1) {
      throw new ProtocolAdapterError("Flapping simulated endpoint rejected this probe.", { code: "FLAPPING" });
    }

    return createConnectionResult({
      mode: "simulation",
      bus,
      device,
      latencyMs: scenario === "bus-contention" ? 220 : 35,
      timestamp: new Date(now()).toISOString(),
      details: {
        scenario,
      },
    });
  }

  async function collectSample(bus, device, profile) {
    const scenario = resolveScenario(device, profile);
    const callCount = nextCount(bus, device);

    if (scenario === "timeout") {
      throw new ProtocolAdapterError("Timed out while reading simulated registers.", { code: "TIMEOUT" });
    }

    if (scenario === "flapping" && callCount % 2 === 1) {
      throw new ProtocolAdapterError("Flapping simulated endpoint missed this poll.", { code: "FLAPPING" });
    }

    if (scenario === "bus-contention" && callCount % 3 === 0) {
      throw new ProtocolAdapterError("Bus reported a simulated busy condition.", { code: "BUS_BUSY" });
    }

    const timestamp = scenario === "stale"
      ? new Date(now() - 120000).toISOString()
      : new Date(now()).toISOString();

    return createSampleResult({
      mode: "simulation",
      bus,
      device,
      latencyMs: scenario === "bus-contention" ? 180 : 40,
      timestamp,
      metrics: createMetricsFromProfile(profile, callCount),
      unsupportedMetrics: [...new Set([...(profile.unsupportedMetrics ?? [])])],
      raw: {
        scenario,
        sampleNumber: callCount,
      },
    });
  }

  return createProtocolAdapter({
    mode: "simulation",
    testConnection,
    collectSample,
  });
}

module.exports = {
  createSimulatedRtuAdapter,
};
