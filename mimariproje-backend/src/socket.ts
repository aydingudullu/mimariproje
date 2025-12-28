import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env';

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins for now, restrict in production
      methods: ['GET', 'POST'],
    },
  });

  const notificationNamespace = io.of('/notifications');

  notificationNamespace.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  notificationNamespace.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected to notifications: ${user.id}`);

    socket.join(user.id.toString()); // Join a room with user's ID

    socket.on('disconnect', () => {
      console.log('User disconnected from notifications');
    });
  });

  return io;
};
