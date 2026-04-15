# Phase 02: Power Chain & Efficiency Management - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade the Power and UPS views to provide deep insights into energy consumption. This includes tracking PDU loads down to the individual circuit level, actively calculating Facility Power Usage Effectiveness (PUE) based on real hardware differentials, and historically charting power consumption to identify peak usage bounds over time.

</domain>

<decisions>
## Implementation Decisions

### 1. Granular PDU Telemetry
- **Backend structure:** 24 distinct hardware loops attached to `pdu1` and `pdu2` models mapped recursively.
- **Frontend layout:** Use existing `Card` boundaries and inject maximum-height scrollable arrays beneath the main KPIs. Do not disrupt the Flex spacing.

### 2. Live PUE Calculation
- **Algorithm:** Total IT power * (1.0 + variable cooling tax driven by CRAC differentials) = Facility Power.
- **Dashboard Anchor:** Overwrite the mocked `1.3` value in `HomeView`'s existing CircularGauge array with the live websocket variable. 

### 3. Historical Power Charting
- **Charting Engine:** Install `recharts` to respect React 19 dependency standards.
- **Influx Extension:** The backend `request_history` socket hook must be explicitly modified to query both `environment` and `facility` buckets.
- **Placement:** Mount `<ResponsiveContainer>` wrappers tightly under the `UPSView` and `PDUView` cards to retain visual harmony. 

### Claude's Discretion
- Exact chart hex color aesthetic bounds (adhere to Tailwind blue/cyan/emerald theme).
- Method for safely guarding the frontend hooks against absent historical socket responses during hot-reloads.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card` (src/DCIM.jsx): Required wrapper for all injected Recharts or outlet grids to keep border styling exact.
- `CircularGauge` (src/DCIM.jsx): Extensible capacity visualizer that the new PUE metric will bind to.

### Established Patterns
- **Websocket Real-time Hooks:** `useRealtimeData.js` currently stores all `envData` blocks. The historical data arrays must be threaded into this exact React state object.

### Integration Points
- Recharts SVGs injected inside `PDUView` and `UPSView`.
- Backend PUE math calculated directly inside the `server/server.js` interval preceding the InfluxDB `Point` serialization.

</code_context>

<specifics>
## Specific Ideas

- The user experienced terminal crash loops when the InfluxDB connection dropped on port 8086 in backend testing environments. The database `WriteApi` instantiation **MUST** contain a `writeFailed` callback silencer, and an `influxAvailable` network lock must be integrated to prevent the `@influxdata` logger from spamming `ECONNREFUSED` exceptions to the terminal indefinitely. 

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 02-power-chain--efficiency-management*
*Context gathered: 2026-03-20*
