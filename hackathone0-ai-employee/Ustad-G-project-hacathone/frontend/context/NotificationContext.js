import React, { createContext, useContext } from 'react';

export const NotificationContext = createContext();

export const useGlobalNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('[NotificationContext] useGlobalNotification must be used within a NotificationProvider');
    return {
      showNotificationAlert: () => {},
      scheduleForegroundAlert: () => {},
    };
  }
  return context;
};
