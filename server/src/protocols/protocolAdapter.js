class ProtocolAdapterError extends Error {
  constructor(message, { code = "ADAPTER_ERROR", retryable = true, details = null } = {}) {
    super(message);
    this.name = "ProtocolAdapterError";
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

function assertAdapterContract(adapter) {
  if (!adapter || typeof adapter.testConnection !== "function" || typeof adapter.collectSample !== "function") {
    throw new Error("Protocol adapter must expose testConnection() and collectSample().");
  }

  return adapter;
}

function createProtocolAdapter(adapter) {
  return assertAdapterContract(adapter);
}

function toProtocolAdapterError(error, fallbackCode = "ADAPTER_ERROR") {
  if (error instanceof ProtocolAdapterError) {
    return error;
  }

  return new ProtocolAdapterError(error?.message || "Unexpected adapter error.", {
    code: fallbackCode,
    details: error,
  });
}

function createConnectionResult({ mode, bus, device, latencyMs = 0, timestamp = new Date().toISOString(), details = {} }) {
  return {
    ok: true,
    mode,
    busId: bus.busId,
    slaveId: device.slaveId,
    latencyMs,
    timestamp,
    details,
  };
}

function createSampleResult({
  mode,
  bus,
  device,
  metrics,
  unsupportedMetrics = [],
  latencyMs = 0,
  timestamp = new Date().toISOString(),
  raw = null,
}) {
  return {
    ok: true,
    mode,
    busId: bus.busId,
    deviceId: device.deviceId,
    slaveId: device.slaveId,
    latencyMs,
    timestamp,
    metrics,
    unsupportedMetrics,
    raw,
  };
}

module.exports = {
  ProtocolAdapterError,
  assertAdapterContract,
  createConnectionResult,
  createProtocolAdapter,
  createSampleResult,
  toProtocolAdapterError,
};
