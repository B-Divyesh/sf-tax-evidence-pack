# Tax Evidence Pack — repair handoff

## Status: ready to release

**Implementation SHA:** `eef6d4a97e86e5d906e6cbd1ba4f2b1e28c19bb6` (tag `v0.1.7`).
The documentation SHA is the commit that follows this handoff update.

Tax Evidence Pack is a private desktop binder for sole traders who need receipts,
invoices, and reimbursement proof ready for an accountant. The first action is
**Try it with sample data**. It opens a populated, isolated review binder.

## What changed

- Added `.factory/claims.json` with eight observable, tagged outcome tests.
  They cover one-click sample data, demo isolation, ZIP export, offline reload,
  release metadata, encryption, SHA-256 fingerprints, and original-byte export.
- Added `/demo` and desktop **Load sample project**. The browser demo has five
  realistic 2025 evidence records, a persistent sample banner, reset, start-for-real,
  ZIP export, and a `demo:tax-evidence-pack:records` storage namespace. It never reads
  or writes real binder keys.
- Replaced the broken fixed service-worker list with a build-time generator that
  precaches only emitted hashed assets. The live worker no longer requests the former
  `/site.css` or `/release.css` 404 paths.
- Added release workflow coverage for macOS ARM and Intel, Windows, and Linux.
  The final workflow produces `.dmg`, `.msi`/`.exe`, `.AppImage`/`.deb`,
  `SHA256SUMS`, and `latest.json`; it now fails before publishing if any installer
  lacks a checksum. The Intel package uses GitHub's current `macos-15-intel` runner.
- Fixed published checksum metadata for filenames with spaces, aligned package, Cargo,
  Tauri, and site build versions, and made a build-time release token optional for
  reliable site metadata generation without putting a token in the output.
- Completed the site skeleton and small QA fixes: legal routes, titles/metadata,
  real 404, CSP headers, sitemap/robots, touch targets, skip link, mobile first screen,
  and a checksum-aware same-origin download manifest.

## Current release and consumer check

- Published release: [v0.1.7](https://github.com/B-Divyesh/sf-tax-evidence-pack/releases/tag/v0.1.7)
- GitHub Actions: [run 34016064824](https://github.com/B-Divyesh/sf-tax-evidence-pack/actions/runs/34016064824)
  — clean verification, macOS ARM, macOS Intel, Windows, Linux, and release jobs all passed.
- `latest.json` is `published: true`, version `0.1.7`, contains macOS, Windows, and
  Linux installers, and has a 64-character SHA-256 for every asset.
- Downloaded `Tax Evidence Pack_0.1.7_amd64.deb`; its SHA-256 matched `SHA256SUMS`:
  `c4e319994e010b50dc0dadc60e9c28d1eff316eba951a79c234eda795519c942`.
  Extracted it into a fresh temporary consumer directory and launched the installed
  desktop executable under an isolated X display; it remained running for 8 seconds.

## Verification

From the final checkout:

```sh
npm ci
npm test
npm run build
npm run build:site
npm run test:browser
cargo test --manifest-path src-tauri/Cargo.toml
npm audit --omit=dev --audit-level=high
```

The clean GitHub run executed `npm ci`, `npm test`, `npm run build`,
`npm run test:browser`, and `cargo test` before any package build. Locally, the full
suite, build, Rust tests, browser suite, and audit passed on `v0.1.7`.

Every declared command in `.factory/claims.json` also passed individually on `v0.1.7`:

- `@claim:sample-data`, `@claim:demo-isolation`, `@claim:sample-export`,
  `@claim:offline-demo`, and `@claim:release-manifest`
- `@claim:encrypted-vault`, `@claim:sha256-fingerprint`, and
  `@claim:original-file-export`

Fresh HTTPS checks at <https://tax-evidence-pack.sociobot.in> on 2026-09-06 found:

- `/`, `/demo`, `/demo/`, `/privacy`, `/terms`, `robots.txt`, `sitemap.xml`, and
  `sw.js` return 200. The deliberate `/not-a-real-page` returns 404 with the designed
  page.
- The live `latest.json` is `v0.1.7`, published, and checksum-complete. The worker
  lists only emitted assets and contains neither broken CSS precache path.
- Fresh desktop and 390 px phone contexts showed the job, audience, and **Try it with
  sample data** before scrolling. The button was visible above the fold; the phone had
  no horizontal overflow.
- The live demo showed its persistent sample banner, changed from five to six records,
  reset to five, preserved a sentinel real-data key, and left no demo key after reset.
  It made only same-origin requests.
- A fresh service-worker context reloaded `/demo/` offline successfully. No live
  console or page errors were observed. Axe found no serious or critical issue on the
  landing page.
- Lighthouse mobile: performance **96**, accessibility **100**, LCP **1774.6 ms**,
  CLS **0**. Initial landing JavaScript is 1.49 KB gzip (plus 0.40 KB module preload),
  CSS is 3.09 KB gzip, and the hero image is 104 KB.

## Earlier verification findings

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims file and claim coverage | Fixed with eight tagged outcome claims and final individual runs. |
| No sample demo or isolated storage | Fixed at `/demo` and in the desktop first-run screen; reset/isolation and export are tested live. |
| No published desktop release | Fixed by published v0.1.7 artifacts for all required platforms; Linux artifact checksum and launch were checked. |
| Service-worker CSS 404s | Fixed by emitted-asset precache generation; live worker inspection is clean and offline reload passes. |
| Missing route/accessibility/mobile details | Fixed and checked by Playwright, Axe, fresh phone/desktop contexts, legal-route checks, and Lighthouse. |
| GitHub CORS download failure | Fixed: browser fetches only same-origin `/latest.json`; installer navigation uses release asset URLs. |
| Cached malformed license verdict recovery | Fixed with defensive cache parsing and restore guidance. |
| Billing rate-limit evidence | The static repair does not change the billing endpoint; the earlier independent check recorded 30 accepted requests followed by 429 with `Retry-After`. Tenant isolation and persistence are not applicable because this product has no product backend. |

## Known limits and operator action

- **Billing registration remains an external dependency.** The $29 one-time Plus offer
  and checkout link remain public; its required public metadata is at
  `/work/.evidence/billing-offer.json`. Do not treat a checkout redirect as entitlement
  until the separate billing-registration operator registers and verifies the offer.
- Packages are intentionally unsigned. macOS signing/notarization needs
  `APPLE_CERTIFICATE` plus notarization credentials; Windows signing needs
  `WINDOWS_CERT_PFX`. No updater is shipped.
- This product intentionally has no cloud sync, OCR, bank sync, tax calculation, or
  tax filing. It is not tax advice or a guarantee of record-retention compliance.
- Vault passphrases cannot be recovered. Users need their own backup of evidence files
  and passphrase.
