import { ApiError } from "../api/client";

const COMMON_CODE_MESSAGES: Record<string, string> = {
  SECURITY_AUTHENTICATION_REQUIRED: "로그인이 필요한 서비스입니다.",
  SECURITY_INVALID_CSRF_TOKEN: "요청이 만료되었습니다. 다시 시도해주세요.",
  SECURITY_ACCESS_DENIED: "이 작업을 수행할 권한이 없습니다.",
  COMMON_RESOURCE_NOT_FOUND: "요청한 정보를 찾을 수 없습니다.",
  COMMON_INTERNAL_SERVER_ERROR:
    "서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.",
};

const TECHNICAL_MESSAGE_PATTERN =
  /(?:\b(?:4|5)\d{2}\b|forbidden|unauthorized|bad gateway|internal server error|failed to fetch|networkerror|\/api\/|요청 처리에 실패했습니다\s*\(\d+\))/i;

const isSafeMessage = (message?: string) =>
  Boolean(message?.trim()) && !TECHNICAL_MESSAGE_PATTERN.test(message ?? "");

export const getUserErrorMessage = (
  error: unknown,
  fallback = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
  codeMessages: Record<string, string> = {},
) => {
  if (error instanceof ApiError) {
    if (error.code && codeMessages[error.code]) return codeMessages[error.code];
    if (error.code && COMMON_CODE_MESSAGES[error.code]) {
      return COMMON_CODE_MESSAGES[error.code];
    }

    if (error.status === 401) return "로그인이 필요한 서비스입니다.";
    if (error.status === 403) return "이 작업을 수행할 권한이 없습니다.";
    if (error.status === 404) return "요청한 정보를 찾을 수 없습니다.";
    if (error.status === 409) return "현재 상태에서는 처리할 수 없습니다.";
    if (error.status >= 500) {
      return "서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.";
    }

    const fieldMessage = error.fieldErrors.find(({ message }) =>
      isSafeMessage(message),
    )?.message;
    if (fieldMessage) return fieldMessage;
    if (error.status === 400 && isSafeMessage(error.message)) return error.message;
    return fallback;
  }

  if (error instanceof TypeError) {
    return "네트워크 연결을 확인한 뒤 다시 시도해주세요.";
  }

  return fallback;
};
