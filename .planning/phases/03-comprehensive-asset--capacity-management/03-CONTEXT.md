# Phase 03: Comprehensive Asset & Capacity Management — Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade the existing "Rack Designer" into a professional-grade asset management system. This means introducing a structured IT asset database with rich metadata, adding dual-face (front/rear) rack elevation views that render individual port slots, and enabling port-to-port cable connection tracking with visual tracing — bringing the dashboard to parity with Sunbird dcTrack's core asset management workflow.

</domain>

<decisions>
## Implementation Decisions

### 1. Asset Database (REQ-3.1)
- **Architecture:** In-memory asset store in `server.js` with REST API endpoints (`GET /api/assets`, `POST`, `PUT`, `DELETE`).
- **Asset Model:** `{ id, modelId, name, serialNumber, assetTag, ipAddress, owner, status, notes }`
- **Model Library:** Extended hardcoded models in `server.js` with full port definitions (front and rear ports listed per model).
- **Frontend:** Asset library panel replaced with a searchable/filterable asset catalog populated from the API.
- **Persistence note:** In-memory only for now (reset on server restart). A future phase may introduce SQLite.

### 2. Front & Rear Rack Elevation (REQ-3.2)
- **Toggle:** A `Front / Rear` tab toggle at the top of the rack column. Both views share the same slot array but render different port faces.
- **Rendering:** Extend existing `rackItems` slot pattern. Each placed asset block gains a "click-to-select" interaction exposing a metadata side drawer.
- **Side Drawer:** A fixed-right slide-in panel showing all asset metadata fields — triggered by clicking any placed asset in the elevation.
- **Port Rendering:** Within each placed asset block, render tiny colored port squares (front ports on front view, rear ports on rear view). Ports are labeled by type (ETH, PWR, FC, SFP).

### 3. Port-to-Port Connection Tracking (REQ-3.3)
- **Connection Model:** `{ id, srcAssetId, srcPortLabel, dstAssetId, dstPortLabel, cableType, color, label }`.
- **UI Flow:** User right-clicks or uses a "Connect" button on a port square → selects source port → selects destination port → connection is recorded.
- **Visual Trace:** Within the same rack, draw SVG curved paths between port positions. Cross-rack connections rendered as a collapsible "Connections" list panel.
- **Traversal Panel:** A dedicated "Connections" card below the rack showing all recorded connections, with color-coded cable types and a "Trace" button to highlight the path.

### Claude's Discretion
- Exact port square sizes and color mapping for port types.
- Whether to use a modal or inline confirmation for the "Connect" action.
- SVG path curvature style (cubic bezier recommended).

</decisions>

<code_context>
## Existing Code Insights

### Current RackDesignerView (DCIM.jsx: lines 517–616)
- `rackItems`: `Array(42)` of null or `{ name, u, power, weight, color, icon, type, anchorId }`.
- `assetLibrary`: 5 hardcoded objects — no metadata beyond power/weight/U.
- No ports, no metadata, no rear view, no connection state.
- All state lives in the main `DCIM` component — no child component manages its own state.

### Current Backend (server.js)
- No asset-related routes or state.
- REST endpoints exist for simulate/fire and simulate/leak only.
- Socket.io broadcasts `stateStore` every 1s.

### Reusable Assets
- `Card`, `ValueDisplay`, `StatusBadge` — all reusable for the metadata drawer.
- `Toast` — reusable for asset save/connect confirmations.
- Existing Tailwind classes for color-coding.

### Integration Points
- **Frontend:** `RackDesignerView` refactored from a stateless component to receive `assetDb`, `connections`, `selectedAsset`, and callbacks from parent.
- **Backend:** New REST routes mounted on `app` in `server.js`.
- **Socket.io:** Emit `assets:update` and `connections:update` events alongside `dashboard:update`.

</code_context>

<specifics>
## Specific Ideas

- The "Rear" view should render ports in **reversed order** horizontally (mirroring physical reality of looking at the rear).
- Each port type should have a consistent color: `ETH` = cyan, `PWR` = orange, `FC` = purple, `SFP` = green, `MGMT` = yellow.
- The connection list should show cable color as a small colored swatch next to each row.
- When a connection is "traced," both connected ports should glow with a pulsing ring animation.
- Asset status badges: `Active` = emerald, `Spare` = blue, `Decommissioned` = slate/gray.

</specifics>

<deferred>
## Deferred Ideas

- SQLite or external database for true asset persistence (Phase 3 uses in-memory only).
- Barcode/QR code scanning for asset auditing.
- VMware vSphere integration for virtual asset correlation.
- Multi-rack side-by-side comparison view (Phase 4 candidate).

</deferred>

---

*Phase: 03-comprehensive-asset--capacity-management*
*Context gathered: 2026-06-08*
