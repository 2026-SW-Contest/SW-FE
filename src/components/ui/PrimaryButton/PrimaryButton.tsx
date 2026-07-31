import "./PrimaryButton.css";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const PrimaryButton = ({
  children,
  type = "button",
  className = "",
  ...props
}: PrimaryButtonProps) => {
  return (
    <button
      type={type}
      className={`primary-button ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;