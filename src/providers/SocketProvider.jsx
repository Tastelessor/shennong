import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthProvider';
import { API_BASE_URL } from '../utils/request';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize connection once on mount
    const newSocket = io(API_BASE_URL || "http://localhost:3000");
    setSocket(newSocket);

    // Cleanup on unmount
    return () => newSocket.disconnect();
  }, []);

  // Handle Room Joining based on User State
  useEffect(() => {
    if (!socket) return;

    const room = user?.id || "guest_room";
    socket.emit('join_room', room);
    console.log(`SocketProvider: Joined room ${room}`);

  }, [socket, user]); // Re-run when socket is ready or user changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);