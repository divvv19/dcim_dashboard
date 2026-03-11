# CONCERNS

## Maintainability
- `src/DCIM.jsx` is very large and contains many components and layouts in a single file, which makes it hard to navigate and test.
- UI logic, presentation, and data shaping are mixed in the same file (`src/DCIM.jsx`).
- Component reuse across pages is limited by single-file organization.

## Configuration / Environment
- Socket URL is hardcoded to `http://localhost:5000` in `src/hooks/useRealtimeData.js`, which makes non-local deployment harder.
- Backend CORS is wide open (`origin: "*"`) in `server/server.js` (dev-friendly but risky for production).
- `dotenv` is loaded, but no example `.env` is present to document required variables.

## Runtime / Performance
- Backend uses a 1s `setInterval` that always emits updates, even if no data has changed. See `server/server.js`.
- Backend state is in-memory only; no persistence or history beyond `envData.history` (loss on restart).
- No backpressure or rate limit for Socket.IO broadcasts.

## Robustness
- Frontend does not handle socket connection errors beyond a simple `isConnected` flag. See `src/hooks/useRealtimeData.js`.
- Data shape assumptions are tightly coupled between `server/server.js` and `src/DCIM.jsx`.

## Dependency Hygiene
- `modbus-serial` and `net-snmp` are listed in `server/package.json` but not used in `server/server.js`.
- `node_modules/` directories are present in the repo; this can bloat the repository and slow tooling.
- `dist/` exists at repo root; if committed, it can cause drift from source.

## Testing
- No automated tests are configured (see `.planning/codebase/TESTING.md`).
