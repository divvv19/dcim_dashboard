# DCIM Dashboard Upgrade

**Vision:** Elevate the basic DCIM dashboard to an industry-leading standard (comparable to Sunbird & nPod) focusing on advanced asset management, capacity planning, energy efficiency tracking, environmental monitoring, and robust security features.

## Requirements

### Validated

- ✓ Basic React 19 Frontend
- ✓ Initial Server/Client Socket.IO infrastructure
- ✓ Simple dashboard UI views (Home, Cooling, UPS, PDU)

### Active

- [ ] Connect backend to real hardware protocols (`modbus-serial` and `net-snmp`)
- [ ] Expand environmental sensor data model (Airflow, Air Pressure, Smoke, Water Leak)
- [ ] Implement robust event alerting system for threshold breaches
- [ ] Store historical time-series data using a database like InfluxDB or PostgreSQL
- [ ] Incorporate granular live Power Usage Effectiveness (PUE) tracking and PDU metrics
- [ ] Introduce a database for IT assets with custom fields (Model, Serial, IP)
- [ ] Create specialized views for detailed rack capacity mapping and network cable tracking
- [ ] Implement a full WebGL 3D views and thermal heatmaps for visualizing hot spots
- [ ] Incorporate physical security capabilities including RTSP CCTV feeds and door access logs
- [ ] Introduce Role-Based Access Control (RBAC) to the dashboard

### Out of Scope

- Integrating external cloud synchronization services (local instance only).
- Non-standard industrial hardware protocols outside Modbus/SNMP.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Adopt time-series DB for history | Transient arrays do not allow for long-term analytics | — Pending |
| Build comprehensive asset tracking | Need deeper insights than current simplistic drag/drop view | — Pending |
| Add physical security controls | Essential for enterprise-grade DCIM administration | — Pending |

---
*Last updated: 2026-03-11 after initialization*
