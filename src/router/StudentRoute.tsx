import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { isAdminUser, redirectToAdminApp } from "../utils/authRole";

interface StudentRouteProps {
  children: ReactNode;
  loginNotice?: string;
}

const StudentRoute = ({ children, loginNotice }: StudentRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const shouldRedirectToAdmin = isAuthenticated && isAdminUser(user);

  useEffect(() => {
    if (shouldRedirectToAdmin) redirectToAdminApp();
  }, [shouldRedirectToAdmin]);

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

  if (shouldRedirectToAdmin) return null;

  return children;
};

export default StudentRoute;
