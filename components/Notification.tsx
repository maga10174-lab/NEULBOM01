import React, { useEffect, useState } from 'react';
import { BellIcon, CheckCircleIcon, CloseIcon } from './icons';
import type { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType;
  onClose: (id: string) => void;
}

const icons = {
  info: <BellIcon className="w-6 h-6 text-blue-500" />,
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
};

export const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Match animation duration
  };

  const animationClass = isExiting
    ? 'animate-slide-out-right'
    : 'animate-slide-in-right';

  return (
    <div
      className={`relative w-full max-w-sm p-4 my-2 overflow-hidden bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ${animationClass}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[notification.type]}
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
        </div>
        <div className="flex flex-shrink-0 ml-4">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">Close</span>
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC<{
  notifications: NotificationType[];
  onClose: (id: string) => void;
}> = ({ notifications, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
      <div className="w-full max-w-sm space-y-2">
        <style>{`
          @keyframes slide-in-right {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes slide-out-right {
            0% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
          .animate-slide-out-right { animation: slide-out-right 0.3s ease-out forwards; }
        `}</style>
        {notifications.map((n) => (
          <Notification key={n.id} notification={n} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};