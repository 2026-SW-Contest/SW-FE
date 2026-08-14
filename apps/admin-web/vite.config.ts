import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

const LOCAL_SESSION_COOKIE = "CONNECTHING_ADMIN_SESSION";
const LOCAL_SESSION_COOKIE_PATTERN = /^(?:CONNECTHING_(?:DEV|STUDENT|ADMIN)_SESSION)=/i;

const apiProxy = (target: string) => ({
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

      // 관리자 개발 서버는 5174 포트를 사용한다. 로컬 프록시를 거친 요청에
      // localhost:5174 Origin을 그대로 전달하면 백엔드 CORS가 상태 변경
      // 요청을 CSRF 검사 전에 차단할 수 있으므로, 동일 출처 프록시 경계에서
      // 로컬 브라우저 Origin을 제거한다. 운영에서는 관리자 배포 도메인을
      // 백엔드 allowedOrigins에 명시해야 한다.
      proxyRequest.removeHeader("origin");

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
          new RegExp(`^${LOCAL_SESSION_COOKIE}=`, "i").test(cookie),
        )
        .pop()
        ?.replace(new RegExp(`^${LOCAL_SESSION_COOKIE}=`, "i"), "SESSION=");

      if (browserSession) backendCookies.push(browserSession);

      proxyRequest.removeHeader("cookie");
      if (backendCookies.length > 0) {
        proxyRequest.setHeader("cookie", backendCookies.join("; "));
      }
    });

    proxy.on("proxyRes", (proxyResponse) => {
      const cookies = proxyResponse.headers["set-cookie"];
      if (!cookies) return;

      proxyResponse.headers["set-cookie"] = cookies.map((cookie) =>
        cookie
          .replace(/^SESSION=/i, `${LOCAL_SESSION_COOKIE}=`)
          .replace(/;\s*Secure/gi, "")
          .replace(/;\s*SameSite=None/gi, "; SameSite=Lax"),
      );
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../../", "");
  const proxyTarget =
    env.VITE_API_PROXY_TARGET || "https://d1i0qdr3ir0xof.cloudfront.net";
  const isVercelBuild = mode === "vercel";

  return {
    root: __dirname,
    envDir: "../../",
    base: isVercelBuild ? "/admin/" : "/",
    // 학생 앱(5173)의 최적화 캐시와 분리해 Outdated Optimize Dep를 방지한다.
    cacheDir: "../../node_modules/.vite-admin",
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        "/api": apiProxy(proxyTarget),
        "/actuator": apiProxy(proxyTarget),
      },
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())],
      },
    },
    build: {
      outDir: isVercelBuild ? "../../dist/admin" : "../../dist-admin",
      emptyOutDir: !isVercelBuild,
    },
  };
});
