# Independent verification — FAIL

**Candidate:** `29f830cfc21b6a5bb1a0e92108c6750f37623709` (`docs: record repair verification`)

**Live URL:** <https://tax-evidence-pack.sociobot.in>

**Verified:** 2026-08-28 UTC, from this clean candidate checkout. Product code was not changed.

## Release decision

**FAIL — release blocking defects remain.** The missing claims contract alone requires rejection. The deployed desktop application also cannot be installed, and the mandatory one-click sample-data demo does not exist.

## Required first checks

### Claims contract — BLOCKER

`.factory/claims.json` does not exist. Consequently there was no list of required claim tests to run from the demo entry point. An exploratory `npm test -- --grep @claim` also exited 1 because this Vitest invocation does not accept `--grep`; this is supplementary evidence only, as the absent manifest is already the failure.

There is no `.factory/demo.md`, no shipped sample data, no `demo:` storage namespace, and no `@claim:` tests. The landing page and README make unlisted, testable claims including encrypted local storage, no cloud upload, no telemetry, SHA-256 fingerprints, original-file preservation, and PDF/ZIP export. All are unlisted claims under the acceptance contract.

### Cold first read and demo — BLOCKER

Cold browser text on the live page says:

> “Your evidence, ready to review. Turn a year of receipts, invoices and reimbursement proof into a reviewable pack…”

This tells a sole trader broadly what the product does, but does not name the intended user on the first screen and does not give a usable first step. Its primary action is **“Download for your device”**. There is no **“Try it with sample data”** control (`0` matching controls in a fresh browser context), no persistent demo banner/reset/start-for-real controls, and neither `/demo` nor `?demo=1` enters a demo; both return the normal landing page. The required first-read/demo gate therefore fails.

## Tested checks

| Check | Result | Evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci`: 65 packages, 0 audit vulnerabilities. |
| Unit/integration tests | PASS, incomplete coverage | `npm test`: 4 tests in 2 files passed. Only helpers and release-manifest construction are covered. |
| Browser tests supplied | PASS, not representative | `npm run test:browser`: 2 tests passed against the local static server. They do not test demo mode, desktop importing/exporting, encryption, invalid input/recovery, or real deployment SW installation. |
| Exact repository build | PASS | `npm run build`: TypeScript + Vite production app build passed. |
| Landing-site build | PASS | `npm run build:site`: passed, initial JS 1.69 KB gzip and CSS 2.17 KB gzip. |
| Rust compile | PASS | `cargo check --manifest-path src-tauri/Cargo.toml`: passed. |
| Dependency audit | PASS | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities. |
| Live candidate identity | PASS | Live `assets/main-DKf8JhLA.js` SHA-256 `65f1c958…818e859e` and `main-CLhnjN2e.css` SHA-256 `d1aed283…317213f6` exactly match the candidate’s `npm run build:site` output. Live `latest.json` was generated at `2026-08-28T09:21:46.497Z`, immediately after the candidate. |
| Live cold load/privacy observation | PASS only as observation | HTTPS 200, no console/page errors; five first-load requests, all same-origin (`/`, image, JS, CSS, `/latest.json`). This does **not** certify the untested “no cloud upload” claim. |
| Accessibility smoke/axe | PARTIAL | Live page has `lang`, title, one h1, main, alt text, visible skip link/focus, no console errors, and 0 axe serious/critical findings in a fresh desktop context. At 390 px no horizontal overflow or browser errors. However the Restore button measures only 155.6 × 15 px and footer links only 14 px high: touch-target failure. |
| Lighthouse | Environment-limited | `lighthouse@12.8.2` could not complete because the supplied Playwright Chromium tab crashed under the Lighthouse launcher. The manual browser/a11y, response, and bundle checks above were completed; no Lighthouse score is claimed. |
| Reduced motion | PASS | Live CSS has a `prefers-reduced-motion: reduce` rule that disables transitions/animations. |
| PWA service worker/offline reload | FAIL | `sw.js` precaches `/site.css` and `/release.css`; both are live 404s. Cache `addAll()` therefore fails and the registration is discarded (`getRegistrations()` remained `[]` after 8 seconds). The supplied local browser test is a false positive because its local server has a different asset layout. |
| Response policies | FAIL | Live responses have HSTS, Referrer-Policy, and `X-Content-Type-Options`, but no CSP, frame-ancestors/X-Frame-Options, Permissions-Policy, or immutable caching for hashed assets. JS/CSS/image all use only `cache-control: public, must-revalidate, max-age=30`. `robots.txt` and `sitemap.xml` are 404. No `staticwebapp.config.json` is tracked. |
| Installer/release verification | FAIL | GitHub Releases `latest` returns 404; live `/latest.json` is `published:false`; the CTA falls back to “View releases.” No `.dmg`, Windows installer, AppImage, `.deb`, `SHA256SUMS`, or `latest.json` release artifact exists to download or checksum. The required installable desktop app cannot be exercised end to end. |
| Billing endpoint rate limit | PASS | 80 simultaneous invalid-license `GET /verify` requests to the Sociobot product API returned 30 × 200 then 50 × 429. 429 responses included `Retry-After: 2`–`3` and `X-RateLimit-After`; observed threshold was 30 requests in this burst. |

## Defects

### Blockers

1. **Missing `.factory/claims.json` and all claim tests.** Required before any release; every public product promise is untestable under the required sandbox contract.
2. **No one-click sample-data demo.** No demo route, isolation, sample data, reset, start-for-real path, or demo documentation. This fails the explicit first screen/demonstrability acceptance gate.
3. **No release or installable desktop artifacts.** The public download path has no asset for any platform, so the actual encrypted desktop workflow cannot be installed or verified. The brief’s smallest useful product cannot be accepted from the deployment.

### High

1. **Production service-worker installation fails.** It precaches two 404 URLs, so PWA update/offline-reload behaviour is not present on the live candidate. The previous handoff’s offline claim is contradicted by fresh live evidence.
2. **Required desktop workflow lacks end-to-end verification.** Existing tests never exercise vault creation, file import, SHA-256 preservation, missing-evidence tagging, PDF/ZIP export, bad passphrase/file/error recovery, or a representative/boundary data set. With no released binary, this is also not independently executable.
3. **Security/deployment configuration is incomplete.** No CSP/Permissions-Policy/frame policy, no `robots.txt`/`sitemap.xml`, and no long-lived immutable caching for hashed assets.

### Medium

1. **Mobile touch targets are below 44 px.** The 390 px live tab sequence measured the Restore button at 15 px high and footer links at 14 px high.
2. **Metadata/routing skeleton is incomplete.** Landing and legal pages lack canonical, Open Graph, Twitter, theme-color, and favicon metadata; legal pages have only an isolated main rather than the required shared header/footer. `/demo` is a fallback landing page rather than a real demo route.
3. **The current app UI cannot meet the demo requirement by loading the browser preview.** In non-Tauri mode, Add/Flag/Export merely show “Open the installed app…” and there is no sample project; it does not demonstrate the job-to-be-done.

## Notes for a repair verification

Do not relabel this candidate as passed merely because the supplied tests and static build succeed. First ship the claims manifest with one observable demo-based test per public claim, implement the isolated sample-data demo, publish and checksum platform artifacts, fix the service-worker cache list against the deployment output, then run a clean install/import/tag/missing/export/reopen workflow on a released artifact. Re-check live response headers, mobile target sizes, and the complete static-site metadata after deployment.
