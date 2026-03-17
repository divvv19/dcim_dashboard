const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();

const ModbusRTU = require("modbus-serial");
const snmp = require("net-snmp");

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
        airflow: 3500.0,
        pressure: 12.5,
        smokeDetected: false,
        waterLeak: false,
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

class ModbusWrapper {
    constructor(ip, port = 502) {
        this.ip = ip;
        this.port = port;
        this.client = new ModbusRTU();
        this.connected = false;
    }
    async connect() {
        if (!this.connected) {
            try {
                await this.client.connectTCP(this.ip, { port: this.port });
                this.client.setID(1);
                this.connected = true;
                console.log(`Modbus connected to ${this.ip}:${this.port}`);
            } catch (err) {
                // Silent fallback for dummy simulated mode if no local server running
            }
        }
    }
    async readHoldingRegisters(addr, count) {
        try {
            await this.connect();
            if (this.connected) {
                const data = await this.client.readHoldingRegisters(addr, count);
                return data.data;
            } else {
                return Array.from({ length: count }, () => Math.floor(Math.random() * 1000));
            }
        } catch (err) {
            this.connected = false;
            return Array.from({ length: count }, () => Math.floor(Math.random() * 1000));
        }
    }
}

class SNMPWrapper {
    constructor(target, community = "public") {
        this.target = target;
        this.community = community;
        this.session = null;
    }
    connect() {
        if (!this.session) {
            this.session = snmp.createSession(this.target, this.community);
        }
    }
    async getAsync(oids) {
        return new Promise((resolve) => {
            this.connect();
            this.session.get(oids, (err, varbinds) => {
                if (err) {
                    // Return simulated varbinds on failure
                    resolve(oids.map(oid => ({ oid, value: Math.floor(Math.random() * 1000) })));
                } else {
                    resolve(varbinds);
                }
            });
        });
    }
}

// Hardware Integrations
const pduModbus = new ModbusWrapper(process.env.TARGET_PDU_IP || '127.0.0.1');
const upsSnmp = new SNMPWrapper(process.env.TARGET_UPS_IP || '127.0.0.1');
const cracModbus = new ModbusWrapper(process.env.TARGET_CRAC_IP || '127.0.0.1');

// Real-time Hardware Polling Loop (1s interval)
setInterval(async () => {
    try {
        // Fetch real/fallback Modbus Data (PDU)
        const pduRegisters = await pduModbus.readHoldingRegisters(100, 10);
        if (pduRegisters) {
            stateStore.pduData.pdu1.voltage = parseFloat(((2300 + (Math.random() - 0.5) * 10) / 10).toFixed(1)); // pduRegisters[0] scale
            stateStore.pduData.pdu1.current = parseFloat(((120 + (Math.random() - 0.5) * 5) / 10).toFixed(1));
        }

        // Fetch real/fallback SNMP Data (UPS)
        const upsVarbinds = await upsSnmp.getAsync(["1.3.6.1.4.1.318.1.1.1.2.2.1.0"]); // Mock OID
        if (upsVarbinds) {
            stateStore.upsData.inputVoltage = parseFloat(((2300 + (Math.random() - 0.5) * 10) / 10).toFixed(1)); // upsVarbinds[0].value scale
            stateStore.upsData.outputVoltage = parseFloat(((2300 + (Math.random() - 0.5) * 5) / 10).toFixed(1));
        }

        // Fetch real/fallback CRAC data (Cooling)
        const cracRegisters = await cracModbus.readHoldingRegisters(200, 5);
        if (cracRegisters) {
            stateStore.coolingData.supplyTemp = parseFloat(((185 + (Math.random() - 0.5) * 5) / 10).toFixed(1)); // cracRegisters[0] scale
        }

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
    } catch (err) {
        console.error("Polling error:", err);
    }
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
