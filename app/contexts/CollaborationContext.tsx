'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

interface CollaborationContextType {
  socket: Socket | null;
  roomId: string | null;
  connectedUsers: any[];
  cursors: Map<string, { x: number; y: number; color: string }>;
  joinRoom: (roomId: string) => void;
  updateElement: (elementId: string, changes: any) => void;
  addElement: (element: any) => void;
  deleteElement: (elementId: string) => void;
  updateCursor: (position: { x: number; y: number }) => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number; color: string }>>(
    new Map()
  );
  const { user } = useUser();

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('user-joined', (user) => {
      setConnectedUsers((prev) => [...prev, user]);
    });

    socket.on('user-left', (userId) => {
      setConnectedUsers((prev) => prev.filter((user) => user.id !== userId));
      setCursors((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on('cursor-moved', ({ userId, position, color }) => {
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(userId, { ...position, color });
        return next;
      });
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('cursor-moved');
    };
  }, [socket]);

  const joinRoom = (newRoomId: string) => {
    if (socket && user) {
      setRoomId(newRoomId);
      socket.emit('join-room', {
        roomId: newRoomId,
        userId: user.id,
        userName: user.fullName || user.username
      });
    }
  };

  const updateElement = (elementId: string, changes: any) => {
    if (socket && roomId) {
      socket.emit('element-update', { roomId, elementId, changes });
    }
  };

  const addElement = (element: any) => {
    if (socket && roomId) {
      socket.emit('add-element', { roomId, element });
    }
  };

  const deleteElement = (elementId: string) => {
    if (socket && roomId) {
      socket.emit('delete-element', { roomId, elementId });
    }
  };

  const updateCursor = (position: { x: number; y: number }) => {
    if (socket && roomId) {
      socket.emit('cursor-move', { roomId, position });
    }
  };

  const value = {
    socket,
    roomId,
    connectedUsers,
    cursors,
    joinRoom,
    updateElement,
    addElement,
    deleteElement,
    updateCursor
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}
