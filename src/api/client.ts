export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  code?: string;
  message?: string;
  path?: string;
  fieldErrors?: FieldError[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly path?: string;
  readonly fieldErrors: FieldError[];

  constructor(status: number, body: ApiErrorBody | null) {
    super(
      body?.fieldErrors?.[0]?.message ||
        body?.message ||
        "요청을 처리하지 못했습니다.",
    );
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code;
    this.path = body?.path;
    this.fieldErrors = body?.fieldErrors ?? [];
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const AUTH_EXPIRED_EVENT = "connecthing:auth-expired";

interface CsrfCredential {
  headerName: string;
  token: string;
}

let csrfCredential: CsrfCredential | null = null;
let csrfRequest: Promise<CsrfCredential> | null = null;

const readJson = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;

  const text = await response.text().catch(() => "");
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;

export const unwrapData = <T>(value: unknown): T => {
  const record = asRecord(value);
  return (record && "data" in record ? record.data : value) as T;
};

const extractCsrfCredential = (value: unknown): CsrfCredential | null => {
  const payload = asRecord(unwrapData<unknown>(value));
  if (!payload) return null;

  const headerName =
    typeof payload.headerName === "string" && payload.headerName
      ? payload.headerName
      : "X-CSRF-TOKEN";

  for (const key of ["token", "csrfToken", "value"]) {
    if (typeof payload[key] === "string" && payload[key]) {
      return { headerName, token: payload[key] as string };
    }
  }

  return null;
};

export const clearCsrfToken = () => {
  csrfCredential = null;
  csrfRequest = null;
};

export const getCsrfToken = async (forceRefresh = false) => {
  if (forceRefresh) clearCsrfToken();
  if (csrfCredential) return csrfCredential;
  if (csrfRequest) return csrfRequest;

  csrfRequest = (async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    const body = await readJson(response);

    if (!response.ok) {
      throw new ApiError(response.status, asRecord(body) as ApiErrorBody | null);
    }

    const credential = extractCsrfCredential(body);
    if (!credential) {
      throw new Error("CSRF 토큰 응답 형식을 확인할 수 없습니다.");
    }

    csrfCredential = credential;
    return credential;
  })().finally(() => {
    csrfRequest = null;
  });

  return csrfRequest;
};

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipCsrf?: boolean;
}

const executeRequest = async <T>(
  path: string,
  options: ApiRequestOptions,
  csrfRetried: boolean,
): Promise<T> => {
  const method = (options.method ?? "GET").toUpperCase();
  const isMutation = MUTATION_METHODS.has(method);
  const headers = new Headers(options.headers);
  let body: BodyInit | undefined;

  headers.set("Accept", "application/json");

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  if (isMutation && !options.skipCsrf) {
    // 세션 쿠키와 토큰이 항상 한 쌍이 되도록 변경 요청 직전에 새로 발급한다.
    const csrf = await getCsrfToken(true);
    headers.set(csrf.headerName, csrf.token);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    body,
    credentials: "include",
  });
  const responseBody = await readJson(response);

  if (!response.ok) {
    const errorBody = asRecord(responseBody) as ApiErrorBody | null;

    // CSRF 오류이거나 Spring Security가 본문 없이 403을 반환한 경우에만
    // 토큰을 새로 받아 재시도한다. 권한 부족 403은 반복 요청하지 않는다.
    const shouldRetryCsrf =
      errorBody?.code === "SECURITY_INVALID_CSRF_TOKEN" ||
      (response.status === 403 && !errorBody?.code);
    if (!csrfRetried && isMutation && shouldRetryCsrf) {
      return executeRequest<T>(path, options, true);
    }

    if (
      response.status === 401 &&
      errorBody?.code === "SECURITY_AUTHENTICATION_REQUIRED"
    ) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }

    throw new ApiError(response.status, errorBody);
  }

  return unwrapData<T>(responseBody);
};

export const apiRequest = <T>(path: string, options: ApiRequestOptions = {}) =>
  executeRequest<T>(path, options, false);

export const apiGet = <T>(path: string) => apiRequest<T>(path);

export const toQueryString = (
  params: Record<string, string | number | boolean | string[] | undefined>,
) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || (Array.isArray(value) && !value.length)) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
      return;
    }

    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

export const AUTH_SESSION_EXPIRED_EVENT = AUTH_EXPIRED_EVENT;
