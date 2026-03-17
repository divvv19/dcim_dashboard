# Phase 1: Real-time Backend Integration & Core Environmental Monitoring - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning
**Source:** PRD Express Path (C:\Users\user\.gemini\antigravity\brain\5b3e2e7f-3b86-4071-8af8-e3c88c48ae2b\implementation_plan.md)

<domain>
## Phase Boundary

Connect the current mock backend to real hardware protocols (`modbus-serial` and `net-snmp`), expand the environmental sensor data models, implement an alerting system for threshold breaches, and integrate a time-series database (InfluxDB or PostgreSQL) to replace the transient array storage.
</domain>

<decisions>
## Implementation Decisions

### Protocol Integrations
- Replace simulation loop in `server/server.js` with real `modbus-serial` and `net-snmp` integrations for PDUs, UPS, and CRAC units.

### Environmental Modeling
- Expand the `envData` model to include Airflow, Air Pressure, Smoke, and Water Leak contact closure sensors.

### Alerting System
- Implement backend logic to detect threshold breaches (e.g., high temperature, water leak) and push real-time alerts to the frontend with distinct severity levels.

### Data Storage
- Integrate a time-series database (e.g., InfluxDB or PostgreSQL) to store historical sensor data, replacing the transient array in `server.js`.

### Claude's Discretion
- Choice between InfluxDB and PostgreSQL (InfluxDB is highly recommended for time-series data like this).
- Specific data schemas and polling intervals for the Modbus/SNMP queries.
- Architecture of the new alerting event emitter module.
</decisions>

<specifics>
## Specific Ideas

- Ensure Modbus handles serial or TCP variations seamlessly based on the `modbus-serial` configuration.
- Alerts need distinct severity levels so the frontend toast system can color-code them appropriately (e.g., Warning=Yellow, Critical=Red).
</specifics>

<deferred>
## Deferred Ideas

- PUE calculations, granular PDU tracking, and historical charts are deferred to Phase 2.
- Asset database and Rack elevations are deferred to Phase 3.
- Security and 3D implementations are deferred to later phases.
</deferred>

---

*Phase: 01-real-time-backend-integration--core-environmental-monitoring*
*Context gathered: 2026-03-11 via PRD Express Path*
