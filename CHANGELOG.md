# Changelog

## [1.1.0](https://github.com/kijart/safe-mark-doc/compare/1.0.0...1.1.0) (2026-10-28)


### Performance

* render PDF and image pages on demand ([02b5910](https://github.com/kijart/safe-mark-doc/commit/02b5910daa36f773a74ed94289035a88e9218b4a))


### Refactoring

* move the app into src/ with css/ and js/ folders ([d3fba86](https://github.com/kijart/safe-mark-doc/commit/d3fba868ad40bca3d381c75772d1cf499400a9d1))
* **css:** organize styles by Atomic Design levels ([e34388b](https://github.com/kijart/safe-mark-doc/commit/e34388b4a9e179df18ee607acc793db92814cf8c))


### Styles

* **css:** align the log panel with the bottom of the controls ([a561375](https://github.com/kijart/safe-mark-doc/commit/a56137520798bdaa97605e89bf7a21d6c74eab09))


### Documentation

* add badges on README ([e70fddc](https://github.com/kijart/safe-mark-doc/commit/e70fddc1fc49a2b4c5c98935ab47723531c58f39))
* update Table of Contents in README for improved navigation ([bf2bc71](https://github.com/kijart/safe-mark-doc/commit/bf2bc71d317829cf76206950695f469d8057881c))


### CI

* add GitHub Actions workflow for automated release creation ([9a633ee](https://github.com/kijart/safe-mark-doc/commit/9a633eebda00906654e22dd4ada9235f646f5884))

## 1.0.0 (2026-10-25)


### Features

* initial import of Safe Mark Doc PWA ([6a325a8](https://github.com/kijart/safe-mark-doc/commit/6a325a8d8298228758842986c3bf8502e7ef2bc8))
* redesign app icon as a protected, watermarked document ([a1a55d3](https://github.com/kijart/safe-mark-doc/commit/a1a55d36e2aa08a5312da9dec4d66f396ecc7aac))
* add Docker/Podman container image and Compose setup ([43dd385](https://github.com/kijart/safe-mark-doc/commit/43dd385da5c9fcd3150163e4d237ccbc7e38c0b4))
* add source code link to GitHub in footer ([ba42812](https://github.com/kijart/safe-mark-doc/commit/ba42812f4d57dde4e060faf45f5d3c88749ac5a9))


### Documentation

* update version tag format in README for consistency ([c2a5aff](https://github.com/kijart/safe-mark-doc/commit/c2a5aff706a819624d87ba72ca58ff7e587529e7))


### CI

* deploy version tags to GitHub Pages ([6f5b05c](https://github.com/kijart/safe-mark-doc/commit/6f5b05c75d31d8df240293d8a6c280dcadf6b9c3))
* publish container images workflow to GHCR and Docker Hub ([7b55955](https://github.com/kijart/safe-mark-doc/commit/7b559555270bd30d0aec598f8a8ab1389dc20000))
* add Dependabot for GitHub Actions and the base image ([459ce62](https://github.com/kijart/safe-mark-doc/commit/459ce62d7a0fc0f567a36b8f5d84fbcb47b63d83))
* publish latest image only when image files change ([6911bf0](https://github.com/kijart/safe-mark-doc/commit/6911bf0376cf71bdf301c31d71f76e9ec45a40af))
* attach SBOM and provenance to container images ([3371090](https://github.com/kijart/safe-mark-doc/commit/33710908eb1017260bb1aba6a92b2338a38cb8ca))


### Chores

* adopt semantic versioning starting at 1.0.0 ([e57a30e](https://github.com/kijart/safe-mark-doc/commit/e57a30e1540c38e1549b6875a4cd6cb4d8fae77e))
* add initial .gitignore file for OS and editor files ([666fb48](https://github.com/kijart/safe-mark-doc/commit/666fb488e710493de3f0316900c76380bbd25722))
