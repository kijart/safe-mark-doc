// Service worker: precaches the whole app so it works fully offline.
const VERSION = '1.2.0'; // x-release-please-version
const APP_CACHE = `safe-mark-doc-v${VERSION}`;
const SHARE_CACHE = 'share-target';

const ASSETS = [
  './',
  'index.html',
  'css/styles.css',
  'js/app.js',
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
      .then((cache) => cache.addAll(ASSETS.map((path) => new Request(path, { cache: 'reload' })))),
  );
  // No skipWaiting here: an update waits until the page asks for it (see the message handler),
  // so an open page never mixes files from two versions.
});

// The page sends 'skip-waiting' when the user accepts the update, and 'get-version' to show
// the release it is running.
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
  else if (event.data === 'get-version') event.source?.postMessage({ version: VERSION });
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
    event.respondWith(cacheFirst(new Request(new URL('index.html', self.registration.scope))));
    return;
  }
  event.respondWith(cacheFirst(request));
});

// Serve from this version's cache only, so every file of a page comes from the same release.
// New versions arrive as a whole through install, never file by file. Files outside the
// precache (e.g. LICENSE) go to the network and are not cached.
async function cacheFirst(request) {
  const cached = await caches.match(request, { cacheName: APP_CACHE, ignoreSearch: true });
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch {
    return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
  }
}

// Web Share Target: stash incoming files, then hand off to the app page. The redirect happens
// even if the share can't be read, so the app opens and reports it instead of an error page.
async function receiveSharedFiles(request) {
  try {
    await caches.delete(SHARE_CACHE);
    const data = await request.formData();
    const cache = await caches.open(SHARE_CACHE);
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
  } catch (err) {
    console.error(err);
    // Don't leave half a share behind.
    await caches.delete(SHARE_CACHE).catch(() => {});
  }
  return Response.redirect(new URL('./?shared=1', self.registration.scope).href, 303);
}
