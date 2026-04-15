# Phase 1: Device Onboarding & RTU Connectivity - Research

**Researched:** 2026-04-15
**Domain:** Node.js Modbus RTU over RS485 onboarding and simulation-first connector execution in a realtime DCIM dashboard
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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
- Exact numeric defaults are open to planning/research.
- Consecutive-failure threshold (`N`) for offline transition.
- Default interval and timeout values by device class.
- Default RS485 serial settings for initial bus templates.
- Retry curve parameters for bounded exponential backoff.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INVT-01 | Operator can register AC, UPS, and sensor devices with site and rack metadata. | Onboarding workflow, duplicate bus/slave detection, status lifecycle, profile assignment model, and validation rules. |
| INTG-01 | Platform can poll supported devices over Modbus RTU using configurable intervals, timeouts, and per-device register profiles. | `modbus-serial` RTU connection APIs, slave selection, tiered poll scheduler, simulation transport, and connection test before activation. |
| INTG-02 | Platform can manage shared RS485 bus configuration and collect telemetry for multiple slave devices on the same bus. | Bus-level serial settings, serialized queueing per bus, slave addressing, and per-bus runtime health/freshness tracking. |
</phase_requirements>

## Summary

Phase 1 should be planned around a strict onboarding pipeline plus a bus-first Modbus RTU runtime. The backend already has the right eventing spine (`stateStore` + `io.emit('dashboard:update', ...)`) and the frontend already consumes realtime snapshots (`useRealtimeData`). The lowest-risk path is to extend this existing path with a bus registry, RTU profile catalog, serialized RS485 polling runtime, and onboarding status projection.

Because hardware is not available yet, execution should be simulation-first. The transport boundary should support both `simulation` and `hardware` modes behind the same adapter contract so we can verify onboarding, polling, offline/freshness, and UI behavior now without rewriting core logic later.

**Primary recommendation:** Plan Phase 1 as five vertical slices: bus and device registry, RTU profile catalog, simulation-backed RTU transport, serialized poll/retry scheduler, and operator onboarding/status UI bound to Socket.IO snapshots.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `modbus-serial` | 8.0.23 | Modbus RTU client operations (`connectRTUBuffered`, `setID`, `setTimeout`, register reads) | Already installed and directly supports the RTU transport we need. |
| `socket.io` / `socket.io-client` | 4.8.3 | Realtime state push (`dashboard:update`) from backend to frontend | Already in the active code path; avoids introducing a second transport. |
| `express` | 4.22.1 | Onboarding, bus, profile, and connection-test endpoints | Existing backend framework; minimal incremental complexity. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | 16.6.1 | Environment configuration for runtime defaults | Use for simulation mode, default serial settings, and polling constants. |
| Node timers/events | Node runtime | Poll loops, backoff timers, lifecycle transitions | Use for per-bus scheduling and bounded retry cadence. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Socket.IO push | SSE | SSE is simpler one-way, but current app already uses Socket.IO and changing transports adds churn. |
| In-memory registry only | SQLite/Postgres | Persistence is safer long-term but adds schema/migration scope; decide explicitly during execution. |
| Direct serial calls from routes/scheduler | RTU transport adapter boundary | Adapter abstraction adds a small layer but keeps simulation and hardware paths aligned. |

**Installation:**
```bash
cd server
npm install express cors dotenv modbus-serial socket.io
cd ..
npm install socket.io-client
```

## Architecture Patterns

### Recommended Project Structure
```text
server/
  server.js
  src/
    onboarding/
      onboardingService.js
      validators.js
    buses/
      busRegistry.js
    profiles/
      profileCatalog.js
    protocols/
      protocolAdapter.js
      modbusRtuAdapter.js
      simulatedRtuAdapter.js
    polling/
      pollScheduler.js
      connectorState.js
    realtime/
      snapshotProjector.js
```

### Pattern 1: Onboarding Pipeline With Mandatory Connection Test
**What:** Request validation -> duplicate bus/slave check -> bus/profile validation -> active test -> persist device -> emit status snapshot.
**When to use:** Device create and device edit flows.

### Pattern 2: Transport Adapter Boundary
**What:** Common interface for `testConnection()` and `collectSample()` with interchangeable simulation and hardware internals.
**When to use:** Any connector lifecycle action (test, poll, reconnect).

### Pattern 3: Per-Bus Serialized Poll Scheduler With Bounded Exponential Backoff
**What:** Each RS485 bus owns a queue; devices on that bus are polled one at a time, and next run is computed from success/failure counters.
**When to use:** Continuous collection for Active devices that share a serial line.

