import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useRealtimeData = (initialState) => {
    const [data, setData] = useState(initialState);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to DCIM Backend');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from DCIM Backend');
            setIsConnected(false);
        });

        socket.on('dashboard:update', (newData) => {
            setData(newData);
            setLastUpdated(new Date());
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return { data, isConnected, lastUpdated };
};
