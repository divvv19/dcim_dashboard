# MDC Protocol-Agnostic DCIM

## What This Is

A DCIM platform for micro data centers that unifies AC, UPS, and sensor telemetry into a single operational view. It is designed for MDC operators who currently rely on fragmented vendor tools. The current v1 path is centered on Modbus RTU devices on shared RS485 buses, with simulation-first execution until field hardware is available.

## Core Value

Operators get one dependable pane of glass for real-time MDC health and alarms across heterogeneous equipment.

## Requirements

### Validated

- ✓ Real-time dashboard rendering for infrastructure telemetry (existing UI + backend simulation)
- ✓ Live push update pattern over Socket.IO (`dashboard:update`) between backend and frontend
- ✓ Core monitoring views for cooling, UPS, and environmental status in current dashboard

### Active

- [ ] Connect real MDC devices over Modbus RTU on RS485 with a normalized telemetry model
- [ ] Build reliable alarm pipeline with severity classification and operator-focused alerting
- [ ] Support multi-component MDC topology (AC, UPS, sensors) under one site operations workflow

### Out of Scope

- Predictive AI analytics in v1 - first release must stabilize connectivity and alarms
- Advanced optimization/recommendation engines in v1 - defer until baseline observability is production-proven

## Context

The current codebase already contains a React dashboard and Node/Socket.IO backend with simulated data updates. Existing monitoring concepts (cooling, UPS, environment, alarm indicators) are a strong starting point for protocol integration. The primary pain point to solve is fragmented tooling and poor operational coherence across device vendors and protocols.

## Constraints

- **Protocols**: Modbus RTU over RS485 first - all currently known target devices use this transport
- **Hardware Availability**: No live field hardware available during initial build - simulation mode is required for Phase 1 execution
- **User Focus**: MDC operators first - optimize workflows for on-site operations teams
- **Delivery Scope**: Live monitoring plus reliable alerts - keep v1 focused on operational visibility
- **Architecture**: Must integrate heterogeneous devices - data model cannot be vendor-specific

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Protocol-first integration strategy (Modbus RTU over RS485) | Matches current device fleet and reduces early connector complexity | - Pending |
| Simulation-first execution for Phase 1 | Hardware is not currently available, but onboarding, polling, and UI flows can still be validated end-to-end | - Pending |
| Prioritize monitoring + alarms before controls | Core value is dependable visibility and incident response | - Pending |
| Exclude predictive AI from v1 | Reduces risk and complexity while building integration foundation | - Pending |

---
*Last updated: 2026-03-11 after initialization*
