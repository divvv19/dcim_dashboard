# TESTING

## Current State
- No automated test framework configured (no Jest/Vitest/Cypress/Playwright found).
- No test directories or files found under `src/` or `server/`.
- No CI configuration found that runs tests.

## Scripts
- Frontend scripts in `package.json` do not include a `test` script.
- Backend scripts in `server/package.json` do not include a `test` script.

## Manual Validation
- Frontend typically validated via `npm run dev` and checking UI in browser.
- Backend typically validated via `npm run dev` in `server/` and watching socket updates.
- README instructions focus on manual dev server runs. See `README.md`.

## Suggested Test Targets (Not Implemented)
- Socket.IO connection flow in `src/hooks/useRealtimeData.js`.
- Data shape compatibility between `server/server.js` and `src/DCIM.jsx`.
- UI regression checks for key dashboard panels in `src/DCIM.jsx`.
- Backend data simulator behavior in `server/server.js`.

## Coverage
- No coverage tooling found (no nyc/istanbul config).
- No reports directory found.
