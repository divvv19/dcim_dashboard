# Architecture Research

**Domain:** Multi-protocol micro data center DCIM
**Researched:** 2026-03-11
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
+----------------------------- Operator UI -----------------------------+
| Dashboards | Alarm Console | Device Inventory | Site Views          |
+---------------------------^------------------^------------------------+
                            | realtime/events  | query
+---------------------------+------------------+------------------------+
| API + Realtime Layer (REST + Socket.IO)                              |
+---------------------------^------------------^------------------------+
                            | normalized data  | alarm state
+---------------------------+------------------+------------------------+
| Domain Services: Telemetry Normalizer | Alarm Engine | Notification     |
+---------------------------^------------------^------------------------+
                            | raw protocol data
+---------------------------+------------------+------------------------+
| Connector Workers: Modbus Pollers | SNMP Pollers/Traps               |
+---------------------------^------------------^------------------------+
                            | read/write metadata
+---------------------------+------------------+------------------------+
| Storage: Device Registry | Time-series Telemetry | Alarm/Event History |
+-----------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Connector Workers | Poll protocol endpoints and parse raw values | Isolated workers with retry/backoff and heartbeat |
| Telemetry Normalizer | Map vendor-specific payloads to canonical schema | Validation + mapping layer with unit conversion |
| Alarm Engine | Evaluate rules and maintain alarm lifecycle state | Stateful threshold/event processing service |
| API/Realtime Layer | Serve current state and push updates to clients | REST for query + Socket.IO for live stream |
| Notification Service | Route alerts to channels with escalation policies | Email/webhook queue with dedup |

## Recommended Project Structure

```
server/
|-- src/
|   |-- connectors/         # protocol adapters and polling workers
|   |   |-- modbus/
|   |   `-- snmp/
|   |-- domain/             # telemetry, alarm, notification logic
|   |-- api/                # REST handlers and socket gateways
|   |-- infra/              # db, queue, config, logging
|   `-- shared/             # schema, types, constants
|-- tests/
`-- package.json

src/
|-- modules/                # dashboard feature modules
|-- hooks/                  # realtime/data hooks
|-- components/             # reusable UI components
`-- pages/                  # view composition
```

### Structure Rationale

- **connectors/** isolates protocol-specific complexity from business logic.
- **domain/** centralizes canonical data and alarms so UI is vendor-agnostic.
- **api/** separates transport concerns from telemetry/alarm rules.

## Architectural Patterns

### Pattern 1: Adapter Pattern for Protocols

**What:** Each protocol/vendor parser implements one connector interface.
**When to use:** Any device integration path.
**Trade-offs:** More boilerplate, much cleaner extension model.

### Pattern 2: Event-Driven Telemetry Pipeline

**What:** Connector outputs become events consumed by normalization/alarm services.
**When to use:** Realtime systems with multiple data producers.
**Trade-offs:** Better decoupling, requires robust event observability.

### Pattern 3: Rule-State Alarm Lifecycle

**What:** Alarm transitions `normal -> active -> acknowledged -> cleared` are explicit.
**When to use:** Operator workflows requiring reliable incident handling.
**Trade-offs:** Slightly more state logic, much lower alert noise and ambiguity.

## Data Flow

### Request Flow

```
Device poll/trap
  -> Connector worker
    -> Normalizer
      -> Alarm engine + storage
        -> API/Socket layer
          -> Dashboard + notifications
```

### State Management

```
Canonical state store
  -> API query responses
  -> Socket realtime events
  -> Alarm state machine updates
```

### Key Data Flows

1. **Telemetry ingest flow:** protocol read to canonical metric persistence.
2. **Alarm flow:** metric event to rule evaluation to routed notification.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-10 sites | Single backend service with worker pools is sufficient |
| 10-100 sites | Split connector workers from API/alarm services |
| 100+ sites | Partition by site/region and add event bus + horizontal workers |

### Scaling Priorities

1. **First bottleneck:** connector polling throughput; isolate workers and tune polling windows.
2. **Second bottleneck:** alarm/event write volume; optimize storage indexes and retention.

## Anti-Patterns

### Anti-Pattern 1: UI-Coupled Protocol Parsing

**What people do:** Parse vendor payloads directly in UI layer.
**Why it's wrong:** Creates fragile frontend logic and vendor lock-in.
**Do this instead:** Parse and normalize in backend domain services.

### Anti-Pattern 2: Stateless Alarm Triggering

**What people do:** Emit notification on every threshold violation.
**Why it's wrong:** Alert storms and operator fatigue.
**Do this instead:** Maintain alarm lifecycle state with dedup and cooldown.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Modbus devices | Polling workers | Support per-device interval and timeout tuning |
| SNMP devices | Poll + trap listener | Handle MIB mapping and unit normalization |
| Notification channels | Queue-based dispatch | Avoid blocking alarm pipeline on outbound failures |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| connectors <-> domain | events/contracts | Canonical schema versioning is critical |
| domain <-> api | service APIs | API should not depend on vendor-specific models |

## Sources

- Existing codebase docs: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`
- Existing backend behavior in `server/server.js`
- MDC/DCIM integration practices inferred from multi-protocol monitoring systems

---
*Architecture research for: micro data center DCIM*
*Researched: 2026-03-11*
