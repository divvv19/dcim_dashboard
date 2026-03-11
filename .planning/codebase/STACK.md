# STACK

## Languages & Runtimes
- Frontend: JavaScript (ESM, JSX). Entry: `src/main.jsx`, `src/App.jsx`.
- Backend: Node.js (CommonJS). Entry: `server/server.js`.

## Frontend Frameworks & Libraries
- React 19 with Vite. See `package.json`.
- Tailwind CSS 4 with PostCSS. See `tailwind.config.js`, `postcss.config.js`.
- Icons: Lucide React. See `package.json`.
- Realtime client: Socket.IO client. See `src/hooks/useRealtimeData.js`.

## Backend Frameworks & Libraries
- Express 4 + Socket.IO server. See `server/server.js` and `server/package.json`.
- CORS and dotenv. See `server/package.json`.
- Optional/unused in code: `modbus-serial`, `net-snmp` (present in `server/package.json`).

## Build & Tooling
- Vite scripts: `dev`, `build`, `preview` in `package.json`.
- ESLint flat config: `eslint.config.js`.
- npm lockfiles: `package-lock.json`, `server/package-lock.json`.

## Runtime Notes
- Frontend dev server: `npm run dev` (root).
- Backend dev server: `npm run dev` (from `server/`, uses `nodemon`).

## Config Files
- Vite: `vite.config.js`.
- Tailwind: `tailwind.config.js`.
- PostCSS: `postcss.config.js`.
- ESLint: `eslint.config.js`.
- App HTML shell: `index.html`.
