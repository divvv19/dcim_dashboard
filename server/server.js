const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const { createBusRegistry } = require("./src/buses/busRegistry");
const { createOnboardingRouter } = require("./src/onboarding/onboardingRoutes");
const { createOnboardingService } = require("./src/onboarding/onboardingService");
const { createConnectorStateStore } = require("./src/polling/connectorState");
const { createPollScheduler } = require("./src/polling/pollScheduler");
const { createProfileCatalog } = require("./src/profiles/profileCatalog");
const { createModbusRtuAdapter } = require("./src/protocols/modbusRtuAdapter");
const { createSimulatedRtuAdapter } = require("./src/protocols/simulatedRtuAdapter");
const { createSnapshotProjector } = require("./src/realtime/snapshotProjector");
const { createDeviceStateStore } = require("./src/state/deviceStateStore");

const transportMode = process.env.DCIM_CONNECTOR_MODE === "hardware" ? "hardware" : "simulation";
const simulationScenario = process.env.DCIM_SIM_SCENARIO || "nominal";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH"],
  },
});

const busRegistry = createBusRegistry({
  seedBuses: [
    {
      busId: "bus-lab-a",
      name: "Lab RS485 Bus A",
      serialPort: process.env.DCIM_DEFAULT_SERIAL_PORT || "COM1",
    },
  ],
});
const deviceStore = createDeviceStateStore();
const profileCatalog = createProfileCatalog();
const connectorState = createConnectorStateStore();
const adapter = transportMode === "hardware"
  ? createModbusRtuAdapter()
  : createSimulatedRtuAdapter({ defaultScenario: simulationScenario });

const legacyState = {
  system: { connected: true, status: "OK", transportMode },
  upsData: {
    inputVoltage: 230.5,
    outputVoltage: 230.0,
    upsState: "Mains",
    batteryVoltage: 260.4,
    chargingCurrent: 2.1,
    dischargingCurrent: 0.0,
  },
  coolingData: {
    supplyTemp: 18.5,
    returnTemp: 24.2,
    compressorStatus: true,
    fanStatus: true,
    highRoomTemp: false,
  },
  envData: {
    coldAisleTemp: 22.4,
    coldAisleHum: 48,
    hotAisleTemp: 32.4,
    hotAisleHum: 30,
    fireStatus: "Normal",
    leakageStatus: "Normal",
    frontDoorOpen: false,
    backDoorOpen: false,
    outdoorTemp: 18.2,
    history: Array(60).fill(0).map(() => ({
      temp: 22 + Math.random() * 2,
      hum: 45 + Math.random() * 5,
    })),
  },
  pduData: {
    pdu1: { voltage: 230.1, current: 12.5, frequency: 50.0, energy: 1450.2, powerFactor: 0.98 },
    pdu2: { voltage: 229.8, current: 11.8, frequency: 50.0, energy: 1320.5, powerFactor: 0.97 },
  },
};

function getLegacyState() {
  return {
    ...legacyState,
    system: {
      ...legacyState.system,
      transportMode,
      status: transportMode === "simulation" ? "SIMULATION" : "LIVE",
    },
  };
}

const snapshotProjector = createSnapshotProjector({
  transportMode,
  getLegacyState,
  busRegistry,
  deviceStore,
  connectorState,
});

function emitSnapshot() {
  io.emit("dashboard:update", snapshotProjector.project());
}

const scheduler = createPollScheduler({
  busRegistry,
  deviceStore,
  profileCatalog,
  adapter,
  connectorState,
  onUpdate: emitSnapshot,
});

const onboardingService = createOnboardingService({
  busRegistry,
  deviceStore,
  profileCatalog,
  adapter,
  connectorState,
  scheduler,
});

app.get("/api/health", (request, response) => {
  response.json({
    ok: true,
    transportMode,
  });
});

app.use("/api", createOnboardingRouter({ onboardingService }));

function updateLegacySimulation() {
  legacyState.upsData.inputVoltage = Number((230 + (Math.random() - 0.5)).toFixed(1));
  legacyState.upsData.outputVoltage = Number((230 + (Math.random() - 0.5) * 0.2).toFixed(1));
  legacyState.coolingData.supplyTemp = Number((18.5 + (Math.random() - 0.5) * 0.5).toFixed(1));

  let nextOutdoor = legacyState.envData.outdoorTemp + (Math.random() - 0.5) * 0.1;
  if (nextOutdoor > 30) nextOutdoor -= 0.2;
  if (nextOutdoor < 10) nextOutdoor += 0.2;
  legacyState.envData.outdoorTemp = Number(nextOutdoor.toFixed(1));

  const lastHistory = legacyState.envData.history[legacyState.envData.history.length - 1];
  let newTemp = lastHistory.temp + (Math.random() - 0.5) * 0.4;
  if (newTemp > 25) newTemp -= 0.2;
  if (newTemp < 21) newTemp += 0.2;

  let newHum = lastHistory.hum + (Math.random() - 0.5) * 1.5;
  if (newHum > 55) newHum -= 0.8;
  if (newHum < 40) newHum += 0.8;

  legacyState.envData.coldAisleTemp = Number(newTemp.toFixed(1));
  legacyState.envData.coldAisleHum = Math.round(newHum);
  legacyState.envData.history = [
    ...legacyState.envData.history.slice(1),
    { temp: newTemp, hum: newHum },
  ];
}

setInterval(() => {
  updateLegacySimulation();
  emitSnapshot();
}, 1000);

io.on("connection", (socket) => {
  socket.emit("dashboard:update", snapshotProjector.project());
});

scheduler.start();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`DCIM Backend running on port ${PORT} in ${transportMode} mode`);
});
