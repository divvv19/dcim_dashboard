const express = require("express");
const { ValidationError } = require("./validators");

function createOnboardingRouter({ onboardingService }) {
  const router = express.Router();

  router.get("/buses", (request, response) => {
    response.json({ buses: onboardingService.listBuses() });
  });

  router.post("/buses", (request, response, next) => {
    try {
      const bus = onboardingService.createBus(request.body);
      response.status(201).json({ bus });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/buses/:busId", (request, response, next) => {
    try {
      const bus = onboardingService.updateBus(request.params.busId, request.body);
      response.json({ bus });
    } catch (error) {
      next(error);
    }
  });

  router.get("/profiles", (request, response) => {
    response.json({ profiles: onboardingService.listProfiles(request.query.deviceType ?? null) });
  });

  router.get("/devices", (request, response) => {
    response.json({ devices: onboardingService.listDevices() });
  });

  router.post("/devices/test-connection", async (request, response, next) => {
    try {
      const result = await onboardingService.runConnectionTest(request.body);
      response.json({ result });
    } catch (error) {
      next(error);
    }
  });

  router.post("/devices", async (request, response, next) => {
    try {
      const result = await onboardingService.createDevice(request.body);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.put("/devices/:deviceId", async (request, response, next) => {
    try {
      const result = await onboardingService.updateDevice(request.params.deviceId, request.body);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.use((error, request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    if (error instanceof ValidationError) {
      response.status(error.statusCode).json({
        error: error.message,
        issues: error.issues,
      });
      return;
    }

    if (/not found/i.test(error.message)) {
      response.status(404).json({ error: error.message });
      return;
    }

    response.status(400).json({
      error: error.message || "Unexpected onboarding error.",
    });
  });

  return router;
}

module.exports = {
  createOnboardingRouter,
};
