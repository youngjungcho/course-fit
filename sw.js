// 오프라인용: 한 번 연 화면과 지역 자료를 휴대폰에 저장해 두고, 인터넷이 없으면 저장한 것을 보여 줘요
// 사이트를 고칠 때마다 VERSION을 index.html의 REGION_VERSION과 같게 올려요 (예전 저장분을 지워요)
const VERSION = "20261108d";
const CACHE = `course-fit-${VERSION}`;
const SHELL = ["./", `./regions.js?v=${VERSION}`, "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("course-fit-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  // 카카오 지도처럼 다른 곳의 자료는 건드리지 않아요
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // 화면: 인터넷이 되면 새로 받아 저장하고, 안 되면 저장해 둔 화면을 보여 줘요
  if (req.mode === "navigate") {
    e.respondWith(fetch(req)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./", copy)); return res; })
      .catch(() => caches.match("./")));
    return;
  }
  // 지역 자료·아이콘: 주소에 버전이 붙어 있어서 저장한 것을 먼저 쓰고, 없으면 받아서 저장해요
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
