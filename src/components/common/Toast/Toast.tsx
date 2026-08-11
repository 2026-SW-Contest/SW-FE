import { useEffect, useState } from "react";

import "./Toast.css";

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  placement?: "page-bottom" | "above-navigation";
  onClose?: () => void;
}

const Toast = ({
  message,
  visible,
  duration = 3000,
  placement = "page-bottom",
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
    <div
      className={`toast-container toast-container-${placement}`}
      role="status"
      aria-live="polite"
    >
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
