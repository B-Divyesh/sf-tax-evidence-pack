# Tax Evidence Pack

Tax Evidence Pack is a private desktop binder for sole traders who need receipts,
invoice PDFs, and reimbursement proof ready for an accountant. It keeps tax context
with each document, marks missing support, and exports a PDF review index with the
original files in a ZIP.

It is not tax advice, tax calculation software, a filing service, OCR, bank sync, or
cloud backup. Keep a separate backup and check the record-retention rules that apply
to you.

## Try the sample

Open `/demo` on the deployed site or choose **Try it with sample data**. The browser
demo starts with five realistic 2025 records and runs only in the
`demo:tax-evidence-pack:records` local-storage namespace. **Reset demo** removes that
key. The desktop app also has **Load sample project** on its first-run screen; it is a
read-only, in-memory preview.

## Run and test

```sh
npm ci
npm run dev                 # desktop UI preview
npm run tauri dev           # desktop app
npm test
npm run build               # dist/app
npm run build:site          # dist/site
npm run test:browser
cargo test --manifest-path src-tauri/Cargo.toml
```

The Tauri tests on Linux need desktop development packages. On Ubuntu install:

```sh
sudo apt-get update
sudo apt-get install -y libglib2.0-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev
```

Every public, testable claim is listed in [`.factory/claims.json`](.factory/claims.json).
Run each documented `test` command from a clean checkout. The browser claim tests use
only the demo route and bundled sample data.

## Release and deploy

Tagging `v*` starts `.github/workflows/release.yml`. It runs the quality checks and
builds unsigned macOS arm64/x64, Windows, and Linux artifacts. The workflow publishes
the installers, `SHA256SUMS`, and `latest.json` to the GitHub Release. The landing-site
build reads the latest release at build time and writes a same-origin `latest.json` to
`dist/site`.

Deploy only `dist/site` to the product static host. Its service worker is generated
after Vite builds, so its precache list contains the actual hashed files. The site uses
no analytics or third-party scripts. `/privacy` and `/terms` explain website license
storage and the local desktop vault.

Tax Evidence Pack Plus is an advertised $29 one-time Sociobot/Dodo license. It does
not gate core data access or export. The public checkout needs the factory billing
registration operator before purchases can be verified.

## License

MIT. See [LICENSE](LICENSE).