### Pattern 4: Realtime Read Model Projection
**What:** Maintain bus runtime internals separately; emit an operator read model containing lifecycle, online/offline, freshness, bus health, and last error.
**When to use:** Any connector status transition or successful sample ingestion.

### Anti-Patterns to Avoid
- Global `setInterval` for all devices
- Saving device before protocol test
- Parallel polling on one RS485 bus
- Guessing missing register mappings
- Building simulation as a separate business-logic path

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modbus RTU framing/transport | Custom serial frame parser | `modbus-serial` RTU APIs | RTU timing, CRC, and transport details are already solved. |
| Hardware-first execution without fixtures | Ad-hoc manual stubs in routes | A dedicated simulation transport implementing the same adapter contract | Keeps testability and hardware cutover clean. |
| Realtime push channel | Custom websocket wrapper | Existing Socket.IO path (`dashboard:update`) | Existing frontend/backend already wired. |
| Generic retry primitives | One-off retry code in each caller | Shared bounded-backoff helper in poll scheduler | Keeps bus/device recovery behavior consistent. |

## Common Pitfalls

### Pitfall 1: Duplicate Endpoint Detection That Misses Real Collisions
**What goes wrong:** Two records target the same physical endpoint because duplicate key ignores bus identity or slave ID.
**How to avoid:** Canonical endpoint key should be `busId + slaveId`.

### Pitfall 2: Poll Storm From Bus Overlap
**What goes wrong:** Slow responses cause overlapping polls on the same RS485 bus.
**How to avoid:** Use one-shot scheduling per bus and track in-flight state.

### Pitfall 3: Simulation Path Diverges From Hardware Path
**What goes wrong:** Simulation passes but real hardware mode requires different code paths.
**How to avoid:** Keep simulation and hardware behind the same `testConnection()` / `collectSample()` contract.

### Pitfall 4: Status Lifecycle Drift
**What goes wrong:** Device is shown `Active` while runtime health is repeatedly failing.
**How to avoid:** Use one lifecycle reducer controlling `Pending -> Tested -> Active/Failed`, with runtime health projected separately.

## Code Examples

### Modbus RTU Buffered Connection + Read
```js
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

await client.connectRTUBuffered(bus.path, {
  baudRate: bus.baudRate,
  parity: bus.parity,
  dataBits: bus.dataBits,
  stopBits: bus.stopBits
});

client.setID(device.unitId);
client.setTimeout(device.timeoutMs);

const result = await client.readHoldingRegisters(profile.startAddress, profile.length);
```

### Simulation Transport With Identical Adapter Contract
```js
function createSimulatedRtuAdapter(fixtures) {
  return {
    async testConnection(device, profile) {
      return fixtures.lookup(device.deviceId).testConnection(profile);
    },
    async collectSample(device, profile) {
      return fixtures.lookup(device.deviceId).collectSample(profile);
    }
  };
}
```

## Numeric Default Recommendations

| Device class | Base poll interval | Request timeout | Retries | Backoff cap |
|--------------|--------------------|-----------------|---------|-------------|
| UPS | 5s | 1500ms | 2 | 40s |
| Cooling/AC | 10s | 1500ms | 2 | 60s |
| Environmental sensors | 15s | 1200ms | 2 | 60s |

- **Offline transition threshold (`N`)**: `3` consecutive failed cycles.
- **Freshness threshold**: `2 x base poll interval`.
- **Backoff curve**: `delay = baseInterval * min(2^failCount, 8)` with +/-10% jitter.
- **Default RS485 bus template**: `9600 baud`, `8 data bits`, `no parity`, `1 stop bit`, `1500ms timeout`.

## Open Questions

1. Should bus and device registrations survive process restart in Phase 1, or is in-memory acceptable for simulation-first execution?
2. What default serial settings match the first real device group we expect to onboard?
3. Who will own unknown-model register mapping approval once hardware arrives?

## Sources

### Primary (HIGH confidence)
- `server/node_modules/modbus-serial/README.md`
- `server/node_modules/modbus-serial/ModbusRTU.d.ts`
- `server/server.js`
- `src/hooks/useRealtimeData.js`
- `.planning/phases/01-device-onboarding-protocol-connectivity/01-CONTEXT.md`
- `.planning/REQUIREMENTS.md`

### Secondary (MEDIUM confidence)
- https://github.com/yaacov/node-modbus-serial
- Socket.IO server/client docs already reflected in current codebase usage

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH**
- Architecture: **HIGH**
- Pitfalls: **HIGH**
- Numeric defaults: **MEDIUM**

**Research date:** 2026-04-15
**Valid until:** 2026-05-15
