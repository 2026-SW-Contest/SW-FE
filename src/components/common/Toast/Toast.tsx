import { useEffect, useState } from "react";

import "./Toast.css";

interface ToastProps {
  message: string;
 visible: boolean;
  duration?: number;
  onClose?: () => void;
}

const Toast = ({
  message,
  visible,
  duration = 4000,
  onClose,
}: ToastProps) => {
  const [isClosing, setIsClosing] =
    useState(false);

  useEffect(() => {
    if (!visible || !onClose) {
      return;
    }

    setIsClosing(false);

    const hideTimer = setTimeout(() => {
      setIsClosing(true);
    }, duration - 500);

    const closeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [visible, duration, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="toast-container">
      <div
        className={`toast body02 ${
          isClosing ? "toast-hide" : ""
        }`}
      >
        {message}
      </div>
    </div>
  );
};

export default Toast;