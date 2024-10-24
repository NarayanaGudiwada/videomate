import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

interface User {
  id: string;
  name: string;
  color: string;
}

interface Room {
  id: string;
  users: User[];
  elements: any[];
  history: any[];
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

const rooms = new Map<string, Room>();
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ roomId, userId, userName }) => {
    console.log(`User ${userName} joining room ${roomId}`);

    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        elements: [],
        history: []
      });
    }

    const room = rooms.get(roomId)!;
    const userColor = colors[room.users.length % colors.length];
    
    const user: User = {
      id: userId,
      name: userName,
      color: userColor
    };

    room.users.push(user);
    socket.join(roomId);

    // Send current state to new user
    socket.emit('room-state', {
      elements: room.elements,
      users: room.users
    });

    // Notify others about new user
    socket.to(roomId).emit('user-joined', user);
  });

  socket.on('element-update', ({ roomId, elementId, changes }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.elements = room.elements.map((el: any) => 
        el.id === elementId ? { ...el, ...changes } : el
      );
      socket.to(roomId).emit('element-updated', { elementId, changes });
    }
  });

  socket.on('add-element', ({ roomId, element }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.elements.push(element);
      socket.to(roomId).emit('element-added', element);
    }
  });

  socket.on('delete-element', ({ roomId, elementId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.elements = room.elements.filter((el: any) => el.id !== elementId);
      socket.to(roomId).emit('element-deleted', elementId);
    }
  });

  socket.on('cursor-move', ({ roomId, position, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
      const user = room.users.find(u => u.id === userId);
      if (user) {
        socket.to(roomId).emit('cursor-moved', {
          userId,
          position,
          color: user.color
        });
      }
    }
  });

  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach(roomId => {
      if (roomId !== socket.id) {
        const room = rooms.get(roomId);
        if (room) {
          room.users = room.users.filter(user => user.id !== socket.id);
          socket.to(roomId).emit('user-left', socket.id);
          
          if (room.users.length === 0) {
            rooms.delete(roomId);
          }
        }
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
