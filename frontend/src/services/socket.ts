import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('bookleaf_token');
    socket = io(SOCKET_URL, {
      auth: { token },
      query: { token: token || '' },
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      const currentToken = localStorage.getItem('bookleaf_token');
      if (currentToken) {
        socket?.emit('authenticate', currentToken);
      }
    });
  }
  return socket;
};

export const syncSocketAuth = (token: string | null) => {
  const s = getSocket();
  if (token) {
    s.auth = { token };
    s.emit('authenticate', token);
  }
};

export const reconnectSocket = () => {
  const token = localStorage.getItem('bookleaf_token');
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('authenticate', token);
    }
    return socket;
  }
  return getSocket();
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
