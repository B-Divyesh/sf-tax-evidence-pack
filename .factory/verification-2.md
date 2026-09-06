# Verification 2 — Tax Evidence Pack — FAIL

**Verdict: FAIL**

- Findings: **10** (4 high, 4 medium, 2 low)
- Untested declared claims: **0**
- Implementation reviewed: `eef6d4a97e86e5d906e6cbd1ba4f2b1e28c19bb6`
- Documentation baseline: `b70cb68fd2aa12054c8de304c552e185a19336e6`
- Release: `v0.1.7` (tag points to the implementation SHA)
- Live URL: <https://tax-evidence-pack.sociobot.in>
- Verified: 2026-09-06 UTC

No product code was changed.

## Cold first screen

Before scrolling, fresh desktop and 390 px phone browsers showed:

- Job: **Prepare your tax evidence pack**
- Audience: **Sole traders who need receipts, invoices and proof ready for an accountant**
- First action: **Try it with sample data**; the adjacent text says it opens a populated binder

The action was visible at `y=427` in a 1366×900 desktop viewport and `y=360` in
the 390×664 phone viewport. Neither viewport had horizontal overflow. This check
passes the plain-words first-screen contract.

## Findings

### High 1 — The advertised $29 purchase cannot be made

The live page advertises “Tax Evidence Pack Plus costs $29 once” and presents
**Buy Plus**. A fresh request to its exact target returned HTTP 404:

```text
GET https://api.sociobot.in/api/v1/products/tax-evidence-pack/checkout
404 {"error":"enabled factory product","status":404}
```

The handoff identifies billing registration as an operator dependency, but the
broken control remains public. This is a failed user path and not a reason to pass
the product.

### High 2 — A realistic large binder produces an incomplete visible PDF index

I used the released Linux app to create 57 records in tax year 2026 and exported
the review pack. `pdfinfo` reports one Letter-sized page. The PDF generator places
every record on that one page at a successively lower coordinate and has no paging
or wrapping. The rendered page ends at “Boundary record 74”; eight later records
(`75` through `82`) are outside the visible page.

Evidence: `/work/.evidence/verification-2/boundary-index.png` and
`src-tauri/src/lib.rs` (`simple_pdf`). The declared
`@claim:original-file-export` test uses only two records, so it does not test the
reviewability or completeness promised by “PDF review index” at a normal annual
volume.

### High 3 — The desktop dark theme has serious contrast failures

Playwright Axe against the built desktop UI in sample mode found a serious
`color-contrast` violation affecting 27 nodes. Examples include:

- sample banner text: `1.08:1`
- filter labels: `1.69:1`
- the green “Hashed” state: `1.9:1`
- metric labels and table supporting text: `2.41–2.61:1`

The light theme had no Axe violations. The visual thesis explicitly defines a dark
treatment, so the dark theme must meet the same 4.5:1 text and 3:1 large-text/UI
minimums.

### High 4 — Older tax years become inaccessible

The installed app only offers next year, current year, and the prior two years.
In 2026 the choices are 2027, 2026, 2025, and 2024. There is no “all years” or
custom-year option. A record created for 2023 or earlier can remain counted in the
encrypted index but cannot be selected, reviewed, or exported through the UI.

This is a data-access and record-retention boundary failure for a tax evidence
product. The limitation comes from `src/core.ts` (`taxYears`) and is not disclosed.

### Medium 1 — Search accepts only the first typed character

In the released app, typing `Stationery` in **Search evidence** left only `S` in the
field. Each `input` event replaces the whole app DOM, so focus is lost after the
first character (`src/main.ts`, search listener in `bindApp`). This breaks normal
typing and keyboard use of the search feature.

Evidence: `/work/.evidence/verification-2/desktop-search-focus-loss.png`.

### Medium 2 — Cancelling file selection reports a successful import

Cancelling the native file picker left the record count and vault unchanged, but
the installed app displayed “Evidence added and fingerprinted.” The Rust command
returns `0` after cancellation; the TypeScript caller ignores that count and always
shows success. This is false feedback on a routine recovery path.

### Medium 3 — The release's own checksum and update manifests are not usable

The GitHub release contains real artifacts, and the live site's separately generated
`/latest.json` links to them correctly. However, the `latest.json` attached to the
release names files with spaces and all six of its installer URLs return 404 because
GitHub published names with periods. The attached `SHA256SUMS` also uses
`release-assets/Tax Evidence Pack_...` paths. Running `sha256sum -c SHA256SUMS`
after downloading the release files fails all six entries as missing.

