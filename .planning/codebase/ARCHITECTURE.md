# ARCHITECTURE

## High-Level Overview
- Two-part system: Vite React SPA frontend + Node/Express Socket.IO backend.
- Frontend renders a dashboard UI and subscribes to realtime updates.
- Backend simulates telemetry data and broadcasts updates on a 1s interval.

## Frontend Flow
- Entry point: `src/main.jsx` mounts React into `index.html`.
- `src/App.jsx` renders the `DCIM` component.
- `src/DCIM.jsx` contains most UI components and page layouts (single-file component library).
- Realtime data is fetched via `src/hooks/useRealtimeData.js` and fed into UI sections.

## Backend Flow
- `server/server.js` creates an Express app + HTTP server + Socket.IO server.
- Backend maintains an in-memory `stateStore` object with nested telemetry objects.
- A `setInterval` updates values and emits `dashboard:update` every second.
- On client connect, backend emits an immediate snapshot.

## Data Model Shape
- `stateStore.system`, `stateStore.upsData`, `stateStore.coolingData`, `stateStore.envData`, `stateStore.pduData`.
- `stateStore.envData.history` is a rolling array of temperature/humidity points.

## Build/Deploy
- Frontend builds to `dist/` via Vite (`npm run build`).
- Backend runs separately from `server/` (`npm run dev` or `npm start`).
- No shared deployment scripts found.
