# Contributing

Contributions are welcome, and translations are the easiest way to help: a new language, or a fix to a string that reads wrong. Bug reports and small fixes are welcome too. For larger changes, please open an issue first to agree on the approach.

Security problems are not reported in issues: see [SECURITY.md](SECURITY.md).

## Running the app locally

There is no build step and no dependencies to install. Serve the `src/` folder over HTTP (service workers require `localhost` or HTTPS):

```sh
python3 -m http.server 8080 -d src
```

Then open <http://localhost:8080>. The service worker serves every file from its cache, so changes don't show on a normal reload: in the browser's developer tools, check **Bypass for network** (Chrome: **Application → Service workers**) while working, or open the app in a private window.

## Translations

All the UI text is in [`src/js/i18n.js`](src/js/i18n.js): one dictionary per language in `MESSAGES`, with the same keys in every language. English (`en`) is the base language: a missing string falls back to English, and the static text in `src/index.html` (shown before the script runs) is in English.

### Fixing a string

Find the key in the language's dictionary in `MESSAGES` and change only its text. Check the result in the app by choosing the language in the selector at the top.

### Adding a language

1. In `src/js/i18n.js`:
   1. Copy the `en` dictionary in `MESSAGES` under the new language code (two letters, ISO 639-1, e.g. `fr`) and translate every string.
   2. Add the code to `LANGUAGES`.
   3. Add its locale to `LOCALES` (e.g. `fr: 'fr-FR'`), used to format dates and numbers.
2. In `src/index.html`, add a matching `<option>` to the language selector (`<option value="fr">FR</option>`).

The app starts in the first of the browser's preferred languages that is in `LANGUAGES`, and in English otherwise; the selector overrides it.

### Rules for strings

- **Every key** in `MESSAGES.en` exists in the new language, and no others.
- **Placeholders** such as `{count}`, `{name}`, `{n}`, `{total}`, `{error}`, `{code}` or `{mode}` stay as they are (not translated); they can move within the sentence.
- **Markup**: some strings contain HTML (`<strong>`, `<br>`, `<small>`, `&nbsp;`), because they are shown with `data-i18n-html`. Keep the same tags and add no new ones: only this kind of fixed, trusted markup is allowed there.
- **Plurals**: keys ending in `.one` and `.other` are used for exactly 1 and for any other number.
- **File names**: `file.document` and `file.suffix` become part of the exported file names (`document-watermark-<code>.pdf`), so they stay short, lowercase, without spaces or accents.
- **Length**: buttons and chips have little room on a phone; a translation much longer than the English one may need a shorter wording.
- **Tone**: the app speaks to the user directly and plainly, as in the English and Spanish texts.

## Commits and pull requests

1. Fork the repository and create a branch from `master` (e.g. `feat/i18n-french`).
2. Keep each pull request to one change.
3. Open the pull request against `master`, describing what changes and how it was checked. For UI changes, a screenshot helps.

Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/): a single line, in English, in the imperative (`fix(i18n): shorten the export button in German`). [Release Please](README.md#versioning) reads them to decide the next version and write the [changelog](CHANGELOG.md):

| Type | Use | Release |
| --- | --- | --- |
| `feat` | New feature (e.g. `feat(i18n): add French`) | minor (`x.Y.0`) |
| `fix` | Bug fix (e.g. `fix(i18n): correct the German date label`) | patch (`x.y.Z`) |
| `perf` | Performance improvement | patch |
| `revert` | Reverts an earlier commit | patch |
| `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore` | Changes that users don't see | none on their own |

A breaking change adds `!` after the type (`feat!: …`) and makes a major release (`X.0.0`).

## License

Contributions are licensed under the project's [MIT License](LICENSE).
