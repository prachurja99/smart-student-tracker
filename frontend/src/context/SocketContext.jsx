import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationsRead, clearAllNotifications } from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Fetch persistent notifications from MongoDB on login
  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        const fetched = res.data.notifications.map((n) => ({
          id: n._id,
          type: n.type,
          message: n.message,
          details: n.details,
          read: n.read,
          time: new Date(n.createdAt).toLocaleTimeString(),
        }));
        setNotifications(fetched);
      } catch {
        console.log('Failed to fetch notifications');
      }
    };

    fetchNotifications();
  }, [user]);

  // Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join', user.id);
    });

    newSocket.on('reconnect', () => {
      console.log('Socket reconnected');
      newSocket.emit('join', user.id);
    });

    if (user.role === 'student') {
      newSocket.on('newGrade', (data) => {
        setNotifications((prev) => [
          {
            id: data.id || Date.now(),
            type: 'grade_added',
            message: data.message,
            details: data.details,
            read: false,
            time: data.time || new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
        window.dispatchEvent(new Event('gradeUpdated'));
      });
    }

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markNotificationsRead();
    } catch {
      console.log('Failed to mark notifications as read');
    }
  };

  const clearNotifications = async () => {
    setNotifications([]);
    try {
      await clearAllNotifications();
    } catch {
      console.log('Failed to clear notifications');
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, markAllRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);