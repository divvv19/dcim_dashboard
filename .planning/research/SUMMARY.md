# Project Research Summary

**Project:** MDC Protocol-Agnostic DCIM
**Domain:** Micro data center infrastructure monitoring and alerting
**Researched:** 2026-03-11
**Confidence:** MEDIUM

## Executive Summary

This project is an operations-first DCIM platform for micro data centers where devices from different vendors and protocols must be monitored through one coherent interface. The highest-value launch path is to formalize protocol adapters (Modbus and SNMP), normalize telemetry into a canonical model, and build a reliable alarm lifecycle with clear severity and notification behavior.

The recommended approach is to evolve the existing dashboard/backend into a layered system: connector workers, normalization and alarm domain services, and a realtime API/UI layer. This order reduces integration risk and avoids hard-to-maintain vendor-specific logic in user interfaces.

Key risks are alarm noise, connector health blind spots, and scaling bottlenecks in polling workloads. These are mitigated by explicit alarm state transitions, connector health/freshness metrics, and worker isolation with retry/backoff policies.

## Key Findings

### Recommended Stack

Use Node.js + TypeScript services with Modbus/SNMP connectors, canonical schema validation, and PostgreSQL/Timescale for telemetry + alarm history. Keep the existing React and Socket.IO frontend path, but move protocol and alarm complexity fully to backend domain modules.

**Core technologies:**
- Node.js + TypeScript: connector runtime and domain logic with safer contracts
- PostgreSQL + TimescaleDB: metadata plus time-series/alarm persistence
- Socket.IO: low-latency operations updates to dashboard clients

### Expected Features

**Must have (table stakes):**
- Modbus/SNMP adapters with connector lifecycle visibility
- Canonical telemetry model and realtime unified dashboard
- Alarm severity engine with ack/clear transitions and routed alerts

**Should have (competitive):**
- Topology-aware alarm context and connector health scoring
- Runbook-linked alarms for faster incident handling

**Defer (v2+):**
- Predictive AI analytics
- Broad remote control actions

### Architecture Approach

Adopt a layered architecture where connector workers feed normalized telemetry to domain services, then expose state through API + realtime channels. This enables independent scaling of protocol workloads and cleaner fault isolation.

**Major components:**
1. Connector workers - Modbus/SNMP polling, retries, backoff, heartbeat
2. Domain services - normalization, alarm lifecycle, notification routing
3. API/realtime layer - query endpoints and live operations streaming

### Critical Pitfalls

1. **Vendor-specific model leakage** - prevent via canonical schema contracts
2. **Alarm storms** - prevent via transition-based stateful alarm engine
3. **Polling saturation** - prevent via worker isolation and adaptive schedules
4. **Silent connector failures** - prevent via freshness and health indicators

## Implications for Roadmap

### Phase 1: Integration Foundation
**Rationale:** Canonical model and connector contracts are prerequisites for all higher-level features.
**Delivers:** Device inventory baseline, connector framework, canonical telemetry schema.
**Addresses:** Protocol adapters and normalized data requirements.
**Avoids:** Vendor-locked data model pitfall.

### Phase 2: Realtime Alarming Core
**Rationale:** Core operational value is reliable incident visibility and response.
**Delivers:** Alarm engine, severity policy, alert routing, realtime event flow.
**Uses:** Connector outputs and canonical schema from Phase 1.
**Implements:** Alarm lifecycle and notification services.

### Phase 3: Operations Hardening
**Rationale:** Production rollout requires observability and reliability controls.
**Delivers:** Connector health scoring, stale-data detection, operational metrics.
**Addresses:** Silent failure and scaling risk.

### Phase Ordering Rationale

- Protocol and schema must precede alarm logic to keep thresholds consistent.
- Alarm workflows must stabilize before adding advanced UX and analytics.
- Hardening follows once core ingest/alarm paths are live and measurable.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Device profile management and canonical schema versioning
- **Phase 2:** Alarm dedup and escalation policy by site/equipment class

Phases with standard patterns (research optional):
- **Phase 3:** Reliability instrumentation and operational dashboards

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Strong baseline from existing architecture and known tooling patterns |
| Features | MEDIUM | Good operational fit; exact site-specific needs still to refine |
| Architecture | MEDIUM | Clear layered approach, but scale targets need field validation |
| Pitfalls | MEDIUM | Common MDC integration failure modes are well-known |

**Overall confidence:** MEDIUM

### Gaps to Address

- Exact device/OID/register mapping catalog for first supported vendors
- Alarm policy defaults by device class and site criticality
- Expected site/device scale targets for connector capacity planning

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md`
- `.planning/codebase/*.md`

### Secondary (MEDIUM confidence)
- Domain best practices from multi-protocol monitoring and NOC operations

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
