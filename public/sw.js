self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 온라인 전용 앱이므로 fetch 요청은 가로채거나 캐시하지 않는다.
