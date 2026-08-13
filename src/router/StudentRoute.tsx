import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import logoSymbol from "../assets/icons/brand/logo-symbol.svg";

import "./StudentRoute.css";

interface StudentRouteProps {
  children: ReactNode;
  loginNotice?: string;
}

const StudentRoute = ({ children, loginNotice }: StudentRouteProps) => {
  const location = useLocation();
  const { isAuthChecking, isAuthenticated } = useAuth();

  if (isAuthChecking) {
    return (
      <div className="auth-route-loading" role="status" aria-live="polite">
        <img src={logoSymbol} alt="" className="auth-route-loading-logo" />
        <span className="auth-route-loading-spinner" aria-hidden="true" />
        <span className="caption02">로그인 상태를 확인하고 있어요</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
          loginNotice,
        }}
      />
    );
  }

  return children;
};

export default StudentRoute;
