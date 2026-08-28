# Tax Evidence Pack

A private desktop evidence binder for sole traders. It keeps receipts, invoice PDFs
and reimbursement proof alongside their tax-year context, preserves original files
with SHA-256 fingerprints, flags missing support, and exports a PDF index plus
original-file ZIP for review.

## Run locally

```sh
npm install
npm run dev          # browser layout preview
npm run tauri dev    # installed-app workflow
npm test
npm run build
npm run build:site   # static landing site → dist/site
```

The desktop vault uses a passphrase-derived AES-256-GCM key. There is no cloud sync,
telemetry, OCR, bank connection, tax calculation, or filing. Keep your own backup and
check the tax-record rules relevant to you.

## Install and release

The landing site detects the OS and reads a same-origin `/latest.json` generated during
`npm run build:site`; the build reads GitHub's release API server-side, so no browser
request is made to GitHub's non-CORS release-download redirect. Release builds run from
`.github/workflows/release.yml` on a `v*` tag and publish the same full manifest,
including every platform asset, SHA-256 hash, and available signature URL. Builds are unsigned:
macOS users should right-click → Open initially; Windows users should verify the
published checksum before approving the publisher warning. One-line installers are at
`/install.sh` and `/install.ps1` on the deployed landing site.

Tax Evidence Pack Plus is a $29 one-time license sold by Sociobot/Dodo. It never gates
core evidence export or access to existing data. See `/privacy` and `/terms`.
