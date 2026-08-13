import { AuthUser } from "../api/auth";

const normalizeRole = (role: string) =>
  role.trim().toUpperCase().replace(/^ROLE_/, "");

export const hasRole = (user: AuthUser | null, role: string) =>
  user?.roles?.some((item) => normalizeRole(item) === normalizeRole(role)) ?? false;

export const isAdminUser = (user: AuthUser | null) =>
  hasRole(user, "ADMIN") || hasRole(user, "SUPER_ADMIN");

export const isStudentUser = (user: AuthUser | null) => hasRole(user, "STUDENT");

export const getAdminAppUrl = () => {
  if (import.meta.env.VITE_ADMIN_APP_URL) {
    return import.meta.env.VITE_ADMIN_APP_URL;
  }

  return import.meta.env.DEV
    ? "http://localhost:5174"
    : `${window.location.origin}/admin`;
};

export const redirectToAdminApp = (user?: AuthUser | null) => {
  if (!user) {
    window.location.replace(getAdminAppUrl());
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
  window.location.replace(`${getAdminAppUrl()}#auth=${payload}`);
};
