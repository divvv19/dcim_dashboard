# Phase 03: Comprehensive Asset & Capacity Management — Research

**Gathered:** 2026-06-08
**Status:** Research complete — ready for context gathering

---

## 1. Industry Benchmark: Sunbird dcTrack (REQ-3.1, REQ-3.2, REQ-3.3)

### Rack Elevation Views
- Sunbird provides **automatic 2D/3D front AND rear rack elevation diagrams** — both views are togglable per rack.
- Each slot is true-to-scale in rack units (RU), with drag-and-drop placement.
- Assets in the elevation are **click-drillable** to expose a metadata side panel (serial, IP, owner, warranty, etc.).
- **Overlay metrics** (power, temperature) can be projected onto the rack elevation in real-time.
- Multi-rack side-by-side comparison is a signature Sunbird feature.

### Asset Metadata (Smart Models Library)
- Sunbird maintains 44,000+ device models from 1,280+ manufacturers, each pre-loaded with:
  - Physical dimensions (U height, depth, width)
  - Power draw in watts
  - Port inventory (data and power ports per face)
  - Weight
- Per-instance fields: serial number, asset tag, purchase date, warranty expiry, owner, IP, status.

### Port-to-Port Connection Tracking
- Connections are tracked down to the **physical port level** — not just device-to-device.
- Each cable is recorded with its source port, destination port, cable type, and cable color.
- An **End-to-End Trace** feature follows a connection across multiple hops (patch panel → switch → server).
- Power chain tracked similarly: PDU outlet → power cable → server PSU.

---

## 2. DCIM Asset Database Schema (Standard Pattern)

### Core Tables (industry standard 3NF):

```
Models      { modelId, manufacturer, modelName, deviceType, heightU, maxPowerW, rearPorts, frontPorts }
Assets      { assetId, modelId(FK), name, serialNumber, assetTag, ipAddress, owner, status, rackId(FK), slotU, notes }
Ports       { portId, assetId(FK), label, portType(data|power), face(front|rear), portNumber, connectedToPortId(self-FK) }
Connections { connectionId, srcPortId(FK), dstPortId(FK), cableType, cableColor, label }
```

### Key Design Decisions
- `Ports` uses a **self-referencing FK** (`connectedToPortId`) for bidirectional traversal.
- `Assets.status` = Active | Spare | Decomm.
- `Assets.slotU` = bottom-most U slot occupied (to avoid a separate slot-mapping join).

---

## 3. React UI Implementation Research

### Rack Elevation Rendering
- Use **native React + inline SVG** for slot rendering at 1.75rem/U (same unit as current code).
- Front and rear are two separate arrays rendered in a toggle-controlled viewport.
- Each rendered asset block spans `asset.u * 1.75rem` vertically.

### Drag & Drop
- Current code already uses **HTML5 native drag-and-drop** (`draggable`, `onDragStart`, `onDrop`).
- Extending this pattern to rear view is straightforward — rear view gets its own `rearRackItems` state array.

### Cable Tracing (SVG Overlay)
- Connections drawn as `<path>` or `<line>` elements in an SVG canvas overlaid on the rack.
- For same-rack connections: draw a curved SVG path between the (x, y) positions of the two ports.
- For cross-rack or inter-device connections: render as a connection list panel (not SVG drawn, but list-based traversal).
- Libraries evaluated: **plain SVG paths** (chosen — no extra dependency), react-diagrams (too heavy).

### Asset Metadata Panel
- A slide-in right-side panel (modal or fixed-right drawer) showing asset metadata when a rack item is clicked.
- Uses existing `Card` + `ValueDisplay` component patterns.

---

## 4. Codebase Constraints

### Existing `RackDesignerView` State
```js
// Current (DCIM.jsx:778)
const [rackItems, setRackItems] = useState(Array(42).fill(null)); // flat 42-slot array
const assetLibrary = [ ... ] // 5 hardcoded objects
```
- No metadata beyond `name`, `u`, `power`, `weight`, `color`, `icon`.
- No rear-view array.
- No port definitions.
- No connection state.
- No asset database persistence (all ephemeral in React state).

### What Must Change
- `assetLibrary` → replaced with a **local JSON asset database** (no external DB needed — JSON in server state or imported JSON file).
- `rackItems` → stays, but extended with `assetId` references pointing to asset DB records.
- New `rearRackItems` array for rear-face placement.
- New `connections` array: `[{ id, srcAssetId, srcPort, dstAssetId, dstPort, cableType, color }]`.
- New `selectedAsset` state controlling the metadata side panel.

### Backend Integration
- For Phase 3, the asset database will live in `server.js` as an in-memory store.
- REST API endpoints for CRUD on assets and connections.
- Socket.io broadcasts asset/connection changes to keep multi-tab views synchronized.

---

## 5. Key Technical Decisions for Phase 3

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Asset DB persistence | In-memory JSON in `server.js` (REST API) | No external DB dependency; matches Phase 1/2 pattern |
| Rack elevation render | Native React + TailwindCSS | Consistent with existing slot rendering pattern |
| Front/Rear toggle | `useState('front'/'rear')` per rack | Simple, no new library |
| Port definitions | Defined per model in `assetLibrary` | Front: data ports; Rear: power + additional data |
| Cable drawing | SVG `<path>` overlay within rack column | No extra dependency |
| Asset metadata panel | Fixed right-side slide-in drawer | Sunbird-equivalent "drill-down" pattern |
| Connection tracing | React state graph traversal + list view | Feasible without a graph library |
