const test = require("node:test");
const assert = require("node:assert/strict");

const { createProfileCatalog } = require("../../src/profiles/profileCatalog");

test("profile catalog resolves latest version by default", () => {
  const catalog = createProfileCatalog();
  const profile = catalog.resolveProfile("ups.generic");

  assert.equal(profile.version, 2);
  assert.equal(profile.key, "ups.generic@2");
});

test("profile catalog applies allowed overrides", () => {
  const catalog = createProfileCatalog();
  const profile = catalog.resolveProfile("ac.precision", {
    overrides: {
      polling: {
        intervalMs: 12000,
      },
    },
  });

  assert.equal(profile.polling.intervalMs, 12000);
  assert.equal(profile.polling.timeoutMs, 1500);
});

test("profile catalog exposes unsupported metrics explicitly", () => {
  const catalog = createProfileCatalog();
  const profile = catalog.resolveProfile("sensor.environment");

  assert.deepEqual(profile.unsupportedMetrics, ["leakageStatus"]);
});
