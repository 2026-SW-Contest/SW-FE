import { apiGet, apiRequest, clearCsrfToken } from "./client";

export interface AuthUser {
  userId: number;
  email: string;
  name?: string;
  studentNumber?: string;
  department?: {
    departmentId: number;
    departmentName: string;
  } | null;
  roles: string[];
}

export interface SignupRequest {
  name: string;
  studentNumber: string;
  email: string;
  password: string;
  passwordConfirm: string;
  emailVerificationToken: string;
}

export type SignupResponse = AuthUser;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface EmailVerificationConfirmResponse {
  emailVerificationToken: string;
}

export const sendEmailVerification = (email: string) =>
  apiRequest<void>("/api/auth/email-verifications", {
    method: "POST",
    body: { email },
  });

export const confirmEmailVerification = async (email: string, code: string) => {
  const response = await apiRequest<
    EmailVerificationConfirmResponse & { verificationToken?: string; token?: string }
  >("/api/auth/email-verifications/confirm", {
    method: "POST",
    body: { email, code },
  });

  return {
    emailVerificationToken:
      response.emailVerificationToken ??
      response.verificationToken ??
      response.token ??
      "",
  };
};

export const signup = (request: SignupRequest) =>
  apiRequest<SignupResponse>("/api/auth/signup", {
    method: "POST",
    body: request,
  });

export const login = (request: LoginRequest) =>
  apiRequest<AuthUser>("/api/auth/login", {
    method: "POST",
    body: request,
  });

export const createAdminSession = async (request: LoginRequest) => {
  const csrfResponse = await fetch("/admin-api/auth/csrf", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const csrf = (await csrfResponse.json().catch(() => null)) as {
    headerName?: string;
    token?: string;
  } | null;

  if (!csrfResponse.ok || !csrf?.token) {
    throw new Error("관리자 로그인 세션을 준비하지 못했습니다.");
  }

  const loginResponse = await fetch("/admin-api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      [csrf.headerName || "X-CSRF-TOKEN"]: csrf.token,
    },
    body: JSON.stringify(request),
  });

  if (!loginResponse.ok) {
    throw new Error("관리자 로그인 세션을 생성하지 못했습니다.");
  }
};

export const getCurrentUser = () => apiGet<AuthUser>("/api/users/me");

export const changePassword = (request: ChangePasswordRequest) =>
  apiRequest<void>("/api/users/me/password", {
    method: "PATCH",
    body: request,
  });

export const logout = async () => {
  await apiRequest<void>("/api/auth/logout", { method: "POST" });
  clearCsrfToken();
};

export const withdraw = async () => {
  await apiRequest<void>("/api/auth/me", { method: "DELETE" });
  clearCsrfToken();
};
