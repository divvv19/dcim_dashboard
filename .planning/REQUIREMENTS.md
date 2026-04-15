# Requirements: MDC Protocol-Agnostic DCIM

**Defined:** 2026-03-11
**Core Value:** Operators get one dependable pane of glass for real-time MDC health and alarms across heterogeneous equipment.

## v1 Requirements

### Inventory

- [x] **INVT-01**: Operator can register AC, UPS, and sensor devices with site and rack metadata.
- [ ] **INVT-02**: Operator can view device online/offline and last-seen status in one inventory view.

### Integration

- [x] **INTG-01**: Platform can poll supported devices over Modbus RTU using configurable intervals, timeouts, and per-device register profiles.
- [x] **INTG-02**: Platform can manage shared RS485 bus configuration and collect telemetry for multiple slave devices on the same bus.
- [ ] **INTG-03**: Platform can retry failed polls with backoff and surface connector health state.

### Telemetry

- [ ] **TELE-01**: Platform normalizes raw protocol values into a canonical telemetry schema.
- [ ] **TELE-02**: Operator can view realtime cooling, UPS, and environmental metrics in a unified dashboard.
- [ ] **TELE-03**: Platform marks stale data when freshness threshold is exceeded.

### Alarms

- [ ] **ALRM-01**: Platform evaluates rule-based thresholds and creates alarms with severity (critical/major/minor).
- [ ] **ALRM-02**: Operator can acknowledge active alarms and see clear alarm lifecycle state.
- [ ] **ALRM-03**: Platform deduplicates repeated threshold breaches to reduce alert noise.

### Alerting

- [ ] **ALRT-01**: Platform sends notifications for alarm state transitions via email and/or webhook.
- [ ] **ALRT-02**: Platform records notification delivery attempts and failures for audit/debug.

### Operations

- [ ] **OPER-01**: Operator can filter current alarms by site, severity, and device type.
- [ ] **OPER-02**: Operator can open alarm context showing device metadata, latest telemetry, and event timeline.
- [ ] **OPER-03**: Operator can view connector health summary for quick troubleshooting.

## v2 Requirements

### Control

- **CTRL-01**: Operator can execute approved remote control actions with RBAC and audit policy.
- **CTRL-02**: Operator can schedule controlled maintenance actions across selected devices.

### Analytics

- **ANLY-01**: Platform provides predictive anomaly detection for key MDC metrics.
- **ANLY-02**: Platform provides efficiency optimization recommendations.

### Multi-Tenant

- **MTEN-01**: Platform supports tenant/site-group isolation for managed service scenarios.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Predictive AI in v1 | Must first stabilize protocol integration and alarm reliability |
| Broad remote command/control in v1 | Safety and governance risk without mature RBAC/audit |
| Vendor-specific custom data models | Breaks protocol-agnostic scale objective |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INVT-01 | Phase 1 | Completed |
| INVT-02 | Phase 2 | Pending |
| INTG-01 | Phase 1 | Completed |
| INTG-02 | Phase 1 | Completed |
| INTG-03 | Phase 2 | Pending |
| TELE-01 | Phase 2 | Pending |
| TELE-02 | Phase 2 | Pending |
| TELE-03 | Phase 2 | Pending |
| ALRM-01 | Phase 3 | Pending |
| ALRM-02 | Phase 3 | Pending |
| ALRM-03 | Phase 3 | Pending |
| ALRT-01 | Phase 4 | Pending |
| ALRT-02 | Phase 4 | Pending |
| OPER-01 | Phase 5 | Pending |
| OPER-02 | Phase 5 | Pending |
| OPER-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-04-15 after Phase 1 execution*
