# backend.py
# ---------------------------------------------------------
# INSTRUCTIONS TO RUN:
# 1. Install FastAPI and Uvicorn:
#    pip install fastapi uvicorn
#
# 2. Run the server:
#    uvicorn backend:app --reload
#
# 3. The API will be available at: http://localhost:8000/api/sensors
# ---------------------------------------------------------

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import time

app = FastAPI()

# Enable CORS so the React Frontend (port 5173) can talk to this Backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/sensors")
def get_sensor_data():
    """
    Returns simulated sensor data.
    In a real app, you would replace the random values below 
    with actual readings from your Modbus/Serial connection.
    """
    
    # Simulate some realistic fluctuation
    base_temp = 22.0
    base_hum = 48.0
    
    # Add small random variation
    current_temp = base_temp + random.uniform(-1.0, 1.5)
    current_hum = base_hum + random.uniform(-2.0, 2.0)

    return {
        "coldAisleTemp": round(current_temp, 1),
        "coldAisleHum": round(current_hum, 1),
        "hotAisleTemp": round(current_temp + 10, 1), # Hot aisle is usually hotter
        "hotAisleHum": round(current_hum - 15, 1),
        
        # Alarms (You can toggle these based on real logic)
        "fireStatus": "Normal",      # Change to "Alarm" to trigger red screen
        "leakageStatus": "Normal",   # Change to "Alarm" to trigger leak warning
        
        # Door Sensors
        "frontDoorOpen": False,
        "backDoorOpen": False
    }
