export interface SignupRequest {
  name: string;
  studentNumber: string;
  email: string;
  password: string;
  passwordConfirm: string;
  emailVerificationToken: string;
}

export interface SignupResponse {
  userId: number;
  email: string;
  name: string;
  studentNumber: string;
  roles: string[];
}

interface ApiErrorResponse {
  message?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

const CSRF_TOKEN =
  import.meta.env.VITE_CSRF_TOKEN ?? "csrf-token-value";

export const signup = async (
  request: SignupRequest,
): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": CSRF_TOKEN,
    },
    body: JSON.stringify(request),
  });

  const responseBody = (await response
    .json()
    .catch(() => null)) as SignupResponse | ApiErrorResponse | null;

  if (!response.ok) {
    const message =
      responseBody && "message" in responseBody
        ? responseBody.message
        : undefined;

    throw new Error(message || "회원가입에 실패했습니다.");
  }

  return responseBody as SignupResponse;
};
