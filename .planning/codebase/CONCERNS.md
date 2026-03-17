# Areas of Concern

- **File Size & Component Fragmentation**: `src/DCIM.jsx` is almost 900 lines long. UI components (Card, ValueDisplay, Gauge) and View layouts (HomeView, CoolingView) are all in the same file. They should be extracted into a `components/` and `views/` directory.
- **Mock Data**: Backend is currently heavily relying on mock data simulation. Transitioning to real Modbus/SNMP might require significant restructuring of the polling logic.
- **Frontend State Handling**: Simulation actions on frontend (e.g., `toggleFire`) only trigger transient toast notifications and state flickering, as true state is overwritten by the 1s backend polling.
- **Error Handling**: Missing robust error handling/reconnection logic for Socket.IO on the frontend and hardware polling on the backend.
