import { AuthUser } from "../api/auth";

export const hasRole = (user: AuthUser | null, role: string) =>
  user?.roles?.some((item) => item.toUpperCase() === role.toUpperCase()) ?? false;

export const isAdminUser = (user: AuthUser | null) => hasRole(user, "ADMIN");

export const isStudentUser = (user: AuthUser | null) => hasRole(user, "STUDENT");

export const getAdminAppUrl = () =>
  import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5174";

export const redirectToAdminApp = (user?: AuthUser | null) => {
  if (!user) {
    window.location.assign(getAdminAppUrl());
    return;
  }

  const payload = window.btoa(
    encodeURIComponent(
      JSON.stringify({
        userId: user.userId,
        email: user.email,
        name: user.name,
        studentNumber: user.studentNumber,
        roles: user.roles,
      }),
    ),
  );
  window.location.assign(`${getAdminAppUrl()}#auth=${payload}`);
};
