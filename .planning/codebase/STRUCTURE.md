# Directory Structure

- `/src`: Frontend React application
  - `DCIM.jsx`: Main dashboard component (contains all layouts and UI components)
  - `/hooks`: Custom React hooks (e.g., `useRealtimeData.js`)
  - `main.jsx`, `App.jsx`, `index.css`: Standard Vite React entry point
- `/server`: Backend Node.js service
  - `server.js`: Entry point, Express server, Socket.IO setup, and mock data simulation
  - `package.json`: Backend dependencies
- `/public`, `/assets`: Static assets
