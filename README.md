# DCIM Dashboard (Data Center Infrastructure Management)

A modern, high-fidelity dashboard for monitoring and managing data center infrastructure. Built with React and Tailwind CSS, featuring a "Dark Glass" aesthetic.

## 🚀 Features

-   **Real-Time Monitoring**: Live data simulation for Cooling, UPS Power, and Environmental metrics.
-   **Interactive Visuals**:
    -   **Cooling**: Schematic view of cooling units and efficiency gauges.
    -   **UPS**: Power flow diagrams and battery status.
    -   **Environment**: Gauge cluster for Temperature, Humidity, and Airflow.
-   **Alarm System**: Full-screen visual warning system for Fire Alarms with interactive controls.
-   **Modern UI**: Fully responsive design with glassmorphism effects and smooth animations.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/divvv19/dcim_dashboard.git
    cd dcim_dashboard
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run in Development Mode** (Requires two terminals)

    **Terminal 1: Backend API**
    ```bash
    cd server
    npm install
    npm run dev
    ```
    *Runs on http://localhost:5000*

    **Terminal 2: Frontend Dashboard**
    ```bash
    npm install
    npm run dev
    ```
    *Runs on http://localhost:5173*


