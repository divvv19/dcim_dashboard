# Architecture

## Pattern
Client-Server Architecture with Real-Time Data Streaming.
- Frontend acts as a visualization layer (DCIM Dashboard).
- Backend acts as a polling middleware, fetching data from hardware via Modbus/SNMP and pushing to the frontend via WebSockets.

## Data Flow
Hardware (Modbus/SNMP) -> Backend (Node.js/Express) -> Socket.IO Emit -> Frontend (React Hook `useRealtimeData`) -> State Updates -> Custom UI Components (Cards, Gauges, Values).

## Key Components
- **Frontend Dashboard (`src/DCIM.jsx`)**: Main visualization with Tabs (Home, Cooling, UPS, PDU, Environment, Rack Designer).
- **Backend Poller (`server/server.js`)**: Currently implements a mock polling simulation loop (every 1 second) and broadcasts state to connected clients.