The raw SHA-256 value for the downloaded Debian artifact is correct, but the
published verification files do not work as delivered. This contradicts the handoff
claim that release `latest.json` is valid and the release safeguard is complete.

### Medium 4 — The public claims inventory is incomplete

All eight listed claim commands pass, but `.factory/claims.json` omits public,
testable statements including:

- the desktop app “does not upload evidence, use analytics, or include advertising trackers”
- “Core access, accessibility, and evidence export are never locked after purchase changes”
- the $29 one-time purchase and ongoing desktop-update offer

The broken checkout demonstrates why these user-reliance statements require their
own claim coverage. Under the claims contract, unlisted claims are findings even
when related implementation tests pass.

### Low 1 — Leaving the web demo does not discard sample state

After adding a sample reminder, **Start for real** navigated to `/#download` but
left `demo:tax-evidence-pack:records` in local storage. Reset removes the key and a
sentinel real-data key remains untouched, but the demo contract also requires sample
state to be discarded when leaving demo mode.

### Low 2 — Several live phone targets are smaller than 44×44 CSS px

At 390 px, the header wordmark was 29 px high, **Demo** was 41.6×44 px, **Price**
was 34.2×44 px, and each generated release-file link was 15 px high. The earlier
specific Restore and footer-link defects are fixed, but the broader touch-target
baseline is not yet met.

## Declared claim commands

Every command in `.factory/claims.json` was run separately from a fresh GitHub
checkout at the documentation baseline after `npm ci`. All passed:

| Claim | Command | Result |
| --- | --- | --- |
| `sample-data` | `npm run test:browser -- --grep @claim:sample-data` | PASS |
| `demo-isolation` | `npm run test:browser -- --grep @claim:demo-isolation` | PASS |
| `sample-export` | `npm run test:browser -- --grep @claim:sample-export` | PASS |
| `offline-demo` | `npm run test:browser -- --grep @claim:offline-demo` | PASS |
| `release-manifest` | `npm run test:browser -- --grep @claim:release-manifest` | PASS |
| `encrypted-vault` | `npm test -- -t @claim:encrypted-vault` | PASS |
| `sha256-fingerprint` | `npm test -- -t @claim:sha256-fingerprint` | PASS |
| `original-file-export` | `npm test -- -t @claim:original-file-export` | PASS |

Declared claims left untested: **0**. Finding Medium 4 concerns public claims that
are missing from the declaration, not skipped declared commands.

## Build and automated checks

From the clean checkout, after installing the documented Ubuntu prerequisites:

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 65 packages, 0 vulnerabilities |
| `npm test` | PASS; 7 tests |
| `npm run build` | PASS; `dist/app` produced |
| `npm run build:site` | PASS; `dist/site` produced |
| `npm run test:browser` | PASS; 6 tests |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS; 3 tests |
| `npm audit --omit=dev --audit-level=high` | PASS; 0 vulnerabilities |
| `/opt/fleet/lib/verify-url.sh` | PASS; no landing console errors |
| Playwright Axe on all live routes | PASS; no serious/critical findings |
| Playwright Axe on desktop light theme | PASS |
| Playwright Axe on desktop dark theme | FAIL; High 3 |

Fresh Lighthouse mobile results were performance **99**, accessibility **100**,
best practices **100**, SEO **100**, LCP **1498 ms**, CLS **0**, and total blocking
time **110.5 ms**. Initial transfer was 1,881 bytes of JavaScript, 3,195 bytes of
CSS, and 105,862 bytes of images.

## Live and demo checks

- `/`, `/demo`, `/demo/`, `/privacy`, `/privacy/`, `/terms`, `/terms/`,
  `robots.txt`, `sitemap.xml`, `sw.js`, and `latest.json` returned 200.
- `/not-a-real-page` deliberately returned 404 with the designed page, one h1,
  main landmark, and a route-specific title. The browser's 404 resource message is
  expected and is not classified as a defect.
- All live routes had `lang`, one h1, main, route titles, and no Axe violations.
- The live CSP, frame, referrer, permissions, and content-type headers were present.
  Hashed JS/CSS used one-year immutable caching.
