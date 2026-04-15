# Phase 1: Device Onboarding & Protocol Connectivity - Research

**Researched:** 2026-03-11
**Domain:** Node.js protocol connector architecture for Modbus TCP + SNMP onboarding in a realtime DCIM dashboard
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Onboarding Flow and Data Capture
- Use a guided single-device onboarding flow as the primary v1 path.
- Required registration metadata: site, rack, device type, and protocol.
- Protocol profile assignment happens during registration, not as a later step.
- Connection test runs before final save.
- If a duplicate endpoint is entered, block creation and show a merge hint.
- Unknown device models can be registered as `Pending` (no live polling until mapped).
- Operator-visible onboarding status lifecycle: `Pending`, `Tested`, `Active`, `Failed`.
- After a device is active, edits require re-validation for all fields.

### Protocol Profile Policy
- Use a curated template catalog for Modbus/SNMP profiles.
- Allow limited per-device overrides while keeping template identity.
- Profile changes are versioned; migration to new profile version is opt-in.
- If required register/OID mapping is missing, mark affected metric unsupported instead of guessing.

### Polling and Connectivity Policy
- Polling defaults are tiered by device type (not one global interval).
- Failure handling uses bounded exponential retry/backoff.
- Device offline state is based on consecutive failure threshold.
- Show freshness at device level (fresh/stale badges in onboarding/inventory flows).

### Claude's Discretion
- Exact numeric defaults are open to planning/research:
- Consecutive-failure threshold (`N`) for offline transition.
- Default interval and timeout values by device class.
- Retry curve parameters for bounded exponential backoff.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within Phase 1 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INVT-01 | Operator can register AC, UPS, and sensor devices with site and rack metadata. | Onboarding workflow, duplicate endpoint key strategy, status lifecycle, profile assignment model, and validation rules. |
| INTG-01 | Platform can poll supported devices over Modbus using configurable intervals and timeouts. | `modbus-serial` connection + timeout APIs, tiered poll scheduler, per-device retry state machine, and connection test before activation. |
| INTG-02 | Platform can collect supported device telemetry over SNMP using configurable profiles. | `net-snmp` session/profile options (version, timeout, retries, backoff), OID profile templates, varbind error handling, and freshness tracking. |
</phase_requirements>

## Summary

Phase 1 should be planned around a strict onboarding pipeline plus protocol adapter architecture, not around UI forms alone. The backend already has the right eventing spine (`stateStore` + `io.emit('dashboard:update', ...)`) and the frontend already consumes realtime snapshots (`useRealtimeData`). The fastest low-risk plan is to extend this existing path with a device registry, protocol profile catalog, connector runtime, and onboarding status projection.

For protocols, the repo already includes both required libraries: `modbus-serial` and `net-snmp`. The core implementation work is orchestration: device identity + duplicate protection, profile versioning/override policy, connection testing before save, and resilient polling with bounded backoff and freshness metadata. Existing Socket.IO transport should remain the single push channel for onboarding and connector status.

**Primary recommendation:** Plan Phase 1 as five vertical slices: registry model, profile catalog, protocol adapters, poll/retry scheduler, and operator onboarding/status UI bound to Socket.IO snapshots.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `modbus-serial` | 8.0.23 | Modbus TCP/RTU client operations (`connectTCP`, `setID`, `setTimeout`, register reads) | Already installed; exposes exactly the Modbus transport and register APIs needed for INTG-01. |
| `net-snmp` | 3.26.1 | SNMP v1/v2c/v3 session-based collection with timeout/retries/backoff and walk/getBulk support | Already installed; mature API for configurable profile-driven polling for INTG-02. |
| `socket.io` / `socket.io-client` | 4.8.3 | Realtime state push (`dashboard:update`) from backend to frontend | Already in active code path; avoids introducing a second realtime transport. |
| `express` | 4.22.1 | Onboarding/profile CRUD and connection-test endpoints | Existing backend framework; minimal incremental complexity. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | 16.6.1 | Environment configuration for protocol/network defaults | Use for default timeout/retry constants and environment-specific connector settings. |
| Node timers/events | Node v24.11.1 runtime | Poll loops, backoff timers, lifecycle transitions | Use for per-device scheduler and bounded retry cadence. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Socket.IO push | SSE | SSE is simpler one-way, but current app already uses Socket.IO and bidirectional events; switching adds churn with no phase benefit. |
| In-memory registry only | SQLite/Postgres | Persistence is safer for operator workflows but adds schema/migration scope; choose explicitly in plan (open question). |
| Ad-hoc per-protocol code paths | Protocol adapter interface | Adapter interface is slightly more upfront design, but prevents Phase 2 rework when telemetry normalization arrives. |

