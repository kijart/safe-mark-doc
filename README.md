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

### With Docker or Podman

The repository includes a [`Dockerfile`](Dockerfile) and a [`compose.yaml`](compose.yaml) that serve the app with an unprivileged nginx. With Compose:

```sh
docker compose up -d # or: podman compose up -d
```

Then open <http://localhost:8080>.

Without Compose:

```sh
docker build -t safe-mark-doc . # or: podman build -t safe-mark-doc .
docker run -d --rm -p 127.0.0.1:8080:8080 --read-only \
  --tmpfs /tmp --tmpfs /var/cache/nginx --cap-drop ALL \
  --security-opt no-new-privileges safe-mark-doc
```

To skip the build, use a prebuilt image from GitHub Container Registry or Docker Hub (see [Container images](#container-images) for the available tags):

```sh
docker run -d --rm -p 127.0.0.1:8080:8080 --read-only \
  --tmpfs /tmp --tmpfs /var/cache/nginx --cap-drop ALL \
  --security-opt no-new-privileges ghcr.io/kijart/safe-mark-doc:latest
```

The container only serves the static files — documents are still processed in your browser and never reach it. It also:

- runs as a non-root user, with a read-only filesystem and no Linux capabilities (Compose sets this up for you);
- sends a Content Security Policy that only allows connections to the app's own origin, plus other security headers;
- serves `index.html`, `sw.js` and `manifest.webmanifest` with `Cache-Control: no-cache`, so a new version is picked up right away;
- exposes `/healthz` for the built-in health check.

The port is bound to `127.0.0.1` because service workers — offline mode, installing the app and the share target — only work on `localhost` or over HTTPS. To use it from other devices, put an HTTPS reverse proxy in front of the container rather than publishing plain HTTP.

> The CSP allows the small inline script in `index.html` by its hash. If you change that script, update the hash in `container/nginx/conf.d/default.conf` (the command is in the comment above it).

## Deployment

The app is deployed to GitHub Pages and published as a container image automatically when a version is released (see below). It can also be hosted on any static host with HTTPS (Netlify, Cloudflare Pages, …): upload the app files listed in [Project structure](#project-structure).

> **Important:** after changing any file, bump `VERSION` in `sw.js` so installed clients pick up the new cache.

### Versioning

The app follows [Semantic Versioning](https://semver.org/). The current version is `VERSION` in `sw.js`, which also names the offline cache (`safe-mark-doc-v<version>`):

- **MAJOR** — incompatible changes, e.g. stored preferences or the trace log can no longer be read.
- **MINOR** — new features that keep compatibility.
- **PATCH** — bug fixes and small adjustments.

To release a version, update `VERSION`, commit, and tag the commit with the same version:

```sh
git tag -a 1.0.0 -m "1.0.0"
git push --follow-tags
```

Pushing the tag deploys that version to GitHub Pages and publishes its [container images](#container-images).

### GitHub Pages

The [Deploy to GitHub Pages](.github/workflows/pages.yml) workflow runs on every `X.Y.Z` tag. It:

1. fails if the tag does not match `VERSION` in `sw.js`, so a release can never ship with a stale offline cache;
2. publishes only the app files (no `README.md` or `tools/`);
3. deploys with the official Pages actions, pinned to commit SHAs and with the minimum permissions needed.

To redeploy an existing version, run the workflow manually (**Actions → Deploy to GitHub Pages → Run workflow**) and choose the version tag in **Use workflow from**. Runs from a branch are rejected.

One-time setup in the repository:

1. **Settings → Pages → Build and deployment → Source:** select **GitHub Actions**.
2. **Settings → Environments → github-pages → Deployment branches and tags:** add a **tag** rule `*.*.*`. By default the environment only allows the default branch, so deployments from tags are rejected until this rule exists.

The app will be available at `https://<user>.github.io/<repo>/`. All paths are relative, so it works from a subpath.

### Container images

The [Publish container image](.github/workflows/publish-image.yml) workflow builds the image and pushes it to two registries:

- GitHub Container Registry: [`ghcr.io/kijart/safe-mark-doc`](https://github.com/kijart/safe-mark-doc/pkgs/container/safe-mark-doc)
- Docker Hub: [`docker.io/kijart/safe-mark-doc`](https://hub.docker.com/r/kijart/safe-mark-doc)

Both registries get the same tags:

| Tag      | Example  | Published on           | Points to                                          |
| -------- | -------- | ---------------------- | -------------------------------------------------- |
| `latest` | `latest` | every push to `master` | the latest `master`, which may not be released yet |
| `X.Y.Z`  | `1.1.0`  | every `X.Y.Z` tag      | that exact version; never changes                  |
| `X.Y`    | `1.1`    | every `X.Y.Z` tag      | the latest patch release of `X.Y`                  |
| `X`      | `1`      | every `X.Y.Z` tag      | the latest minor or patch release of `X`           |

For a stable deployment, use `X.Y.Z` or `X`; `latest` follows development.

Every tag is a multi-architecture image, so Docker and Podman pull the right variant automatically:

| Platform       | Typical hardware                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `linux/amd64`  | Most PCs and servers (Intel, AMD)                                                                 |
| `linux/arm64`  | Apple Silicon (through Docker Desktop or Podman), Raspberry Pi 4/5 with a 64-bit OS, AWS Graviton |
| `linux/arm/v7` | Raspberry Pi 2/3/4 with a 32-bit OS                                                               |

On every run, the workflow:

1. fails if a version tag does not match `VERSION` in `sw.js`, like the Pages workflow;
2. builds the image and runs a smoke test (the container starts, passes its health check and serves the app) before pushing anything;
3. pushes every platform with OCI labels and annotations (source, version, revision, license), using actions pinned to commit SHAs.

One-time setup in the repository:

1. Create a Docker Hub [access token](https://docs.docker.com/security/for-developers/access-tokens/) with **Read & Write** permission.
2. **Settings → Secrets and variables → Actions:** add the variable `DOCKERHUB_USERNAME` (your Docker Hub user, on the **Variables** tab) and the secret `DOCKERHUB_TOKEN` (the token, on the **Secrets** tab).
3. After the first run, open the package on GitHub (**Packages → safe-mark-doc → Package settings**) and change its visibility to **Public**, so the image can be pulled without logging in. GHCR uses the workflow's `GITHUB_TOKEN`, so it needs no secret.

## Project structure

```text
.
├── index.html             # App shell
├── styles.css             # Styles (light/dark themes)
├── app.js                 # UI, file loading, export, trace log
├── sw.js                  # Service worker: offline cache and share target
├── manifest.webmanifest   # PWA manifest
├── LICENSE                # MIT license (also published with the app)
├── js/
│   ├── watermark.js       # Watermark rendering engine (canvas)
│   ├── redact.js          # Redaction: cover, blur, pixelate
│   ├── pdf-writer.js      # Minimal PDF writer (one JPEG per page)
│   └── i18n.js            # UI strings and language handling
├── icons/                 # PWA icons and favicon
├── tools/
│   └── make-icons.mjs     # Regenerates the PNG icons
├── Dockerfile             # Container image (Docker/Podman)
├── compose.yaml           # Runs the container with Compose
├── container/
│   └── nginx/             # Mirrors /etc/nginx/ in the image
│       ├── conf.d/default.conf             # Server: caching, CSP, health check
│       └── snippets/security-headers.conf  # Headers shared by every location
├── .github/
│   ├── dependabot.yml     # Weekly updates for actions and the base image
│   └── workflows/
│       ├── pages.yml          # Deploys version tags to GitHub Pages
│       └── publish-image.yml  # Publishes container images to GHCR and Docker Hub
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
