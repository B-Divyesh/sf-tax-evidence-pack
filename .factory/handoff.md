# Tax Evidence Pack — handoff

## What shipped

- Tauri 2 desktop app with an encrypted local vault: AES-256-GCM encrypted originals
  and encrypted register metadata, passphrase-derived with PBKDF2-SHA256 (600,000
  iterations), no cloud upload and no telemetry.
- Import receipts/invoices/PDFs, assign tax year, category and transaction reference,
  record a missing-evidence marker, filter the register, and remove records with a
  specific confirmation.
- SHA-256 fingerprinting and a review export: a generated PDF index plus untouched,
  decrypted originals in a ZIP.
- Static product site in `dist/site` with OS-aware release lookup, privacy and terms,
  Service Worker shell cache, license restore/verification against Sociobot’s billing
  API, and checksummed `/install.sh` and `/install.ps1` installers.
- Tauri release workflow for x64/arm64 macOS, Windows, and Linux. It emits standard
  bundles, `SHA256SUMS`, and a `latest.json` release manifest.
- Product-specific dithered/halftone print system documented in `.factory/design.md`.
  The original generated binder asset is `assets/src/evidence-binder.png`; the shipped
  WebP is 104 KB. Prompt, date, model route and disclosure are recorded in that file.

## Verification

```sh
npm test                         # 3 tests passing
npm run build                    # app → dist/app
npm run build:site               # landing → dist/site
cargo check --manifest-path src-tauri/Cargo.toml
```

Lighthouse mobile on the built site: Performance **100**, Accessibility **100**, LCP
**1.66 s**, CLS **0**. `npx @axe-core/cli http://127.0.0.1:4173/` found **0
violations**. Initial JavaScript is 4 KB (gzip), CSS is 8 KB (gzip), and the LCP image
is 104 KB. The static page has title/lang/main/one h1/alt text and keyboard-visible
focus styles; it was also checked at the 390px layout.

## Release operator action

The `v0.1.0` tag is pushed and GitHub Actions has already completed the ARM macOS,
Windows, and Linux bundle jobs successfully. The final native Intel macOS runner is
waiting on GitHub's `macos-13` hosted-runner capacity, so the release publish job cannot
yet start. Once it runs, verify that the release contains `.dmg` (both Mac
architectures), `.msi` and `.exe`, `.AppImage` and `.deb`, `SHA256SUMS`, and
`latest.json`; download one asset and compare it with `SHA256SUMS`.

Builds are intentionally unsigned. For signed distribution, add the owner’s
`APPLE_CERTIFICATE` (and notarization credentials) and `WINDOWS_CERT_PFX` secrets, then
extend the workflow with the organization’s signing/notarization steps. Until then,
the site and README accurately disclose the macOS right-click → Open and Windows
unsigned-publisher flows.

## Known gaps / next steps

- There is no OCR, bank sync, category auto-classification, tax calculation, or return
  filing — all are deliberate non-goals from the brief.
- The Plus checkout URL uses the slug only and needs the factory’s product registration
  before a live purchase can succeed.
- Passphrases cannot be recovered; users should retain an external backup of the vault.
