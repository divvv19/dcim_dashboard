---
completed: true
wave: 1
files_modified: ["server/server.js", "src/DCIM.jsx", "src/hooks/useRealtimeData.js"]
---

# Summary 02-02: Live PUE Calculation

## What Was Done

### Backend (`server/server.js`)
- Added PUE calculation inside the 1s polling interval:
  - `IT Power (kW)` = sum of (PDU voltage × PDU current) for both PDUs / 1000.
  - `Cooling Tax` = 0.15 base + (returnTemp − supplyTemp) / 100 (thermodynamically-driven variable).
  - `Facility Power (kW)` = IT Power × (1 + Cooling Tax).
  - `PUE` = Facility Power / IT Power.
- Added `system.pue`, `system.itPowerKW`, and `system.facilityPowerKW` to `stateStore` — broadcast every tick via `dashboard:update`.
- Added `facility` InfluxDB measurement point with `pue`, `it_power_kw`, `facility_power_kw`, `pdu1_current`, and `pdu2_current` float fields.
- Fixed InfluxDB `writeFailed` callback to silently handle errors and added `influxAvailable` guard to prevent ECONNREFUSED terminal spam.

### Frontend (`src/DCIM.jsx`)
- `HomeView` now accepts `systemData` prop.
- Replaced hardcoded `value={1.3}` PUE gauge with `value={systemData?.pue || 1.3}`.
- Replaced static "Energy" and "Power" progress bars with live "IT Power" and "Facility Power" bars bound to `systemData.itPowerKW` and `systemData.facilityPowerKW`.

### Realtime Hook (`src/hooks/useRealtimeData.js`)
- Added `system` to initial state with `pue`, `itPowerKW`, `facilityPowerKW` defaults.
- `system` object correctly persists via the existing `dashboard:update` handler.

## Verification Criteria Met
- ✅ PUE calculates dynamically based on thermodynamic bounds.
- ✅ `system.pue` mapped directly to CircularGauge block.
- ✅ PUE fluctuates organically instead of remaining static at 1.30.
