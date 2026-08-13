import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { isAdminUser } from "../utils/authRole";

const AUTH_STORAGE_KEY = "connecthingAuth";

interface StoredAuth {
  authenticated: boolean;
  user: AuthUser | null;
}

interface AuthContextValue {
  isAuthChecking: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  verifySession: () => Promise<AuthUser | null>;
  clearLocalAuth: () => void;
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
  const [isAuthChecking, setIsAuthChecking] = useState(auth.authenticated);
  const shouldVerifyInitialSession = useRef(auth.authenticated);
  const verificationRequest = useRef<Promise<AuthUser | null> | null>(null);

  const persistAuth = useCallback((next: StoredAuth) => {
    setAuth(next);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    localStorage.removeItem("isLogin");
  }, []);

  const clearAuth = useCallback(() => {
    setAuth({ authenticated: false, user: null });
    setIsAuthChecking(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("isLogin");
  }, []);

  useEffect(() => {
    const handleExpired = () => clearAuth();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired);
  }, [clearAuth]);

  const verifySession = useCallback(() => {
    if (verificationRequest.current) return verificationRequest.current;

    setIsAuthChecking(true);

    const request = getCurrentUser()
      .then((currentUser) => {
        // 관리자 인증 정보는 관리자 앱에서만 유지한다. 학생 앱에 관리자 role이
        // 남아 있으면 마이페이지 진입 시 5174를 경유하는 화면 깜빡임이 생긴다.
        if (isAdminUser(currentUser)) {
          clearAuth();
          return currentUser;
        }

        persistAuth({ authenticated: true, user: currentUser });
        return currentUser;
      })
      .catch(() => {
        clearAuth();
        return null;
      })
      .finally(() => {
        verificationRequest.current = null;
        setIsAuthChecking(false);
      });

    verificationRequest.current = request;
    return request;
  }, [clearAuth, persistAuth]);

  useEffect(() => {
    if (shouldVerifyInitialSession.current) {
      void verifySession();
    }
  }, [verifySession]);

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
      isAuthChecking,
      // 저장된 인증 정보는 서버 세션 확인이 끝난 뒤에만 사용한다.
      // 확인 중에는 로그아웃 상태로 노출해 보호 경로를 거쳐 로그인 화면으로
      // 재이동하는 이중 내비게이션을 방지한다.
      isAuthenticated: !isAuthChecking && auth.authenticated,
      user: auth.user,
      verifySession,
      clearLocalAuth: clearAuth,
      login,
      logout,
      withdraw,
      changePassword,
    }),
    [auth, changePassword, clearAuth, isAuthChecking, login, logout, verifySession, withdraw],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
