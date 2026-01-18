import React, { useEffect, useState, useRef, useContext } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthProvider';
import { API_BASE_URL } from '../utils/request';
import { SocketContext } from './Contexts';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const lastRoomRef = useRef(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    if (lastRoomRef.current) socket.emit('leave_room', lastRoomRef.current);
    const currentRoom = user?.id || "guest_room";
    socket.emit('join_room', currentRoom);
    lastRoomRef.current = currentRoom;
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  return context;
}
