import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { isAdminUser, redirectToAdminApp } from "../utils/authRole";

const StudentRoute = ({ children }: { children: ReactNode }) => {
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
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  if (shouldRedirectToAdmin) return null;

  return children;
};

export default StudentRoute;
