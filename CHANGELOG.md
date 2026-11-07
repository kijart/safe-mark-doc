# Changelog

## [1.4.0](https://github.com/kijart/safe-mark-doc/compare/1.3.0...1.4.0) (2026-11-07)


### Features

* **a11y:** announce progress and errors and expose the selected color ([2d3dea5](https://github.com/kijart/safe-mark-doc/commit/2d3dea59ed829a8d71c1aaf1a91e4b886d63cac0))


### Bug Fixes

* **i18n:** use English as the base language and a neutral offline response ([aa4964c](https://github.com/kijart/safe-mark-doc/commit/aa4964cfe6a3ac5145caab12b80552e6f841d647))

## [1.3.0](https://github.com/kijart/safe-mark-doc/compare/1.2.0...1.3.0) (2026-11-05)


### Features

* **a11y:** edit redaction areas with the keyboard ([ac35728](https://github.com/kijart/safe-mark-doc/commit/ac357287f4cb4c75c1db2098293f2280b5193125))
* **log:** make saving the file name in the copy log optional ([6c43ff7](https://github.com/kijart/safe-mark-doc/commit/6c43ff7c04f9c4272a73b3afa14c116f259a9a6a))


### Bug Fixes

* let the latest file load win over earlier ones ([ae9b362](https://github.com/kijart/safe-mark-doc/commit/ae9b362276096965df35b6f6063a9d1a84447c3e))
* **share:** clear shared files on every start and survive failed ones ([c528e15](https://github.com/kijart/safe-mark-doc/commit/c528e1582f65d8911ed824d69a4f4ec839b66785))


### Performance

* **load:** decode large images at their final size ([b4ad4bc](https://github.com/kijart/safe-mark-doc/commit/b4ad4bc40302f29d1cfb6ccc68417835a9ae345c))
* **preview:** cancel renders of pages no longer shown ([d46a6da](https://github.com/kijart/safe-mark-doc/commit/d46a6dac0b7e65b8545700d8b063a855a4b2781c))

## [1.2.0](https://github.com/kijart/safe-mark-doc/compare/1.1.0...1.2.0) (2026-11-04)


### Features

* show the app version in the footer ([1a00413](https://github.com/kijart/safe-mark-doc/commit/1a004138e2c1741af4c8d6bf8857658d3add2b92))


### Bug Fixes

* ask for PDF passwords in a masked dialog ([6c453bd](https://github.com/kijart/safe-mark-doc/commit/6c453bdd70526e78bdefd34c78b56663d7b13ab3))
* **redact:** keep blur and pixelate irreversible on thin text strips ([6c1b2c0](https://github.com/kijart/safe-mark-doc/commit/6c1b2c0731939f59297517a3331fe26b25f646b8))
* **sw:** serve one version at a time and prompt before updating ([a6c99bb](https://github.com/kijart/safe-mark-doc/commit/a6c99bbc93e1006f10fc699d98b7ba7f4ebfcd81))


### Refactoring

* clean up comments for clarity ([cdf1148](https://github.com/kijart/safe-mark-doc/commit/cdf114819a76043c310b7fb6749bd3ba6f07ffb9))


### Documentation

* add AI assistance section to README ([403d879](https://github.com/kijart/safe-mark-doc/commit/403d87999b6418c417b134a8d5d57d50f4d9a536))
* group README badges and add the Release Please badge ([4c9f6c3](https://github.com/kijart/safe-mark-doc/commit/4c9f6c313503b32827bc1f37878df7df53b10f95))


### CI

* automate releases with release-please ([c21df16](https://github.com/kijart/safe-mark-doc/commit/c21df16429fa0339827fdc5ea1c1b10c87c4919c))

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
