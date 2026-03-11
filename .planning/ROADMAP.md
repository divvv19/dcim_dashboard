# Roadmap: MDC Protocol-Agnostic DCIM

**Updated:** 2026-03-11  
**Depth:** Standard  
**v1 Coverage:** 16/16 requirements mapped

## Phases

- [ ] **Phase 1: Device Onboarding & Protocol Connectivity** - Register MDC devices and establish Modbus/SNMP data collection.
- [ ] **Phase 2: Unified Telemetry Reliability** - Normalize multi-protocol telemetry and make data trust visible in realtime views.
- [ ] **Phase 3: Alarm Lifecycle Core** - Deliver severity-based alarm creation, deduplication, and acknowledgment workflows.
- [ ] **Phase 4: Alert Delivery & Audit Trail** - Route alarm transitions to external channels with delivery observability.
- [ ] **Phase 5: Operator Incident Workflow** - Provide fast triage workflows across alarms, context, and connector health.

## Phase Details

### Phase 1: Device Onboarding & Protocol Connectivity
**Goal**: Operators can onboard MDC assets and start live protocol data collection for each device type.  
**Depends on**: Nothing (first phase)  
**Requirements**: INVT-01, INTG-01, INTG-02  
**Success Criteria** (what must be TRUE):
1. Operator can register AC, UPS, and sensor devices with site and rack metadata.
2. Registered Modbus devices are polled using configured intervals/timeouts and produce telemetry samples.
3. Registered SNMP devices are collected using configured SNMP profiles and produce telemetry samples.
**Plans**: TBD

### Phase 2: Unified Telemetry Reliability
**Goal**: Operators can trust unified realtime telemetry because connector resilience, freshness, and canonical modeling are in place.  
**Depends on**: Phase 1  
**Requirements**: INVT-02, INTG-03, TELE-01, TELE-02, TELE-03  
**Success Criteria** (what must be TRUE):
1. Dashboard shows realtime cooling, UPS, and environmental metrics from mixed protocols in one unified view.
2. Raw Modbus/SNMP values are transformed into a canonical telemetry schema used by downstream views.
3. Inventory view shows device online/offline and last-seen status from connector heartbeat activity.
4. Failed polls retry with backoff and expose connector health state for troubleshooting.
5. Telemetry that exceeds freshness thresholds is visibly marked stale.
**Plans**: TBD

### Phase 3: Alarm Lifecycle Core
**Goal**: Operators can detect and manage incidents through a reliable, low-noise alarm lifecycle.  
**Depends on**: Phase 2  
**Requirements**: ALRM-01, ALRM-02, ALRM-03  
**Success Criteria** (what must be TRUE):
1. Rule-based thresholds create alarms with critical/major/minor severity classification.
2. Repeated threshold breaches are deduplicated to prevent duplicate active alarms for the same condition.
3. Operator can acknowledge active alarms and see clear lifecycle states over time.
**Plans**: TBD

### Phase 4: Alert Delivery & Audit Trail
**Goal**: Operators receive alarm changes outside the dashboard and can verify delivery behavior.  
**Depends on**: Phase 3  
**Requirements**: ALRT-01, ALRT-02  
**Success Criteria** (what must be TRUE):
1. Alarm state transitions trigger notifications through configured email and/or webhook channels.
2. Every notification attempt is recorded with outcome and failure detail for audit/debug.
3. Operator can inspect recent notification delivery history to diagnose missed alerts.
**Plans**: TBD

### Phase 5: Operator Incident Workflow
**Goal**: Operators can triage incidents end-to-end from one operations console.  
**Depends on**: Phase 2, Phase 3, Phase 4  
**Requirements**: OPER-01, OPER-02, OPER-03  
**Success Criteria** (what must be TRUE):
1. Operator can filter current alarms by site, severity, and device type.
2. Operator can open alarm context with device metadata, latest telemetry, and event timeline.
3. Operator can view connector health summary for quick troubleshooting.
**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Device Onboarding & Protocol Connectivity | 0/1 | Not started | - |
| 2. Unified Telemetry Reliability | 0/1 | Not started | - |
| 3. Alarm Lifecycle Core | 0/1 | Not started | - |
| 4. Alert Delivery & Audit Trail | 0/1 | Not started | - |
| 5. Operator Incident Workflow | 0/1 | Not started | - |