**Installation:**
```bash
cd server
npm install express cors dotenv modbus-serial net-snmp socket.io
cd ..
npm install socket.io-client
```

## Architecture Patterns

### Recommended Project Structure
```text
server/
  server.js                      # Bootstrap, express routes, socket wiring
  src/
    onboarding/
      deviceRegistry.js          # CRUD + duplicate detection + status lifecycle
      onboardingService.js       # test-before-save orchestration
      validators.js              # payload/profile validation
    profiles/
      profileCatalog.js          # template catalog + versioning + override constraints
    protocols/
      protocolAdapter.js         # common adapter contract
      modbusAdapter.js           # modbus-serial integration
      snmpAdapter.js             # net-snmp integration
    polling/
      pollScheduler.js           # tiered intervals + bounded exponential backoff
      connectorState.js          # failure counters, freshness, online/offline
    realtime/
      snapshotProjector.js       # merge onboarding + connector state into socket payload
```

### Pattern 1: Onboarding Pipeline With Mandatory Connection Test
**What:** Request validation -> duplicate endpoint check -> protocol/profile validation -> active test -> persist device -> emit status snapshot.
**When to use:** Device create and device edit flows.
**Example:**
```js
// Source: server/server.js (existing snapshot emit path)
async function onboardDevice(input) {
  const device = validateAndNormalize(input);
  assertNoDuplicateEndpoint(device);
  const testResult = await protocolAdapters[device.protocol].testConnection(device);
  if (!testResult.ok) return { status: "Failed", reason: testResult.reason };
  saveDevice({ ...device, status: "Active" });
  io.emit("dashboard:update", buildSnapshot());
  return { status: "Active" };
}
```

### Pattern 2: Protocol Adapter Boundary
**What:** Common interface for `testConnection()` and `collectSample()` with protocol-specific internals.
**When to use:** Any connector lifecycle action (test, poll, reconnect).
**Example:**
```js
// Source: modbus-serial API + net-snmp API docs
const protocolAdapters = {
  modbus: {
    testConnection: async (d) => { /* connectTCP + setID + readHoldingRegisters */ },
    collectSample: async (d) => { /* read mapped registers */ }
  },
  snmp: {
    testConnection: async (d) => { /* createSession/get + close */ },
    collectSample: async (d) => { /* get/getBulk/walk mapped OIDs */ }
  }
};
```

### Pattern 3: Poll Scheduler With Bounded Exponential Backoff
**What:** Per-device poll loop computes next run from success/failure counters and caps retry delay.
**When to use:** Continuous collection for Active devices.
**Example:**
```js
function nextDelayMs(baseIntervalMs, failCount) {
  const multiplier = Math.min(2 ** failCount, 8);   // bounded
  const jitter = 0.9 + Math.random() * 0.2;         // +/-10%
  return Math.round(baseIntervalMs * multiplier * jitter);
}
```

### Pattern 4: Realtime Read Model Projection
**What:** Maintain connector internals separately; emit an operator read model containing lifecycle, online/offline, freshness, and last error.
**When to use:** Any connector status transition or successful sample ingestion.

### Anti-Patterns to Avoid
- **Global `setInterval` for all devices:** Creates overlap/drift and makes per-device backoff impossible.
- **Saving device before protocol test:** Violates locked decision and creates zombie inventory rows.
- **Default SNMP version behavior:** `createSession()` defaults to SNMPv1 unless explicitly configured.
- **Skipping `session.close()`:** Leaks sockets and degrades long-running collectors.
- **Guessing missing metric mappings:** Must mark unsupported explicitly per locked policy.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modbus framing/transport | Custom TCP frame parser | `modbus-serial` client APIs | Protocol edge-cases and transaction handling are already solved. |
| SNMP BER/session protocol | Custom SNMP packet codec | `net-snmp` session APIs | SNMPv1/v2c/v3 behaviors and error handling are complex and implemented already. |
| Realtime push channel | Custom websocket wrapper | Existing Socket.IO path (`dashboard:update`) | Existing frontend/backend already wired; phase should extend, not replace. |
| Generic retry primitives | Per-protocol bespoke retry math | Shared bounded-backoff helper + `net-snmp` session options | Prevents inconsistent recovery behavior across protocol types. |

