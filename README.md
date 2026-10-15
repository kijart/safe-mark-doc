# Safe Mark Doc

An offline-first Progressive Web App that adds tamper-resistant watermarks to sensitive documents — ID cards, passports, contracts, invoices — before you share them.

Everything runs in your browser. There is no server, no upload and no tracking: your files never leave your device.

## Why

Sending a plain copy of your ID to a landlord, a hotel or an online service makes identity fraud easy. A visible watermark that states **who** the copy is for, **when** it was made and **what** it may be used for makes the copy far less useful to anyone else. Safe Mark Doc makes that quick and private.

## Features

- **Inputs** — images (JPG, PNG, WebP, …) and PDFs, including password-protected PDFs. Multiple files and multi-page documents in one go.
- **Watermark content** — custom text, optional date and an optional unique trace code per copy. A local log records which code was given to whom, so a leaked copy can be traced back.
- **Hard-to-remove patterns** — wavy text with per-letter variation, alternating filled/outlined rows, guilloché-style background mesh and microtext.
- **Redaction** — cover, blur or pixelate sensitive areas by dragging over the preview, page by page.
- **Safe output** — the result is flattened (rasterized) and stripped of EXIF metadata. Export to PDF, JPG or PNG.
- **Sharing** — native share sheet (Web Share API) and Android _share target_, so you can send files to the app straight from other apps.
- **Works offline** — installable; after the first visit everything is cached by a service worker.
- **Localized** — English and Spanish UI (auto-detected from the browser), with light, dark and automatic themes.

## Getting started

There is no build step and no dependencies to install. Serve the project folder over HTTP — service workers require `localhost` or HTTPS:

```sh
python3 -m http.server 8080
# or
npx serve .
```

Then open <http://localhost:8080>.

## Deployment

Upload the folder as-is to any static host with HTTPS (GitHub Pages, Netlify, Cloudflare Pages, …).

> **Important:** after changing any file, bump `VERSION` in `sw.js` so installed clients pick up the new cache.

### Versioning

The app follows [Semantic Versioning](https://semver.org/). The current version is `VERSION` in `sw.js`, which also names the offline cache (`safe-mark-doc-v<version>`):

- **MAJOR** — incompatible changes, e.g. stored preferences or the trace log can no longer be read.
- **MINOR** — new features that keep compatibility.
- **PATCH** — bug fixes and small adjustments.

To release a version, update `VERSION`, commit, and tag the commit with the same version prefixed by `v`:

```sh
git tag v1.0.0
git push --tags
```

### GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages** and select the branch and the root folder (`/`).
3. The app will be available at `https://<user>.github.io/<repo>/`. All paths are relative, so it works from a subpath.

## Project structure

```text
.
├── index.html             # App shell
├── styles.css             # Styles (light/dark themes)
├── app.js                 # UI, file loading, export, trace log
├── sw.js                  # Service worker: offline cache and share target
├── manifest.webmanifest   # PWA manifest
├── js/
│   ├── watermark.js       # Watermark rendering engine (canvas)
│   ├── redact.js          # Redaction: cover, blur, pixelate
│   ├── pdf-writer.js      # Minimal PDF writer (one JPEG per page)
│   └── i18n.js            # UI strings and language handling
├── icons/                 # PWA icons and favicon
├── tools/
│   └── make-icons.mjs     # Regenerates the PNG icons
└── vendor/
    └── pdfjs/             # pdf.js 4.10.38, used to read PDFs
```

## Development

### Regenerating icons

The PNG icons are generated without external dependencies (Node.js 18+):

```sh
node tools/make-icons.mjs
```

### Adding a language

In `js/i18n.js`:

1. Add a dictionary to `MESSAGES`.
2. Add its locale to `LOCALES`.
3. Add the language code to `LANGUAGES`.

Then add a matching `<option>` to the language selector in `index.html`.

## Privacy

- Files are processed locally with the Canvas API; nothing is sent over the network.
- Preferences and the trace log are stored in the browser's `localStorage` only (the log keeps the latest 200 entries and can be cleared from the UI).
- Exported files are re-encoded from pixels, so original metadata (EXIF, PDF properties, hidden text layers) is not carried over.

## Browser support

Any modern evergreen browser (Chrome, Edge, Firefox, Safari). Large images are downscaled to stay within mobile canvas limits (notably iOS Safari). The share target is only available when the app is installed on Android.

## Third-party software

- [pdf.js](https://github.com/mozilla/pdf.js) 4.10.38 — Apache License 2.0. See `vendor/pdfjs/LICENSE`.

## License

[MIT](LICENSE). Third-party code under `vendor/` keeps its own license.
