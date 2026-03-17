# Coding Conventions

## Frontend
- Components are defined as constants (`const Card = ...`) within the same file (`DCIM.jsx`), reducing file fragmentation but creating a very large main file.
- React Hooks are used for state management and side effects.
- Tailwind CSS utility classes are extensively used for styling, with arbitrary values (e.g., `bg-slate-800/80`, `drop-shadow-[...]`).
- Conditional styling is done using template literals.

## Backend
- CommonJS (`require`) is used in the Node.js backend (`server.js`).
