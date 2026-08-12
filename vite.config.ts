import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const STUDENT_SESSION_COOKIE = "CONNECTHING_STUDENT_SESSION";
const ADMIN_SESSION_COOKIE = "CONNECTHING_ADMIN_SESSION";
const LOCAL_SESSION_COOKIE_PATTERN = /^(?:CONNECTHING_(?:DEV|STUDENT|ADMIN)_SESSION)=/i;

const apiProxy = (target: string, localSessionCookie: string) => {
  let latestBackendSession: string | null = null;

  return {
    target,
    changeOrigin: true,
    configure: (proxy: {
    on: {
      (
        event: "proxyRes",
        handler: (proxyResponse: {
          headers: Record<string, string[] | undefined>;
        }) => void,
      ): void;
      (
        event: "proxyReq",
        handler: (
          proxyRequest: {
            removeHeader: (name: string) => void;
            setHeader: (name: string, value: string) => void;
          },
          request: { headers: { cookie?: string } },
        ) => void,
      ): void;
    };
  }) => {
    proxy.on("proxyReq", (proxyRequest, request) => {
      const browserCookies = request.headers.cookie ?? "";

      const backendCookies = browserCookies
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(
          (cookie) =>
            !/^SESSION=/i.test(cookie) &&
            !LOCAL_SESSION_COOKIE_PATTERN.test(cookie),
        );

      const browserSession = browserCookies
        .split(";")
        .map((cookie) => cookie.trim())
        .filter((cookie) =>
          new RegExp(`^${localSessionCookie}=`, "i").test(cookie),
        )
        .pop()
        ?.replace(new RegExp(`^${localSessionCookie}=`, "i"), "SESSION=");

      const session = browserSession ?? latestBackendSession;
      if (session) backendCookies.push(session);

      proxyRequest.removeHeader("cookie");
      if (backendCookies.length > 0) {
        proxyRequest.setHeader("cookie", backendCookies.join("; "));
      }
    });

    proxy.on("proxyRes", (proxyResponse) => {
      const cookies = proxyResponse.headers["set-cookie"];
      if (!cookies) return;

      const backendSession = cookies
        .map((cookie) => cookie.split(";", 1)[0])
        .find((cookie) => /^SESSION=/i.test(cookie));
      if (backendSession) latestBackendSession = backendSession;

      // 로컬 HTTP 개발 환경에서만 AWS의 Secure 쿠키를 사용할 수 있게 완화한다.
      proxyResponse.headers["set-cookie"] = cookies.map((cookie) =>
        cookie
          .replace(/^SESSION=/i, `${localSessionCookie}=`)
          .replace(/;\s*Secure/gi, "")
          .replace(/;\s*SameSite=None/gi, "; SameSite=Lax"),
      );
    });
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://3.19.74.97";

  return {
    // 학생 앱과 관리자 앱이 같은 node_modules를 사용하더라도
    // 서로의 최적화 결과를 덮어쓰지 않도록 캐시를 분리한다.
    cacheDir: "node_modules/.vite-student",
    plugins: [react()],
    server: {
      proxy: {
        "/api": apiProxy(proxyTarget, STUDENT_SESSION_COOKIE),
        // 관리자 로그인 화면은 학생 앱에 있지만 실제 관리자 API는 5174에서
        // 사용한다. 같은 localhost에서 포트별 쿠키를 분리할 수 없으므로,
        // 이 경로로 관리자 전용 세션 쿠키를 별도로 발급한 뒤 5174로 이동한다.
        "/admin-api": {
          ...apiProxy(proxyTarget, ADMIN_SESSION_COOKIE),
          rewrite: (path: string) => path.replace(/^\/admin-api/, "/api"),
        },
        "/actuator": apiProxy(proxyTarget, STUDENT_SESSION_COOKIE),
      },
    },
  };
});
