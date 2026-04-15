const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const http = require("http");

const { createBusRegistry } = require("../../src/buses/busRegistry");
const { createOnboardingRouter } = require("../../src/onboarding/onboardingRoutes");
const { createOnboardingService } = require("../../src/onboarding/onboardingService");
const { createConnectorStateStore } = require("../../src/polling/connectorState");
const { createProfileCatalog } = require("../../src/profiles/profileCatalog");
const { createDeviceStateStore } = require("../../src/state/deviceStateStore");

async function withServer(run) {
  const busRegistry = createBusRegistry();
  busRegistry.create({ busId: "bus-a", serialPort: "COM1" });
  const service = createOnboardingService({
    busRegistry,
    deviceStore: createDeviceStateStore(),
    profileCatalog: createProfileCatalog(),
    adapter: {
      async testConnection(bus, device) {
        return {
          ok: true,
          busId: bus.busId,
          slaveId: device.slaveId,
          timestamp: new Date(Date.UTC(2026, 0, 1)).toISOString(),
        };
      },
    },
    connectorState: createConnectorStateStore(),
    scheduler: { resync() {} },
  });

  const app = express();
  app.use(express.json());
  app.use("/api", createOnboardingRouter({ onboardingService: service }));

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("onboarding routes expose profiles and device creation", async () => {
  await withServer(async (baseUrl) => {
    const profileResponse = await fetch(`${baseUrl}/api/profiles?deviceType=ups`);
    const profileBody = await profileResponse.json();

    assert.equal(profileResponse.status, 200);
    assert.equal(profileBody.profiles.length > 0, true);

    const createResponse = await fetch(`${baseUrl}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "UPS-1",
        site: "S1",
        rack: "R1",
        deviceType: "ups",
        busId: "bus-a",
        slaveId: 3,
        profileId: "ups.generic",
      }),
    });
    const createBody = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(createBody.device.lifecycle, "Active");
  });
});
