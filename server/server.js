const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev simplicity
        methods: ["GET", "POST"]
    }
});

// Mock State Store (Initial State)
let stateStore = {
    system: { connected: true, status: "OK" },
    upsData: {
        inputVoltage: 230.5,
        outputVoltage: 230.0,
        upsState: 'Mains',
        batteryVoltage: 260.4,
        chargingCurrent: 2.1,
        dischargingCurrent: 0.0
    },
    coolingData: {
        supplyTemp: 18.5,
        returnTemp: 24.2,
        compressorStatus: true,
        fanStatus: true,
        highRoomTemp: false
    },
    envData: {
        coldAisleTemp: 22.4,
        coldAisleHum: 48,
        hotAisleTemp: 32.4,
        hotAisleHum: 30,
        fireStatus: 'Normal',
        leakageStatus: 'Normal',
        frontDoorOpen: false,
        backDoorOpen: false,
        outdoorTemp: 18.2,
        history: Array(60).fill(0).map((_, i) => ({
            temp: 22 + Math.random() * 2,
            hum: 45 + Math.random() * 5
        }))
    },
    pduData: {
        pdu1: { voltage: 230.1, current: 12.5, frequency: 50.0, energy: 1450.2, powerFactor: 0.98 },
        pdu2: { voltage: 229.8, current: 11.8, frequency: 50.0, energy: 1320.5, powerFactor: 0.97 }
    }
};

// Polling Simulation Loop (1s interval)
setInterval(() => {
    // Simulate minor fluctuations
    stateStore.upsData.inputVoltage = parseFloat((230 + (Math.random() - 0.5)).toFixed(1));
    stateStore.upsData.outputVoltage = parseFloat((230 + (Math.random() - 0.5) * 0.2).toFixed(1));
    stateStore.coolingData.supplyTemp = parseFloat((18.5 + (Math.random() - 0.5) * 0.5).toFixed(1));

    // Update Outdoor Temp (Random Walk)
    let nextOutdoor = stateStore.envData.outdoorTemp + (Math.random() - 0.5) * 0.1;
    if (nextOutdoor > 30) nextOutdoor -= 0.2;
    if (nextOutdoor < 10) nextOutdoor += 0.2;
    stateStore.envData.outdoorTemp = parseFloat(nextOutdoor.toFixed(1));

    // Update History & Environment
    const lastHistory = stateStore.envData.history[stateStore.envData.history.length - 1];
    let newTemp = lastHistory.temp + (Math.random() - 0.5) * 0.4;
    if (newTemp > 25) newTemp -= 0.2;
    if (newTemp < 21) newTemp += 0.2;

    let newHum = lastHistory.hum + (Math.random() - 0.5) * 1.5;
    if (newHum > 55) newHum -= 0.8;
    if (newHum < 40) newHum += 0.8;

    stateStore.envData.coldAisleTemp = parseFloat(newTemp.toFixed(1));
    stateStore.envData.coldAisleHum = Math.round(newHum);

    // Shift history
    stateStore.envData.history = [...stateStore.envData.history.slice(1), { temp: newTemp, hum: newHum }];

    // Broadcast to all clients
    io.emit('dashboard:update', stateStore);
}, 1000);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send immediate snapshot on connection
    socket.emit('dashboard:update', stateStore);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`DCIM Backend running on port ${PORT}`);
});
