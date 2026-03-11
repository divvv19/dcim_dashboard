# Stack Research

**Domain:** Micro data center DCIM (multi-protocol monitoring)
**Researched:** 2026-03-11
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 22 LTS | Protocol gateway and telemetry ingestion services | Strong ecosystem for SNMP/Modbus libraries and good fit with existing backend |
| TypeScript | 5.x | Shared contracts and safer connector/alarm code | Reduces integration defects in heterogeneous device models |
| PostgreSQL + TimescaleDB | Postgres 16 + Timescale 2.x | Device metadata + time-series telemetry | Mature SQL + time-series model for alarms, trends, and retention policies |
| React | 19.x | Operations dashboard UI | Already in place, supports modular panel-based MDC views |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| socket.io | 4.8.x | Live telemetry/alarm stream to UI | Core realtime channel for active operations screens |
| modbus-serial | 8.x | Modbus TCP/RTU polling | v1 AC and UPS integration adapters |
| net-snmp | 3.8.x | SNMP polling/traps | Sensor and networked equipment integrations |
| zod | 3.x | Telemetry schema validation | Normalize vendor payloads into canonical model |
| bullmq | 5.x | Retryable background jobs | Poll scheduling, backoff, and connector recovery workflows |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Unit and integration tests | Fast TS-native test runner for adapter logic |
| Supertest | API contract tests | Validate backend endpoints and alarm APIs |
| Docker Compose | Local integration stack | Run DB + backend + dashboard together |
| ESLint + Prettier | Code quality and consistency | Enforce style across frontend and backend modules |

## Installation

```bash
# Core
npm install socket.io zod bullmq

# Protocol integrations
cd server
npm install modbus-serial net-snmp

# Dev dependencies
npm install -D typescript vitest supertest
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| PostgreSQL + TimescaleDB | InfluxDB | If telemetry retention/aggregation dominates and relational joins are minimal |
| socket.io | MQTT broker fanout | If edge deployments already have MQTT infrastructure |
| Node.js services | Go services | If polling fanout and low-latency protocol workloads exceed Node process limits |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Vendor-specific payloads in UI | Locks product to equipment brand and breaks scale | Canonical telemetry schema in backend |
| Single process for polling + UI + alarms | Coupled failures and poor recovery behavior | Split gateway, alarm, and API responsibilities |
| Predictive AI in v1 | High complexity before baseline data quality is stable | Rule-based alarms and trend thresholds first |

## Stack Patterns by Variant

**If deployment is single-site edge-first:**
- Use one backend process with modular services
- Because operational simplicity beats early distributed complexity

**If deployment spans many sites:**
- Use per-site connector workers with central event ingestion
- Because protocol polling failures should be isolated by site

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| socket.io@4.8.x | socket.io-client@4.8.x | Keep major versions aligned for stable reconnect behavior |
| React@19.x | Vite@7.x | Current project baseline already compatible |
| modbus-serial@8.x | Node 18+ | Works with modern Node LTS runtime |

## Sources

- Existing project docs: `.planning/codebase/STACK.md`, `.planning/codebase/ARCHITECTURE.md`
- Protocol standards context: Modbus Application Protocol, SNMP RFC model
- Operational DCIM patterns inferred from established NOC/monitoring architecture practices

---
*Stack research for: micro data center DCIM*
*Researched: 2026-03-11*
