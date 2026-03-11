# CONVENTIONS

## Language & Module Style
- Frontend uses JavaScript ESM with JSX. Example: `src/main.jsx`.
- Backend uses CommonJS (`require`) in `server/server.js`.
- Semicolons are used consistently in source files (e.g., `src/DCIM.jsx`).

## React Patterns
- Functional components with hooks (`useState`, `useEffect`, `useRef`). See `src/DCIM.jsx`.
- Custom hooks live under `src/hooks/` (example: `src/hooks/useRealtimeData.js`).
- Component naming uses PascalCase (e.g., `Card`, `StatusBadge`).
- Props are usually destructured in function signatures (e.g., `const Card = ({ title, children }) => ...`).

## Styling
- Tailwind utility classes are used inline in JSX. See `src/DCIM.jsx`.
- Base CSS in `src/index.css` and component CSS in `src/App.css`.
- UI uses a dark theme with gradients and glassmorphism utilities (from Tailwind classes).

## Linting Rules
- ESLint flat config with React hooks and React refresh rules. See `eslint.config.js`.
- `no-unused-vars` ignores variables starting with capital letters (useful for React components). See `eslint.config.js`.

## File & Folder Conventions
- Top-level React components are in `src/` rather than nested folders.
- Single large UI file for the dashboard in `src/DCIM.jsx`.
- Backend entry lives in `server/server.js` with no subfolders yet.

## Data Handling
- Realtime data updates via Socket.IO; data stored in local component state. See `src/hooks/useRealtimeData.js`.
- No global state library found (no Redux/Zustand/etc).
