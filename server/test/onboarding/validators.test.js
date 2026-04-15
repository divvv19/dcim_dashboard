const test = require("node:test");
const assert = require("node:assert/strict");

const { createBusRegistry } = require("../../src/buses/busRegistry");
const { createDeviceStateStore } = require("../../src/state/deviceStateStore");
const { createProfileCatalog } = require("../../src/profiles/profileCatalog");
const {
  ValidationError,
  validateOnboardingPayload,
} = require("../../src/onboarding/validators");

function createDependencies() {
  const busRegistry = createBusRegistry();
  busRegistry.create({ busId: "bus-a", serialPort: "COM1" });

  const deviceStore = createDeviceStateStore();
  const profileCatalog = createProfileCatalog();

  return { busRegistry, deviceStore, profileCatalog };
}

test("validators require core onboarding metadata", () => {
  const { busRegistry, deviceStore } = createDependencies();

  assert.throws(
    () =>
      validateOnboardingPayload(
        { deviceType: "ups", busId: "bus-a", slaveId: 2, profileId: "ups.generic" },
        { busRegistry, deviceStore },
      ),
    (error) => {
      assert.equal(error instanceof ValidationError, true);
      assert.equal(error.issues.some((issue) => issue.field === "site"), true);
      assert.equal(error.issues.some((issue) => issue.field === "rack"), true);
      return true;
    },
  );
});

test("validators block duplicate bus and slave combinations", () => {
  const { busRegistry, deviceStore } = createDependencies();
  deviceStore.create({
    name: "UPS-1",
    site: "S1",
    rack: "R1",
    deviceType: "ups",
    busId: "bus-a",
    slaveId: 2,
    profileId: "ups.generic",
    lifecycle: "Active",
    profileStatus: "mapped",
  });

  assert.throws(
    () =>
      validateOnboardingPayload(
        {
          name: "UPS-2",
          site: "S1",
          rack: "R2",
          deviceType: "ups",
          busId: "bus-a",
          slaveId: 2,
          profileId: "ups.generic",
        },
        { busRegistry, deviceStore },
      ),
    (error) => {
      assert.equal(error.issues[0].code, "DUPLICATE_ENDPOINT");
      assert.match(error.issues[0].mergeHint, /Update the existing record/);
      return true;
    },
  );
});

test("validators enforce profile override allowlists", () => {
  const { busRegistry, deviceStore, profileCatalog } = createDependencies();
  const profile = profileCatalog.getProfileDefinition("ups.generic", 2);

  assert.throws(
    () =>
      validateOnboardingPayload(
        {
          site: "S1",
          rack: "R1",
          deviceType: "ups",
          busId: "bus-a",
          slaveId: 3,
          profileId: "ups.generic",
          profileOverrides: {
            polling: { intervalMs: 3000 },
            registers: { first: { address: 99 } },
          },
        },
        { busRegistry, deviceStore, profileDefinition: profile },
      ),
    (error) => {
      assert.equal(error.issues[0].code, "INVALID_PROFILE_OVERRIDE");
      assert.deepEqual(error.issues[0].invalidPaths, ["registers.first.address"]);
      return true;
    },
  );
});
