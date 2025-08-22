// File: src/context/ToastContext.jsx
// Manages the global state for toast notifications.
import React, { createContext, useState, useCallback, useContext } from "react";

export const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random(); // Combine timestamp with random number for uniqueness
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
