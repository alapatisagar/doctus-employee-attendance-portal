import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, CalendarCheck, AlertTriangle, X } from 'lucide-react';
import { NotificationItem } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

export const NotificationDropdown: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    const list = await dbService.getNotifications(currentUser.employeeId);
    setNotifications(list);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await dbService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.read) await dbService.markNotificationRead(n.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'LEAVE_APPROVED':
        return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      case 'LEAVE_REJECTED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'LEAVE_SUBMITTED':
        return <Info className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-doctus-red" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/80 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-doctus-yellow-50 dark:hover:bg-neutral-700 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-doctus-red text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-4 bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 text-neutral-950 flex items-center justify-between font-bold">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Notifications ({unreadCount} unread)</span>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead} 
                  className="text-xs bg-black/10 hover:bg-black/20 text-neutral-900 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-neutral-500">
                  No notifications yet.
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${!n.read ? 'bg-doctus-yellow/10 dark:bg-doctus-yellow-950/20' : ''}`}
                  >
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${!n.read ? 'text-neutral-950 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      {!n.read && (
                        <button 
                          onClick={() => handleMarkAsRead(n.id)}
                          className="mt-1.5 text-[11px] font-semibold text-doctus-red hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
