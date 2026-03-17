---
phase: "01"
plan: "01-03"
subsystem: "Backend & Frontend"
tags: ["alerting", "thresholds", "socket"]
requires: ["01-01"]
provides: ["alertManager", "system_alert-socket"]
affects: ["server.js", "DCIM.jsx", "useRealtimeData.js"]
tech-stack.added: []
patterns: ["event-emitter", "socket-to-toast"]
key-files.created: []
key-files.modified: ["server/server.js", "src/DCIM.jsx", "src/hooks/useRealtimeData.js"]
key-decisions:
  - "Added dedicated simulator endpoints (`/api/simulate/fire` and `/api/simulate/leak`) to the express backend so the mockup buttons in DCIM.jsx can natively trigger the threshold `alertManager` across the stack without breaking the hook data flow."
requirements-completed:
  - REQ-1.3
duration: 2m
completed: 2026-03-17T09:12:00Z
---

# Phase 1 Plan 1.3: Alerting System Summary

Implemented backend logic to detect threshold breaches and push real-time alerts to the frontend with distinct severity levels.

## What Was Completed
- Added an `alertManager` function in `server.js` that evaluates `stateStore` properties against safe limits (High Temp, Smoke, Leak).
- Bound the `alertManager` directly into the 1s hardware `setInterval` loop to proactively emit `system_alert` events over Socket.io only when conditions change status.
- Wired `useRealtimeData.js` to listen for `system_alert` and map it into the global `window.dispatchEvent` Toast system organically.
- Refactored the mockup testing buttons to hit new explicit `app.post('/api/simulate/...')` backend routes for genuine end-to-end event triggering.

## Deviations from Plan
**[Rule 4] Refactored Simulation Testing Points**
Found during: UI mock wiring. The original DCIM.jsx mockup trigger buttons previously modified isolated pure local state, which overrides the socket listener payloads poorly. Modified the `toggleFire` and `toggleLeak` actions to trigger the backend API natively so the system genuinely registers the alerts over Socket streams instead.

## Quality Checks
- [x] Backend analyzes polling data natively to push alerts avoiding localized UI logic flaws.
- [x] Alerts contain specific issues and distinct severity rankings cleanly structured.
- [x] Frontend successfully renders these pushes automatically inside the custom React Toast notification block.

## Commits
- 1ac968d feat(01-03): implement backend alerting manager and frontend Toast integrations

## Next Steps
Ready for 01-04-PLAN.

## Self-Check: PASSED
