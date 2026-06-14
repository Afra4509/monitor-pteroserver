"use client";

import { useState, useEffect, useCallback } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('afraserver_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  }, []);

  // Save to local storage whenever notifications change
  useEffect(() => {
    localStorage.setItem('afraserver_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((title: string, message: string, type: NotificationType = 'info') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep max 50
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listen for custom window events to add notifications from anywhere
  useEffect(() => {
    const handleAddEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{title: string, message: string, type?: NotificationType}>;
      if (customEvent.detail) {
        addNotification(customEvent.detail.title, customEvent.detail.message, customEvent.detail.type);
      }
    };

    window.addEventListener('app-notification', handleAddEvent);
    return () => window.removeEventListener('app-notification', handleAddEvent);
  }, [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllAsRead,
    clearAll
  };
}

// Global helper to dispatch notifications from anywhere (even outside React components)
export const dispatchNotification = (title: string, message: string, type: NotificationType = 'info') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-notification', {
      detail: { title, message, type }
    }));
  }
};