**Key insight:** The hard part in Phase 1 is connector orchestration and lifecycle correctness, not protocol byte-level implementation.

## Common Pitfalls

### Pitfall 1: Duplicate Endpoint Detection That Misses Real Collisions
**What goes wrong:** Two records target the same physical endpoint because duplicate key ignores unit ID/community/version.
**Why it happens:** Endpoint uniqueness often modeled as host:port only.
**How to avoid:** Build canonical key by protocol:
- Modbus: `protocol + host + port + unitId`
- SNMP: `protocol + host + port + version + (community|securityName|context)`
**Warning signs:** Devices flicker status or telemetry appears to "swap" between rows.

### Pitfall 2: Poll Storm From Interval Overlap
**What goes wrong:** Slow responses cause overlapping polls, amplifying failures.
**Why it happens:** Fixed `setInterval` without in-flight guard.
**How to avoid:** Use one-shot scheduling per device (`setTimeout` after completion) and track in-flight state.
**Warning signs:** Rising open sockets/timeouts and delayed dashboard updates.

### Pitfall 3: Incorrect SNMP Success Semantics
**What goes wrong:** Request callback has no error, but varbind includes `NoSuchObject`/`NoSuchInstance`; pipeline still treats sample as valid.
**Why it happens:** SNMPv2c/v3 places some errors in varbind-level fields.
**How to avoid:** Always run `snmp.isVarbindError()` checks before accepting values.
**Warning signs:** Null/invalid metrics accepted as healthy samples.

### Pitfall 4: SNMPv3 DES on Modern Node
**What goes wrong:** `ERR_OSSL_EVP_UNSUPPORTED` on Node v17+ when using DES privacy.
**Why it happens:** OpenSSL deprecates DES by default.
**How to avoid:** Prefer AES profiles; only allow DES with explicit compatibility mode warning.
**Warning signs:** Immediate handshake failures for v3 devices using DES.

### Pitfall 5: Status Lifecycle Drift
**What goes wrong:** Device shown `Active` while connector repeatedly fails.
**Why it happens:** Onboarding lifecycle and runtime health modeled in separate uncoordinated flags.
**How to avoid:** Single lifecycle reducer controlling transitions (`Pending` -> `Tested` -> `Active`/`Failed`) with re-validation on edits.
**Warning signs:** UI state contradicts connector logs.

## Code Examples

Verified patterns from installed library docs and current codebase.

### Modbus TCP Connection + Read
```js
// Source: server/node_modules/modbus-serial/README.md, ModbusRTU.d.ts
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();

await client.connectTCP(device.host, { port: device.port });
client.setID(device.unitId);
client.setTimeout(device.timeoutMs);

const result = await client.readHoldingRegisters(profile.startAddress, profile.length);
// result.data -> register values
```

### SNMP Session With Configurable Timeout/Retry/Backoff
```js
// Source: server/node_modules/net-snmp/README.md
const snmp = require("net-snmp");

const session = snmp.createSession(device.host, profile.community, {
  port: device.port ?? 161,
  version: snmp.Version2c,
  timeout: profile.timeoutMs,
  retries: profile.retries,
  backoff: profile.backoff
});

session.get(profile.oids, (error, varbinds) => {
  if (error) return fail(error);
  for (const vb of varbinds) {
    if (snmp.isVarbindError(vb)) return fail(snmp.varbindError(vb));
  }
  succeed(varbinds);
  session.close();
});
```