- The live demo opened in one click with five realistic records, a persistent sample
  label, one missing record, reset, and start-for-real controls.
- Adding a sample reminder changed five records to six and persisted on reload.
  Reset returned to five, removed the demo key, preserved a sentinel real key, and
  made no third-party request.
- The sample ZIP opened successfully and contained a valid one-page PDF index plus
  four sample original-file entries. The PDF listed all five sample records.
- A fresh service-worker context installed one worker and reloaded `/demo/` offline.
- Keyboard smoke checks passed: Tab exposed a 3 px focus ring on the skip link,
  Enter moved focus to `main`, and the desktop sample opened with Tab/Enter. At a
  640 CSS px viewport (the 200% desktop-zoom equivalent), content remained available
  without horizontal overflow. Reduced-motion emulation produced `0s` transitions.
- Every ordinary internal link returned 200. License callback stripping, invalid
  license handling, and recovery from malformed cached verdict JSON worked without
  console errors.

The live HTML, JS, CSS, demo bundle, legal pages, 404 page, and service worker had
the same SHA-256 hashes as a fresh `npm run build:site` at the documentation
baseline. The only commit after implementation SHA `eef6d4a9` changes
`.factory/handoff.md`, so the live runtime matches the implementation candidate.

## Installed artifact check

The released Debian package was downloaded into a clean temporary consumer prefix.
Its SHA-256 was
`c4e319994e010b50dc0dadc60e9c28d1eff316eba951a79c234eda795519c942`,
matching the live manifest, GitHub digest, and checksum value.

The extracted v0.1.7 executable was launched under an isolated X display and
isolated XDG data/config directories. Verified behavior:

- first-run screen and keyboard-operated **Load sample project**
- persistent sample label and no vault creation while using the sample
- wrong-passphrase feedback and successful correct-passphrase recovery
- encrypted vault creation and absence of imported plaintext in stored bytes
- missing-record creation and persistence across a full app restart
- real PDF import, SHA-256 fingerprinting, ZIP export, a parseable PDF index, and
  byte-for-byte equality between the imported file and exported original
- cancellation, search, and 57-record boundary paths, which produced the related
  findings above

Screenshots and generated artifacts are under
`/work/.evidence/verification-2/`.

## Earlier verification findings

| Verification 1 item | Current disposition |
| --- | --- |
| Missing claims file and claim commands | Core manifest and eight commands added; all pass, but public inventory remains incomplete (Medium 4). |
| No isolated one-click demo | Sample, banner, reset, isolation, and export fixed; exit cleanup remains (Low 1). |
| No desktop release | Fixed; v0.1.7 has all required platform installers. Release metadata files remain broken (Medium 3). |
| Broken production service worker | Fixed; live worker installs and demo reloads offline. |
| Desktop workflow unverified | Normal installed Linux workflow now passes; search, cancel, old-year, and large-export paths fail as listed. |
| Missing security/deployment configuration | Fixed on live responses, routes, robots, sitemap, and hashed assets. |
| Small mobile touch targets | Restore and footer links fixed; other targets remain below 44×44 (Low 2). |
| Incomplete titles/metadata/routes | Fixed for ordinary live routes; designed 404 behaves correctly. |
| Browser preview could not demonstrate the job | Fixed by the populated `/demo` sandbox. |
| GitHub CORS download failure | Fixed by same-origin live manifest. |
| Malformed license verdict recovery | Fixed and independently retested. |
| Billing 429/Retry-After | Still passes: a 40-request burst produced 30×200 and 10×429; 429 responses carried `Retry-After: 4`. |

Tenant isolation, product-backend health, and product-backend restart persistence
are not applicable: this is a static site plus local desktop app. Desktop restart
persistence passed. AI assistance is not an obvious missing step because OCR and
tax interpretation are explicit non-goals.

## Required next work

1. Register and verify the public billing offer before showing the buy control.
2. Paginate and wrap the PDF index; add a boundary claim test with at least 100 records.
3. Correct desktop dark-theme contrast and add Axe coverage for it.
4. Make all stored years selectable, including years that age out of the rolling list.
5. Preserve focus while filtering and report cancellation without a success message.
6. Generate release metadata using the final uploaded filenames and make
   `sha256sum -c SHA256SUMS` work in a normal download directory.
7. Declare and test every public privacy, price, license, and update claim.
8. Clear demo storage on **Start for real** and bring every touch target to 44×44 px.
