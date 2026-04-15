# Feature Research

**Domain:** Micro data center DCIM operations
**Researched:** 2026-03-11
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these means the product is not operationally viable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Device inventory and status | Operators need one list of all AC/UPS/sensors with health state | MEDIUM | Include site, rack, protocol, and last-seen |
| Protocol adapters (Modbus + SNMP) | Core MDC equipment depends on these protocols | HIGH | Must support retries, timeouts, and poll intervals |
| Normalized telemetry model | Mixed vendor payloads must be comparable | HIGH | Canonical tags: voltage, temp, humidity, runtime, alarm flags |
| Realtime dashboard updates | NOC workflows require live state, not static reports | MEDIUM | Existing Socket.IO channel can be extended |
| Alarm engine with severity | Fast triage needs critical/major/minor classification | HIGH | Rule thresholds + state transition tracking |
| Alert routing basics | Teams need notifications when alarms trigger | MEDIUM | Email/webhook first, escalation next |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Template-based device onboarding | Faster site rollout with less manual mapping | MEDIUM | Vendor templates per protocol |
| Topology-aware alert context | Faster root cause analysis | MEDIUM | Link alarms to impacted rack/site components |
| Connector health scoring | Prevent silent telemetry loss | MEDIUM | Surface stale data and adapter degradation |
| Runbook-linked alarms | Better incident response consistency | LOW | Attach SOP/runbook URLs by alarm type |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full remote control in v1 | Seems powerful for operations | Safety, vendor variance, and audit risk | Monitoring + alerting first, control in gated later phase |
| Predictive AI before clean data | Promises "smart" monitoring | High false positives with noisy early telemetry | Rule-based thresholds and trend baselines first |
| Per-vendor custom dashboards | Quick adaptation for one customer | Long-term maintenance explosion | Canonical schema with configurable panels |

## Feature Dependencies

```
Protocol adapters
  -> Normalized telemetry model
    -> Realtime dashboard
    -> Alarm rule engine
      -> Alert routing

Device inventory
  -> Connector health scoring
```

### Dependency Notes

- **Normalized telemetry requires protocol adapters:** no canonical model without connector ingestion.
- **Alarm engine requires normalized telemetry:** thresholds must run on stable units and tags.
- **Alert routing depends on alarm state:** notifications trigger from deduplicated alarm transitions.

## MVP Definition

### Launch With (v1)

- [ ] Device inventory and connector lifecycle visibility - essential for trust in monitoring data
- [ ] Modbus + SNMP ingestion adapters for core equipment classes - required integration baseline
- [ ] Canonical telemetry model with realtime dashboard views - core operator workflow
- [ ] Rule-based alarms with severity and acknowledgement state - required incident workflow
- [ ] Basic alert routing (email/webhook) - required response trigger

### Add After Validation (v1.x)

- [ ] Topology impact views - add once baseline alarm quality is stable
- [ ] Runbook automation links - add after teams standardize SOP mappings
- [ ] Multi-site comparative dashboards - add after at least two production sites

### Future Consideration (v2+)

- [ ] Controlled remote commands with strict RBAC and audit
- [ ] Predictive failure analytics and efficiency recommendations

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Protocol adapters (Modbus/SNMP) | HIGH | HIGH | P1 |
| Normalized telemetry model | HIGH | HIGH | P1 |
| Alarm severity engine | HIGH | MEDIUM | P1 |
| Alert routing | HIGH | MEDIUM | P1 |
| Topology context | MEDIUM | MEDIUM | P2 |
| Predictive analytics | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have after baseline stability
- P3: Future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Protocol support | Broad but complex setup | Limited presets | Start with robust Modbus/SNMP presets, expand safely |
| Alarming | Rich but noisy by default | Simpler but less configurable | Focus on low-noise severity model and clear escalation |
| Dashboards | Powerful but heavy UI | Basic summary UI | Operator-first panel layouts with fast fault visibility |

## Sources

- Existing project docs: `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`
- Industry-operational patterns from DCIM/NOC tooling practices

---
*Feature research for: micro data center DCIM*
*Researched: 2026-03-11*