### Socket Snapshot Emit (Existing Integration Spine)
```js
// Source: server/server.js + src/hooks/useRealtimeData.js
io.emit("dashboard:update", stateStore);
// frontend already listens in useRealtimeData() and updates UI state
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SNMPv3 auth limited to MD5/SHA-1 in many legacy stacks | SHA-2 auth options (`sha224/256/384/512`) are available in `net-snmp` | Documented in library support and RFC 7860 note | Prefer stronger auth profiles for new devices. |
| DES commonly accepted for SNMPv3 privacy | DES problematic on modern Node/OpenSSL; AES recommended | Node v17+ crypto behavior reflected in `net-snmp` docs | Phase plan should default profile templates to AES, not DES. |
| Implicit one-size poll interval | Device-tier polling policy with per-device backoff/freshness | Locked phase decisions | Needed for reliable mixed equipment collection. |

**Deprecated/outdated:**
- SNMPv1 as implicit default for new profiles: avoid unless device compatibility requires it.
- DES as default SNMPv3 privacy: avoid; use AES template defaults.

## Numeric Default Recommendations (Claude's Discretion)

These are planning defaults for Phase 1 implementation and can be tuned later.

| Device class | Base poll interval | Request timeout | Retries | Backoff cap |
|--------------|--------------------|-----------------|---------|-------------|
| UPS | 5s | 1500ms | 2 | 40s |
| Cooling/AC | 10s | 1500ms | 2 | 60s |
| Environmental sensors | 15s | 1200ms | 2 | 60s |

- **Offline transition threshold (`N`)**: `3` consecutive failed cycles.
- **Freshness threshold**: `2 x base poll interval` for each device class.
- **Backoff curve**: `delay = baseInterval * min(2^failCount, 8)` with +/-10% jitter.

Confidence: **MEDIUM** (operational heuristics aligned to locked decisions; tune with real device latency during execution).

## Open Questions

1. **Persistence boundary for device inventory in Phase 1**
   - What we know: Current backend is in-memory (`stateStore`).
   - What's unclear: Must registrations survive process restart in Phase 1?
   - Recommendation: Decide before planning waves; if yes, add a small persistence layer task in Wave 1.

2. **SNMP profile scope for v1**
   - What we know: Requirement asks configurable SNMP profiles, not full MIB management.
   - What's unclear: Minimum profile fields expected for operator UX (version/community/security/context/OID groups).
   - Recommendation: Lock a minimal profile schema during planning and defer advanced MIB import tooling.

3. **Unknown model mapping ownership**
   - What we know: Unknown models can be `Pending` with no live polling.
   - What's unclear: Who defines and approves eventual mapping to active profile templates?
   - Recommendation: Add explicit "mapping required" queue/state and admin action in backlog if not in Phase 1.

4. **Connection test semantics for partial success**
   - What we know: Connection test is mandatory pre-save.
   - What's unclear: Is transport reachability enough, or must at least one required metric be readable?
   - Recommendation: For Phase 1, require at least one required mapping read success to mark `Tested`/`Active`.

## Sources

### Primary (HIGH confidence)
- `server/node_modules/modbus-serial/README.md` - connection patterns (`connectTCP`, `setID`, `setTimeout`, register reads), multi-slave polling examples.
- `server/node_modules/modbus-serial/ModbusRTU.d.ts` - API contract for connection shorthands and read/write methods.
- `server/node_modules/net-snmp/README.md` - `createSession()`/`createV3Session()` options, retries/timeout/backoff, varbind error handling, security protocol options, DES compatibility note, and recent changelog.
- `server/server.js` - current realtime state model and `dashboard:update` emission path.
- `src/hooks/useRealtimeData.js` - frontend realtime subscription pattern.
- `.planning/phases/01-device-onboarding-protocol-connectivity/01-CONTEXT.md` - locked decisions and discretionary numeric defaults scope.
- `.planning/REQUIREMENTS.md` - INVT-01, INTG-01, INTG-02 requirement text.

### Secondary (MEDIUM confidence)
- https://github.com/yaacov/node-modbus-serial - upstream package repository/documentation index.
- https://github.com/markabrahams/node-net-snmp - upstream package repository/documentation index.
- https://socket.io/docs/v4/server-api/ - Socket.IO server API reference.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - based on installed package versions and direct library docs.
- Architecture: **HIGH** - aligned with existing code paths and locked phase decisions.
- Pitfalls: **HIGH** - directly supported by library docs + current runtime context.
- Numeric defaults: **MEDIUM** - practical recommendations requiring field tuning.

**Research date:** 2026-03-11
**Valid until:** 2026-04-10 (30 days; re-check package docs if versions change)
