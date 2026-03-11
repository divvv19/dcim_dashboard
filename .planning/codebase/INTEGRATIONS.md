# INTEGRATIONS

## Realtime Channel (Socket.IO)
- Frontend connects to `http://localhost:5000` via `socket.io-client`. See `src/hooks/useRealtimeData.js`.
- Frontend listens for `dashboard:update` events and updates UI state. See `src/hooks/useRealtimeData.js`.
- Backend emits `dashboard:update` to all clients every second. See `server/server.js`.
- Backend sends an immediate snapshot on client connect. See `server/server.js`.
- Transport is WebSocket with Socket.IO fallback handling (library default).

## External Services
- None configured (no REST calls, databases, or auth providers found).
- No third-party telemetry APIs found in `src/` or `server/`.
- Dependencies included but not used yet: `modbus-serial`, `net-snmp` in `server/package.json`.

## Environment / Config
- Backend reads `PORT` from environment via `dotenv`, with default `5000`. See `server/server.js`.
- Frontend socket URL is a hardcoded constant, not an environment variable. See `src/hooks/useRealtimeData.js`.

## Cross-Origin Settings
- Express uses `cors()` with permissive defaults. See `server/server.js`.
- Socket.IO CORS allows all origins (`origin: "*"`). See `server/server.js`.

## Ports & Local Dev
- Backend default: `http://localhost:5000`.
- Frontend default (Vite): `http://localhost:5173` (as documented in `README.md`).
