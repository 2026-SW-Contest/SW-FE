import { AdminAccount } from "../types";

export const ADMIN_AUTH_KEY = "connecthingAdminAuth";

export const getStudentLoginUrl = () => {
  const studentAppUrl =
    import.meta.env.VITE_STUDENT_APP_URL ||
    (import.meta.env.DEV ? "http://localhost:5173" : window.location.origin);
  return `${studentAppUrl.replace(/\/$/, "")}/login`;
};

export const readAdminAccount = (): AdminAccount | null => {
  const hashPayload = new URLSearchParams(window.location.hash.slice(1)).get("auth");

  try {
    if (hashPayload) {
      const account = JSON.parse(
        decodeURIComponent(window.atob(hashPayload)),
      ) as AdminAccount;
      sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(account));
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
      return account;
    }

    const storedAccount = sessionStorage.getItem(ADMIN_AUTH_KEY);
    return storedAccount ? (JSON.parse(storedAccount) as AdminAccount) : null;
  } catch {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
};
