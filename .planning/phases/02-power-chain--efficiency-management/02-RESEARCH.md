# Phase 02: Power Chain & Efficiency Management - Research

**Gathered:** 2026-03-26
**Status:** Ready for planning

## 1. Context & Goals
**Phase Goal:** Upgrade power metrics, implement live PUE analytics, and chart historical energy usage.
**Related Decisions:** (From `02-CONTEXT.md`) Map 24 hardware loops for outlets, inject `recharts` for historical mapping, compute PUE actively based on thermodynamic load.

## 2. Technical Investigation

### A. Granular PDU Outlets (Frontend & Backend)
- **Backend Model:** Each PDU in `server.js` state must cache an `outlets: []` array. We will generate 24 simulated circuits per loop `(Array.from({length: 24}))`.
- **Frontend Strategy:** `DCIM.jsx`'s `PDUView` currently mounts standard KPIs. We will add a `<div className="overflow-y-auto">` mapped grid underneath displaying LED statuses.

### B. Live PUE Computation
- **Math:** Total IT power is the sum of PDU energy. Facility Power is IT + Cooling Tax. `PUE = Facility / IT`.
- **Data Pipeline:** `server.js` interval logic will parse this dynamically upon each tick. The InfluxDB writer must be explicitly modified to cast `point.floatField('pue', ...)` to save the values alongside regular environment variables. The `system.pue` frontend hkook must be wired to replace the hardcoded `1.30` mock.

### C. Recharts Dependencies
- **Installation:** `npm install recharts`. Recharts safely encapsulates D3.js math inside React components.
- **Frontend Syntax:**
  ```javascript
  import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
  ```
- **Historical Data Structure:** `useRealtimeData.js` currently parses `envData`. We must ensure the Socket.io `history_data` payload structure correctly contains `time`, `value`, and `field` (`pue`, `facility_load_kw`) so `useMemo` can extract `{ time, pue, ... }` correctly.

## 3. Risk Assessment
- **Component Breakage:** Injecting `<ResponsiveContainer>` inherently assumes absolute parent height dimensions exist. If `UPSView` or `PDUView` are not constrained vertically inside flex columns, the chart geometries will collapse or overflow.
- **Influx Connection Flap:** The `ECONNREFUSED` spam loop problem exists when Influx drops packets. The `writeFailed: function() {}` silencer must be heavily enforced.

## 4. Next Steps for Planning
- Plan `02-01-PLAN.md` to map the 24 outlet arrays.
- Plan `02-02-PLAN.md` to establish PUE math algorithms inside the interval loop.
- Plan `02-03-PLAN.md` to install and map the `recharts` historical visualization layers.
