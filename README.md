# Safe Mark Doc <!-- omit in toc -->

[![License: MIT](https://img.shields.io/github/license/kijart/safe-mark-doc)](LICENSE)
[![GitHub Container Registry](https://img.shields.io/badge/ghcr-images-success.svg?logo=GitHub)](https://github.com/users/kijart/packages/container/package/safe-mark-doc)
[![Docker Hub](https://img.shields.io/badge/dockerhub-images-success.svg?logo=Docker)](https://hub.docker.com/r/kijart/safe-mark-doc)

[![Dependabot Updates](https://github.com/kijart/safe-mark-doc/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/kijart/safe-mark-doc/actions/workflows/dependabot/dependabot-updates)
[![Release Please](https://github.com/kijart/safe-mark-doc/actions/workflows/release-please.yml/badge.svg)](https://github.com/kijart/safe-mark-doc/actions/workflows/release-please.yml)
[![Deploy to GitHub Pages](https://github.com/kijart/safe-mark-doc/actions/workflows/pages.yml/badge.svg)](https://github.com/kijart/safe-mark-doc/actions/workflows/pages.yml)
[![Publish container image](https://github.com/kijart/safe-mark-doc/actions/workflows/publish-image.yml/badge.svg)](https://github.com/kijart/safe-mark-doc/actions/workflows/publish-image.yml)

An offline-first Progressive Web App that adds tamper-resistant watermarks to sensitive documents — ID cards, passports, contracts, invoices — before sharing them.

Everything runs in the browser. There is no server, no upload and no tracking: files never leave the device.

## Table of contents <!-- omit in toc -->

- [Why](#why)
- [Features](#features)
- [Getting started](#getting-started)
  - [With Docker or Podman](#with-docker-or-podman)
- [Deployment](#deployment)
  - [Versioning](#versioning)
  - [GitHub Pages](#github-pages)
  - [Container images](#container-images)
- [Project structure](#project-structure)
- [Development](#development)
  - [Regenerating icons](#regenerating-icons)
  - [Content Security Policy](#content-security-policy)
- [Privacy](#privacy)
- [Accessibility](#accessibility)
- [Browser support](#browser-support)
- [Third-party software](#third-party-software)
- [AI assistance](#ai-assistance)
- [Contributing](#contributing)
- [License](#license)

## Why

Sending a plain copy of an ID to a landlord, a hotel or an online service makes identity fraud easy. A visible watermark that states **who** the copy is for, **when** it was made and **what** it may be used for makes the copy far less useful to anyone else. Safe Mark Doc makes that quick and private.

## Features

- **Inputs** — images (JPG, PNG, WebP, …) and PDFs, including password-protected PDFs. Multiple files and multi-page documents in one go.
- **Watermark content** — custom text, optional date (in a choice of formats, with or without the time) and an optional unique trace code per copy. A local log records which code was given to whom, so a leaked copy can be traced back.
- **Hard-to-remove patterns** — wavy text with per-letter variation, alternating filled/outlined rows, guilloché-style background mesh and microtext.
- **Redaction** — cover, blur or pixelate sensitive areas by dragging over the preview or with the keyboard, page by page.
- **Safe output** — the result is flattened (rasterized) and stripped of EXIF metadata. Export to PDF, JPG or PNG.
- **Sharing** — native share sheet (Web Share API) and Android _share target_, so files can be sent to the app straight from other apps. Sharing while the app is open reuses its window.
- **Open with** — once installed on a computer (Chrome, Edge), PDFs and images can be opened with the app from the file manager.
- **Works offline** — installable; after the first visit everything is cached by a service worker.
- **Localized** — English and Spanish UI (auto-detected from the browser, English otherwise), with light, dark and automatic themes. New languages are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md).

## Getting started

There is no build step and no dependencies to install. Serve the `src/` folder over HTTP — service workers require `localhost` or HTTPS:

```sh
python3 -m http.server 8080 -d src
# or
npx serve src
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

The container only serves the static files — documents are still processed in the browser and never reach it. It also:

- runs as a non-root user, with a read-only filesystem and no Linux capabilities (Compose sets this up);
- sends the app's [Content Security Policy](#content-security-policy) as a header too, adding `frame-ancestors 'none'` (so the app can't be embedded in other sites), plus other security headers;
- serves `index.html`, `sw.js` and `manifest.webmanifest` with `Cache-Control: no-cache`, so a new version is picked up right away;
- exposes `/healthz` for the built-in health check.

The port is bound to `127.0.0.1` because service workers — offline mode, installing the app and the share target — only work on `localhost` or over HTTPS. To use it from other devices, put an HTTPS reverse proxy in front of the container rather than publishing plain HTTP.

## Deployment

The app is deployed to GitHub Pages and published as a container image automatically when a version is released (see below). It can also be hosted on any static host with HTTPS (Netlify, Cloudflare Pages, …): upload the app files listed in [Project structure](#project-structure).

> **Important:** every release must bump `VERSION` in `src/sw.js` so installed clients pick up the new cache. [Release Please](#versioning) does it, so it is never edited by hand.

The service worker serves every file from the cache of its own version, so a page never mixes files from two releases. A new version downloads in the background and waits: open pages show "A new version is available" with an **Update** button, which switches to it and reloads. Until then, the version in use keeps working, also offline.

### Versioning

The app follows [Semantic Versioning](https://semver.org/). The current version is `VERSION` in `src/sw.js`, which also names the offline cache (`safe-mark-doc-v<version>`) and is shown in the page footer:

- **MAJOR** — incompatible changes, e.g. stored preferences or the trace log can no longer be read.
- **MINOR** — new features that keep compatibility.
- **PATCH** — bug fixes and small adjustments.

Releases are automated with [Release Please](https://github.com/googleapis/release-please-action), which reads the [Conventional Commits](https://www.conventionalcommits.org/) on `master`:

- a `!` after the type (`feat!:`, `fix!:`…) or a `BREAKING CHANGE:` footer at the end of the commit message bumps **MAJOR**;
- `feat:` bumps **MINOR**;
- `fix:`, `perf:` and `revert:` bump **PATCH**;
- the rest (`refactor`, `style`, `docs`, `test`, `build`, `ci`, `chore`) are hidden from the changelog and don't make a release on their own; they ship with the next one.

Every push to `master` updates a release PR (`chore(release): x.y.z`) that bumps `VERSION` in `src/sw.js`, `version.txt` and `.release-please-manifest.json`, and adds the new section to [CHANGELOG.md](CHANGELOG.md). Merging it tags the commit `x.y.z` and creates the GitHub release with those notes. The tag deploys that version to GitHub Pages and publishes its [container images](#container-images).

To release a specific version instead, add a `Release-As: x.y.z` footer to a commit.

The configuration is in `release-please-config.json`, where `changelog-sections` sets which types show up in the changelog (and so make a release).

One-time setup in the repository (tags pushed with the default `GITHUB_TOKEN` would not trigger the deploy workflows, so the [Release Please](.github/workflows/release-please.yml) workflow uses a GitHub App token):

1. Create a [GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app) with no webhook and the repository permissions **Contents: Read and write** and **Pull requests: Read and write**, generate a private key, and install the app on this repository.
2. **Settings → Secrets and variables → Actions:** add the variable `RELEASE_APP_CLIENT_ID` (the app's client ID) and the secret `RELEASE_APP_PRIVATE_KEY` (the private key).

### GitHub Pages

The [Deploy to GitHub Pages](.github/workflows/pages.yml) workflow runs on every `x.y.z` tag. It:

1. publishes only the app files (no `README.md` or `tools/`);
2. deploys with the official Pages actions, pinned to commit SHAs and with the minimum permissions needed.

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
| `x.y.z`  | `1.1.0`  | every `x.y.z` tag      | that exact version; never changes                  |
| `x.y`    | `1.1`    | every `x.y.z` tag      | the latest patch release of `x.y`                  |
| `x`      | `1`      | every `x.y.z` tag      | the latest minor or patch release of `x`           |

For a stable deployment, use `x.y.z` or `x`; `latest` follows development. Pushes to `master` that only change files outside the image (README, `tools/`, other workflows) do not publish a new `latest`.

Every tag is a multi-architecture image, so Docker and Podman pull the right variant automatically:

| Platform       | Typical hardware                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `linux/amd64`  | Most PCs and servers (Intel, AMD)                                                                 |
| `linux/arm64`  | Apple Silicon (through Docker Desktop or Podman), Raspberry Pi 4/5 with a 64-bit OS, AWS Graviton |
| `linux/arm/v7` | Raspberry Pi 2/3/4 with a 32-bit OS                                                               |

On every run, the workflow:

1. builds the image and runs a smoke test (the container starts, passes its health check and serves the app) before pushing anything;
2. pushes every platform with OCI labels and annotations (source, version, revision, license), an SBOM and a build provenance attestation, using actions pinned to commit SHAs.

One-time setup in the repository:

1. Create a Docker Hub [access token](https://docs.docker.com/security/for-developers/access-tokens/) with **Read & Write** permission.
2. **Settings → Secrets and variables → Actions:** add the variable `DOCKERHUB_USERNAME` (the Docker Hub user name, on the **Variables** tab) and the secret `DOCKERHUB_TOKEN` (the token, on the **Secrets** tab).
3. After the first run, open the package on GitHub (**Packages → safe-mark-doc → Package settings**) and change its visibility to **Public**, so the image can be pulled without logging in. GHCR uses the workflow's `GITHUB_TOKEN`, so it needs no secret.

## Project structure

```text
.
├── src/                   # The app, published as is (site root)
│   ├── index.html         # App shell
│   ├── sw.js              # Service worker: offline cache and share target
│   ├── manifest.webmanifest  # PWA manifest
│   ├── css/
│   │   └── styles.css     # Styles by Atomic Design level (light/dark themes)
│   ├── js/
│   │   ├── app.js         # UI, file loading, export, trace log
│   │   ├── watermark.js   # Watermark rendering engine (canvas)
│   │   ├── redact.js      # Redaction: cover, blur, pixelate
│   │   ├── pdf-writer.js  # Minimal PDF writer (one JPEG per page)
│   │   └── i18n.js        # UI strings and language handling
│   ├── icons/             # PWA icons and favicon
│   ├── screenshots/       # Shown by the browser when installing the app
│   └── vendor/
│       └── pdfjs/         # pdf.js 4.10.38, used to read PDFs
├── LICENSE                # MIT license (also published with the app)
├── SECURITY.md            # How to report a vulnerability privately
├── CONTRIBUTING.md        # How to contribute: translations, commits, pull requests
├── CHANGELOG.md           # Release notes, written by Release Please
├── release-please-config.json     # Release Please configuration
├── .release-please-manifest.json  # Current version, updated by Release Please
├── version.txt            # Current version, updated by Release Please
├── tools/
│   └── make-icons.mjs     # Regenerates the PNG icons
├── Dockerfile             # Container image (Docker/Podman)
├── compose.yaml           # Runs the container with Compose
├── container/
│   └── nginx/             # Mirrors /etc/nginx/ in the image
│       ├── conf.d/default.conf             # Server: caching, CSP, health check
│       └── snippets/security-headers.conf  # Headers shared by every location
└── .github/
    ├── dependabot.yml     # Weekly updates for actions and the base image
    └── workflows/
        ├── pages.yml          # Deploys version tags to GitHub Pages
        ├── publish-image.yml  # Publishes container images to GHCR and Docker Hub
        └── release-please.yml # Opens release PRs; merging one tags and releases the version
```

## Development

### Regenerating icons

The PNG icons are generated without external dependencies (Node.js 18+):

```sh
node tools/make-icons.mjs
```

### Content Security Policy

The policy is a `<meta http-equiv="Content-Security-Policy">` in `src/index.html`, so it also applies on GitHub Pages and other static hosts that send no CSP. It only allows the app's own origin, without inline styles or scripts.

The container repeats it as a header in `container/nginx/conf.d/default.conf`, which adds `frame-ancestors 'none'` (not allowed in a `<meta>`) and also covers the service worker and the pdf.js worker. Keep both copies the same.

The small inline script in `src/index.html` (theme and language before the first paint) is allowed by its hash. Whenever it changes, recompute the hash and update it in both places:

```sh
python3 -c "import re,hashlib,base64;s=re.search(r'<script>(.*?)</script>',open('src/index.html').read(),re.S).group(1);print(base64.b64encode(hashlib.sha256(s.encode()).digest()).decode())"
```

Without inline styles allowed, set styles from JavaScript (`element.style`) or in `src/css/styles.css`, not with `style="…"` attributes.

## Privacy

- Files are processed locally with the Canvas API; nothing is sent over the network. The [Content Security Policy](#content-security-policy) makes the browser block connections to any other origin.
- Preferences and the trace log are stored in the browser's `localStorage` only (the log keeps the latest 200 entries and can be cleared from the UI). The log saves the code, purpose, date and number of files; the exported file name is saved only when **Save the file name** is checked.
- Exported files get a neutral name (`document-watermark-<code>.pdf`), because the original one often contains a person's name; it is kept only when **Keep the original file name** is checked.
- Exported files are re-encoded from pixels, so original metadata (EXIF, PDF properties, hidden text layers) is not carried over.
- Security problems should be reported privately, as described in [SECURITY.md](SECURITY.md).

## Accessibility

- Every control can be reached and used with the keyboard, including the preview, which shows its shortcuts while it has keyboard focus.
- Redaction shortcuts, with the preview focused:

  | Key                 | Action                                                     |
  | ------------------- | ---------------------------------------------------------- |
  | Enter               | Add an area in the chosen mode (Cover, Blur or Pixelate)   |
  | Space / Shift+Space | Select the next / previous area                            |
  | Arrows              | Move the selected area                                     |
  | Shift+Arrows        | Resize the selected area                                   |
  | Delete              | Remove the selected area                                   |
  | Esc                 | Clear the selection                                        |

- For screen readers, the preview is labelled, described by the redaction hint and the shortcuts, and announces which area is selected.
- Loading and export progress, results and page changes are announced politely, and errors as alerts. The color swatches expose which one is selected.

## Browser support

Any modern evergreen browser (Chrome, Edge, Firefox, Safari). Large images are downscaled to stay within mobile canvas limits (notably iOS Safari). The share target is only available when the app is installed on Android, and opening files from the file manager when it is installed with Chrome or Edge on a computer.

## Third-party software

- [pdf.js](https://github.com/mozilla/pdf.js) 4.10.38 — Apache License 2.0. See `src/vendor/pdfjs/LICENSE`.

## AI assistance

This project was developed with the help of AI coding assistants, used to generate and refactor code. All code has been manually reviewed and tested; the design, decisions and responsibility remain with the author.

## Contributing

Contributions are welcome, especially translations: new languages or fixes to existing strings. [CONTRIBUTING.md](CONTRIBUTING.md) explains how to add a language, the rules for strings and the commit conventions that drive releases.

## License

[MIT](LICENSE). Third-party code under `src/vendor/` keeps its own license.
