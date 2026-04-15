# Phase 1: Device Onboarding & RTU Connectivity - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers operator-facing device onboarding and first-pass live connectivity for AC, UPS, and sensors over Modbus RTU on shared RS485 buses. Scope is limited to registering devices, assigning RTU register profiles, configuring buses and slave identities, and establishing successful data collection paths.

</domain>

<decisions>
## Implementation Decisions

### Onboarding Flow and Data Capture
- Use a guided single-device onboarding flow as the primary v1 path.
- Required registration metadata: site, rack, device type, RS485 bus, slave ID, and profile assignment.
- Protocol selection is fixed to Modbus RTU in Phase 1 and should not be presented as an operator choice.
- RTU register profile assignment happens during registration, not as a later step.
- Connection test runs before final save.
- If a duplicate bus/slave endpoint is entered, block creation and show a merge hint.
- Unknown device models can be registered as `Pending` (no live polling until mapped).
- Operator-visible onboarding status lifecycle: `Pending`, `Tested`, `Active`, `Failed`.
- After a device is active, edits require re-validation for all fields.

### RTU Bus and Profile Policy
- Use a curated template catalog for Modbus RTU device profiles.
- RS485 bus configuration is first-class data: serial port, baud rate, parity, data bits, stop bits, and timeout.
- Multiple devices can share one bus, but polling on that bus must be serialized.
- Allow limited per-device overrides while keeping template identity.
- Profile changes are versioned; migration to new profile version is opt-in.
- If required register mapping is missing, mark affected metric unsupported instead of guessing.

### Polling and Connectivity Policy
- Polling defaults are tiered by device type (not one global interval).
- Failure handling uses bounded exponential retry/backoff.
- Device offline state is based on consecutive failure threshold.
- Show freshness at device level (fresh/stale badges in onboarding/inventory flows).
- Bus runtime should prevent overlapping reads on the same RS485 line.

### Simulation Mode
- Phase 1 should execute and verify successfully without physical hardware.
- Transport must support a simulation mode that reuses the same adapter contract as hardware mode.
- Simulation scenarios should cover healthy reads, timeouts, stale data, bus contention, and unsupported metrics.

### Claude's Discretion
- Exact numeric defaults are open to planning/research:
- Consecutive-failure threshold (`N`) for offline transition.
- Default interval and timeout values by device class.
- Default RS485 serial settings for initial bus templates.
- Retry curve parameters for bounded exponential backoff.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server/server.js`: existing backend process already emits realtime `dashboard:update` snapshots.
- `src/hooks/useRealtimeData.js`: existing frontend socket hook can consume onboarding/connectivity status updates.
- `src/DCIM.jsx`: existing dashboard composition can host onboarding and connectivity panels.

### Established Patterns
- Realtime UI updates currently flow through Socket.IO event broadcasts.
- Backend state model uses in-memory `stateStore` with nested subsystem objects.
- Frontend favors hook-driven state and component composition in React.

### Integration Points
- Introduce protocol onboarding/connectivity services behind `server/server.js` event emission path.
- Extend Socket.IO payload shape for onboarding statuses and connector health.
- Attach onboarding/inventory UI sections to the existing `DCIM` dashboard views.

</code_context>

<specifics>
## Specific Ideas

- Prefer operational safety and data trust over onboarding speed.
- Prevent accidental duplicate device endpoints.
- Keep unsupported metrics explicit rather than hidden or guessed.
- Make connectivity freshness visible per device from day one.
- Treat RS485 bus configuration as an operator-visible concept, not hidden transport detail.
- Build with simulation-first transport so we can complete Phase 1 before hardware arrives.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-device-onboarding-protocol-connectivity*
*Context gathered: 2026-03-11*
