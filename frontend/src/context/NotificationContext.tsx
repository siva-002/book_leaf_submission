import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '../types';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  registerTicketNavigator: (fn: (ticketId: string) => void) => () => void;
  openTicket: (ticketId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ticketNavigatorRef = useRef<((ticketId: string) => void) | null>(null);

  const registerTicketNavigator = useCallback((fn: (ticketId: string) => void) => {
    ticketNavigatorRef.current = fn;
    return () => {
      if (ticketNavigatorRef.current === fn) {
        ticketNavigatorRef.current = null;
      }
    };
  }, []);

  const openTicket = useCallback((ticketId: string) => {
    if (ticketNavigatorRef.current) {
      ticketNavigatorRef.current(ticketId);
    }
    setIsOpen(false);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[Notifications] Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch and on user change
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
    }
  }, [user, fetchNotifications]);

  // Real-time socket listener for notifications
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleNewNotification = (notif: Notification) => {
      setNotifications((prev) => {
        // Prevent duplicate notifications
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await api.markNotificationAsRead(id);
    } catch (err) {
      console.error('[Notifications] Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      await api.markAllNotificationsAsRead();
    } catch (err) {
      console.error('[Notifications] Error marking all as read:', err);
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await api.clearNotifications();
    } catch (err) {
      console.error('[Notifications] Error clearing notifications:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        setIsOpen,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAll,
        registerTicketNavigator,
        openTicket,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
