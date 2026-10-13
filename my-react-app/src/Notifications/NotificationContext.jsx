import React, { createContext, useState, useContext, useCallback } from 'react'

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);
    

  const fetchHistory = useCallback(async (unreadOnly = true) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        `http://localhost:8087/api/v1/notifications?unreadOnly=${unreadOnly}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setNotifications(data); 
    } catch (err) {
      console.error("Failed to fetch notification history", err);
    }
    
  }, []);

  console.log("Notifications: ", notifications);
const addNotification = useCallback((newNotif) => {
    
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

const showToast = useCallback((newNotif) => {
  console.log("SHOW TOAST:", newNotif);
  setToast(newNotif);
}, []);

const dismissToast = useCallback(() => {
  setToast(null);
}, []);

  return (
<NotificationContext.Provider value={{
  notifications,
  addNotification,
  showToast,
  dismissToast,
  toast,
  fetchHistory
}}>      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext