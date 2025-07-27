// File: src/components/ui/ToastContainer.jsx
// Renders the toast notifications.
import React from "react";
import { useToast } from "../../context/ToastContext";

const Toast = ({ message, type, onRemove }) => {
  const bgColor = type === "success" ? "bg-primary-500" : "bg-red-500";
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-md shadow-lg text-white animate-toast-in ${bgColor}`}
    >
      <span>{message}</span>
      <button onClick={onRemove} className="ml-4 font-bold text-lg">
        &times;
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-50 space-y-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
