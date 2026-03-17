# Requirements

**Project:** DCIM Dashboard Upgrade

The goal is to upgrade the current DCIM to match specific features of premium industry solutions like Sunbird and nPod.

## 1. Real-time Backend Integration (nPod focus)
- **REQ-1.1:** Fetch facility data using Modbus/SNMP (`modbus-serial`, `net-snmp`).
- **REQ-1.2:** Implement an extended `envData` model matching new parameters (Airflow, Air Pressure, Smoke, Water Leak).
- **REQ-1.3:** Create a backend threshold alerting system triggering live frontend toasts.
- **REQ-1.4:** Standardize persistent historical sensor storage via a Time-Series Database (e.g., InfluxDB).

## 2. Power Chain & Efficiency Management (Sunbird focus)
- **REQ-2.1:** Enable granular per-outlet monitoring across Power Distribution Units.
- **REQ-2.2:** Display live-calculated metrics for overall Power Usage Effectiveness (PUE) at the facility level.
- **REQ-2.3:** Surface historical power draw charts and identifying peak usage across PDU and UPS tabs.

## 3. Comprehensive Asset & Capacity Management (Sunbird focus)
- **REQ-3.1:** Migrate IT asset mapping to a database holding metadata (Model, Serial, IP, Owner).
- **REQ-3.2:** Introduce front and rear rack elevation views detailing dimension slots and limits.
- **REQ-3.3:** Enable mapping and traversal of network connections and power cable connections between rack assets.

## 4. Advanced Visualization & Analytics
- **REQ-4.1:** Build a 3D floor plan layout overview module using a WebGL engine like Three.js.
- **REQ-4.2:** Integrate thermal and airflow heatmaps to visually isolate data center hotspots.
- **REQ-4.3:** Enable users to construct customized personalized Dashboards consisting of pinned graphs and alert blocks.

## 5. Security & Access Control (nPod focus)
- **REQ-5.1:** Add backend logic for logging physical door access status events and reporting them.
- **REQ-5.2:** Create a UI View dedicated to streaming integrated CCTV RTSP feeds.
- **REQ-5.3:** Build a Role-Based Access Control (RBAC) system for segregating Admin from View-Only functionality.

## Out of Scope
- Integrating with external third-party helpdesk systems (ServiceNow/Jira) right now.
- Auto-discovery of devices via SNMP broadcast.
