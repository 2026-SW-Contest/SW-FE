import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AuthUser,
  changePassword as changePasswordRequest,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  withdraw as withdrawRequest,
} from "../api/auth";
import { AUTH_SESSION_EXPIRED_EVENT } from "../api/client";

const AUTH_STORAGE_KEY = "connecthingAuth";

interface StoredAuth {
  authenticated: boolean;
  user: AuthUser | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  withdraw: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string,
  ) => Promise<void>;
}

const readStoredAuth = (): StoredAuth => {
  try {
    const value = localStorage.getItem(AUTH_STORAGE_KEY);
    if (value) return JSON.parse(value) as StoredAuth;

  } catch {
    // 손상된 브라우저 저장값은 로그아웃 상태로 복구한다.
  }

  return { authenticated: false, user: null };
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<StoredAuth>(readStoredAuth);

  const persistAuth = useCallback((next: StoredAuth) => {
    setAuth(next);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    localStorage.removeItem("isLogin");
  }, []);

  const clearAuth = useCallback(() => {
    setAuth({ authenticated: false, user: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("isLogin");
  }, []);

  useEffect(() => {
    const handleExpired = () => clearAuth();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired);
  }, [clearAuth]);

  useEffect(() => {
    if (!auth.authenticated) return;

    let active = true;
    void getCurrentUser()
      .then((currentUser) => {
        if (!active) return;

        const nextUser: AuthUser = {
          ...auth.user,
          ...currentUser,
          roles:
            currentUser.roles?.length > 0
              ? currentUser.roles
              : auth.user?.roles ?? [],
        };
        persistAuth({ authenticated: true, user: nextUser });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [auth.authenticated, auth.user?.userId, persistAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const loginUser = await loginRequest({ email, password });
      const currentUser = await getCurrentUser().catch(() => null);
      const currentUserRoles = currentUser?.roles;
      const user: AuthUser = {
        ...loginUser,
        ...currentUser,
        roles:
          currentUserRoles && currentUserRoles.length > 0
            ? currentUserRoles
            : loginUser.roles,
      };
      if (!user?.roles?.length) {
        throw new Error("로그인 응답에 사용자 권한 정보가 없습니다.");
      }
      persistAuth({ authenticated: true, user });
      return user;
    },
    [persistAuth],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      newPasswordConfirm: string,
    ) => {
      await changePasswordRequest({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });
      // 성공 시 백엔드가 모든 세션을 만료하므로 로컬 인증 정보도 즉시 제거한다.
      clearAuth();
    },
    [clearAuth],
  );

  const withdraw = useCallback(async () => {
    await withdrawRequest();
    // 탈퇴 성공 시 백엔드가 모든 세션을 종료하므로 로컬 인증 정보도 제거한다.
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      isAuthenticated: auth.authenticated,
      user: auth.user,
      login,
      logout,
      withdraw,
      changePassword,
    }),
    [auth, changePassword, login, logout, withdraw],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
