const {
  normalizeDeviceType,
  normalizeText,
} = require("./contracts");

class ValidationError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
    this.statusCode = 400;
  }
}

function flattenObjectPaths(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return flattenObjectPaths(child, path);
  });
}

function validateProfileOverrides(profileDefinition, profileOverrides) {
  const overrides = profileOverrides ?? {};
  if (!profileDefinition || Object.keys(overrides).length === 0) {
    return [];
  }

  const allowed = new Set(profileDefinition.overrideAllowlist ?? []);
  return flattenObjectPaths(overrides).filter((path) => !allowed.has(path));
}

function validateOnboardingPayload(
  payload,
  {
    busRegistry,
    deviceStore,
    profileDefinition = null,
    existingDeviceId = null,
  },
) {
  const issues = [];
  const site = normalizeText(payload.site);
  const rack = normalizeText(payload.rack);
  const busId = normalizeText(payload.busId);
  const profileId = normalizeText(payload.profileId);
  const protocol = normalizeText(payload.protocol || "modbus-rtu").toLowerCase();
  const slaveId = Number(payload.slaveId);

  if (!site) {
    issues.push({ field: "site", code: "REQUIRED", message: "Site is required." });
  }

  if (!rack) {
    issues.push({ field: "rack", code: "REQUIRED", message: "Rack is required." });
  }

  try {
    normalizeDeviceType(payload.deviceType);
  } catch (error) {
    issues.push({ field: "deviceType", code: "INVALID_DEVICE_TYPE", message: error.message });
  }

  if (!busId) {
    issues.push({ field: "busId", code: "REQUIRED", message: "Bus is required." });
  } else if (!busRegistry.exists(busId)) {
    issues.push({ field: "busId", code: "BUS_NOT_FOUND", message: `Bus not found: ${busId}` });
  }

  if (!profileId) {
    issues.push({ field: "profileId", code: "REQUIRED", message: "Profile assignment is required." });
  }

  if (protocol !== "modbus-rtu") {
    issues.push({
      field: "protocol",
      code: "INVALID_PROTOCOL",
      message: "Phase 1 only supports Modbus RTU.",
    });
  }

  if (!Number.isInteger(slaveId) || slaveId < 1 || slaveId > 247) {
    issues.push({
      field: "slaveId",
      code: "INVALID_SLAVE_ID",
      message: "Slave ID must be an integer between 1 and 247.",
    });
  }

  if (busId && Number.isInteger(slaveId) && deviceStore.hasEndpoint(busId, slaveId, existingDeviceId)) {
    const duplicate = deviceStore.getByEndpoint(busId, slaveId);
    issues.push({
      field: "slaveId",
      code: "DUPLICATE_ENDPOINT",
      message: `Bus ${busId} / slave ${slaveId} already belongs to ${duplicate.name}.`,
      mergeHint: `Update the existing record ${duplicate.deviceId} instead of creating a duplicate.`,
      duplicateDeviceId: duplicate.deviceId,
    });
  }

  const invalidOverridePaths = validateProfileOverrides(profileDefinition, payload.profileOverrides);
  if (invalidOverridePaths.length > 0) {
    issues.push({
      field: "profileOverrides",
      code: "INVALID_PROFILE_OVERRIDE",
      message: `Unsupported override paths: ${invalidOverridePaths.join(", ")}`,
      invalidPaths: invalidOverridePaths,
    });
  }

  if (issues.length > 0) {
    throw new ValidationError("Onboarding payload failed validation.", issues);
  }

  return {
    ...payload,
    site,
    rack,
    busId,
    protocol: "modbus-rtu",
    profileId,
    slaveId,
  };
}

module.exports = {
  ValidationError,
  flattenObjectPaths,
  validateOnboardingPayload,
  validateProfileOverrides,
};
