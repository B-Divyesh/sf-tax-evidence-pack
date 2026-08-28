# Tax Evidence Pack — repair handoff

## Repair

The deployed candidate at `cc32761e20b56af583e42d981baad20bda8f2cb6` made a browser
`fetch()` request to GitHub's `releases/latest/download/latest.json` redirect. Chromium
reproduced the production failure on 2026-08-28:

```text
Access to fetch at 'https://github.com/B-Divyesh/sf-tax-evidence-pack/releases/latest/download/latest.json'
from origin 'https://tax-evidence-pack.sociobot.in' has been blocked by CORS policy.
```

`npm run build:site` now creates `dist/site/latest.json` using the GitHub Releases API
at build time. The browser only fetches the same-origin `/latest.json`; when there is
no release, rate limit, or network access during the build, the deployed manifest is a
valid unpublished state and the UI calmly links to the Releases page. There is no
browser-side GitHub metadata request or uncaught error.

The manifest carries the release version, direct asset links, SHA-256 values, signature
URLs/status, and all `.dmg`, `.msi`, `.exe`, `.AppImage`, and `.deb` artifacts. The
release workflow now emits this fuller schema alongside `SHA256SUMS`; the site and both
one-line installers read the same-origin manifest before navigating/downloading the
GitHub asset. The service worker is versioned to v2 and caches the manifest and runtime
same-origin shell for a subsequent offline load.

## Verification

```sh
npm ci && npm test && npm run build:site  # exact work-order command: 4 unit/integration tests passed
npm run test:browser                      # 2 Playwright tests passed
npm run build                             # Tauri web build passed
cargo check --manifest-path src-tauri/Cargo.toml  # passed
```

Focused coverage includes a mock GitHub release API integration test that verifies every
platform artifact, checksum, and signature URL is kept; a Chromium cold-load regression
test that permits only a same-origin manifest request and records zero console/page
errors; mobile viewport, keyboard skip-link, service-worker update/offline reload, and
privacy/no-third-party-request assertions. The browser suite also runs axe and reports
zero serious or critical violations.

`verify-url.sh` against the built local static site reported `200`, zero browser errors,
title/lang/one h1/main/alt text all present, and 636 ms load time. Post-deploy
`verify-url.sh https://tax-evidence-pack.sociobot.in` reported HTTPS `200`, **zero**
console/page errors, title/lang/one h1/main/alt text all present, and 1288 ms load time.
The live `/latest.json` is `200 application/json`, same-origin, and currently contains
the valid `published: false` state because no GitHub Release exists yet. Mobile Lighthouse
on the deployed URL scored **100 Performance**, **100 Accessibility**, LCP **1363.9 ms**,
and CLS **0**. The built initial JS is 1.69 KB gzip, CSS is 2.17 KB gzip, and the hero
image remains 104 KB.

## Release and operator action

Repair release `v0.1.1` is aligned across `package.json`, Cargo, and Tauri config and
was pushed with the repair. Its GitHub Actions run is queued on hosted-runner capacity:
<https://github.com/B-Divyesh/sf-tax-evidence-pack/actions/runs/33158727796>. Once it
finishes, rerun `npm run build:site` and deploy `dist/site` to replace the fallback with
the release's real same-origin manifest; then download one asset and compare its hash
with `SHA256SUMS`. Builds remain intentionally unsigned: signing/notarization requires
`APPLE_CERTIFICATE` (plus notarization credentials) and `WINDOWS_CERT_PFX`. No updater
is shipped because the app does not check for updates.

## Known scope

There is deliberately no cloud sync, OCR, bank connection, tax calculation, or tax
filing. The Plus checkout needs the factory product registration before a real purchase
can succeed. Vault passphrases cannot be recovered; users need an external backup.
