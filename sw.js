// Service worker: precaches the whole app so it works fully offline.
const VERSION = '1.0.0'; // Semantic Versioning (https://semver.org)
const APP_CACHE = `safe-mark-doc-v${VERSION}`;
const SHARE_CACHE = 'share-target';

const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'js/watermark.js',
  'js/pdf-writer.js',
  'js/redact.js',
  'js/i18n.js',
  'vendor/pdfjs/pdf.min.mjs',
  'vendor/pdfjs/pdf.worker.min.mjs',
  'manifest.webmanifest',
  'icons/favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(ASSETS.map((path) => new Request(path, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== APP_CACHE && k !== SHARE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.method === 'POST' && url.searchParams.has('share-target')) {
    event.respondWith(receiveSharedFiles(request));
    return;
  }
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(new Request(new URL('index.html', self.registration.scope)), event));
    return;
  }
  event.respondWith(staleWhileRevalidate(request, event));
});

// Serve from cache immediately; refresh the cached copy in the background when online.
async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) ?? new Response('Sin conexión', { status: 503, statusText: 'Offline' });
}

// Web Share Target: stash incoming files, then hand off to the app page.
async function receiveSharedFiles(request) {
  const data = await request.formData();
  const cache = await caches.open(SHARE_CACHE);
  for (const key of await cache.keys()) await cache.delete(key);
  const files = data.getAll('files').filter((f) => f instanceof File);
  await Promise.all(
    files.map((file, i) =>
      cache.put(
        new Request(`shared/${i}`),
        new Response(file, {
          headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) },
        }),
      ),
    ),
  );
  return Response.redirect(new URL('./?shared=1', self.registration.scope).href, 303);
}
