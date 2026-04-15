# Pitfalls Research

**Domain:** Micro data center DCIM with protocol integration
**Researched:** 2026-03-11
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Vendor-Specific Data Leaking into Core Model

**What goes wrong:**
Every new device requires ad-hoc UI and alarm logic changes.

**Why it happens:**
Teams skip canonical telemetry modeling to ship integrations quickly.

**How to avoid:**
Define required canonical metric/alarm fields before adding connectors.

**Warning signs:**
Frequent conditional logic by vendor in UI or alarm code.

**Phase to address:**
Phase 1 (data model and connector contract baseline).

---

### Pitfall 2: Alarm Storms from Stateless Thresholding

**What goes wrong:**
Operators receive repeated alerts and stop trusting the system.

**Why it happens:**
No dedup, cooldown, or acknowledgment state in alarm engine.

**How to avoid:**
Implement explicit alarm lifecycle with transition-based notifications.

**Warning signs:**
High alert volume with low incident resolution quality.

**Phase to address:**
Phase 2 (alarm engine and notification rules).

---

### Pitfall 3: Polling Load Saturation

**What goes wrong:**
Connector workers fall behind and telemetry freshness degrades.

**Why it happens:**
Single-process polling and fixed intervals for all device classes.

**How to avoid:**
Use worker pools with per-device polling strategy and backoff.

**Warning signs:**
Increasing stale-device counts and timeout spikes at higher site counts.

**Phase to address:**
Phase 2 (connector runtime and scaling controls).

---

### Pitfall 4: Missing Data Quality and Health Signals

**What goes wrong:**
Dashboard looks healthy while connectors are partially failing.

**Why it happens:**
No connector heartbeat or metric freshness checks.

**How to avoid:**
Track last-seen timestamps, connector health, and ingestion lag metrics.

**Warning signs:**
Flat metrics without corresponding device state transitions.

**Phase to address:**
Phase 1 (observability baseline) and Phase 3 (operational hardening).

---

### Pitfall 5: Unsafe Early Remote Control

**What goes wrong:**
Operational or safety incidents from poorly controlled commands.

**Why it happens:**
Control features introduced before robust RBAC/audit/change policy.

**How to avoid:**
Keep v1 read-focused; defer control until policy + audit foundation exists.

**Warning signs:**
Pressure to add direct command toggles without governance controls.

**Phase to address:**
Out-of-scope for v1; revisit in future phase planning.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded OIDs/register maps in code | Faster first integration | Difficult maintenance for new vendors | Only for throwaway prototype |
| UI-specific alarm logic | Quick visible output | Inconsistent behavior and duplicated rules | Never for production |
| No retry/backoff policy | Simpler connector loop | Cascading outages during network jitter | Never |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Modbus | Assuming uniform register scaling/units | Per-device mapping profiles with explicit unit transforms |
| SNMP | Treating trap OIDs as stable across vendors | Vendor MIB mapping layer + canonical alarm mapping |
| Notification providers | Sending alerts inline from alarm path | Queue and retry with dead-letter handling |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Shared event loop for heavy polling | API latency spikes during poll windows | Isolate connector workers/processes | Medium/high device counts |
| Unbounded telemetry retention | DB growth and slow queries | Retention policies + rollups | Months of production data |
| Full refresh dashboard payloads | UI lag and bandwidth waste | Incremental updates and windowed queries | Multi-site views |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Plain-text protocol credentials in config files | Credential leakage | Secret manager/env vault + rotation policy |
| No audit trail for alarm actions | Compliance and accountability gaps | Immutable alarm ack/clear audit logs |
| Overly broad CORS and auth gaps | Unauthorized data access | Enforce authn/authz + explicit CORS policy |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Too many colors/states without hierarchy | Slower incident triage | Clear severity hierarchy and concise status badges |
| Alarm list without context | Operators cannot prioritize quickly | Show device, site, duration, and last transition |
| No stale-data indicators | False sense of healthy operations | Display freshness and connector health on each panel |

## "Looks Done But Isn't" Checklist

- [ ] **Protocol integration:** Includes retries, timeouts, and stale-data handling
- [ ] **Alarm engine:** Supports dedup, ack, clear, and escalation timing
- [ ] **Dashboard:** Shows connector/data freshness, not only latest values
- [ ] **Notifications:** Has failure handling and retry telemetry

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Alarm storms | MEDIUM | Introduce dedup/cooldown and re-baseline thresholds |
| Canonical model drift | HIGH | Freeze schema version, migrate mappings, backfill key metrics |
| Polling saturation | MEDIUM | Split workers, tune intervals, add queue-based scheduling |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Vendor model leakage | Phase 1 | New connector can onboard without UI/alarm code rewrite |
| Alarm storms | Phase 2 | Repeated threshold breach emits controlled transition alerts |
| Polling saturation | Phase 2 | Freshness SLA maintained under expected device load |
| Missing health signals | Phase 3 | Connector failures surface within defined detection window |

## Sources

- Existing project docs: `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`
- Existing integration behavior: `.planning/codebase/INTEGRATIONS.md`
- Operational reliability patterns from NOC/monitoring systems

---
*Pitfalls research for: micro data center DCIM*
*Researched: 2026-03-11*
