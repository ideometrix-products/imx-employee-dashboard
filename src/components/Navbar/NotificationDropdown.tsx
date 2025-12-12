import React from 'react';
import { Notification } from '../../types/notification';

interface Props {
  notifications: Notification[];
  markAsRead: (id?: number) => void;
}

const NotificationDropdown: React.FC<Props> = ({ notifications, markAsRead }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute right-0 top-12 bg-white shadow-xl rounded-lg border z-50 w-80 max-h-96 overflow-y-auto">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={() => markAsRead()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex justify-between">
              <h4 className="font-medium text-gray-800">
                {notification.title}
              </h4>
              {!notification.isRead && (
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {notification.time}
            </p>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-500">
          No notifications
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;