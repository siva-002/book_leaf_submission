import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthUser } from '../middleware/authMiddleware';

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all local development origins
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      (socket.handshake.query?.token as string | undefined);

    if (!token) {
      // Allow connection; will authenticate dynamically via 'authenticate' event if needed
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user: AuthUser | undefined = (socket as any).user;

    const joinUserRooms = (u: AuthUser) => {
      if (u.role === 'admin') {
        socket.join('admin_room');
      } else if (u.role === 'author') {
        socket.join(`author:${u.id}`);
      }
    };

    if (user) {
      joinUserRooms(user);
    }

    // Dynamic authentication on login or token refresh
    socket.on('authenticate', (token: string) => {
      if (!token) return;
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
        (socket as any).user = decoded;
        joinUserRooms(decoded);
      } catch (err) {
        // invalid token
      }
    });

    // Join specific ticket room for live chat updates
    socket.on('join:ticket', (ticketId: string) => {
      if (ticketId) {
        socket.join(`ticket:${ticketId}`);
      }
    });

    socket.on('leave:ticket', (ticketId: string) => {
      if (ticketId) {
        socket.leave(`ticket:${ticketId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return io;
};

export const emitToAdmins = (event: string, data: any): void => {
  if (io) {
    io.to('admin_room').emit(event, data);
  }
};

export const emitToAuthor = (authorId: string, event: string, data: any): void => {
  if (io && authorId) {
    io.to(`author:${authorId}`).emit(event, data);
  }
};

export const emitToTicket = (ticketId: string, event: string, data: any): void => {
  if (io && ticketId) {
    io.to(`ticket:${ticketId}`).emit(event, data);
  }
};

export const emitNotification = (
  targetRole: 'admin' | 'author' | 'all',
  authorId: string | null,
  notification: any
): void => {
  if (!io) return;
  if (targetRole === 'admin' || targetRole === 'all') {
    io.to('admin_room').emit('notification:new', notification);
  }
  if ((targetRole === 'author' || targetRole === 'all') && authorId) {
    io.to(`author:${authorId}`).emit('notification:new', notification);
  }
};
