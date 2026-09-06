# Tax Evidence Pack — verification 2 handoff

## Status: FAIL

Independent verification on 2026-09-06 found **10 findings** (4 high, 4 medium,
2 low) and **0 untested declared claims**. Product code was not changed.

- Implementation reviewed: `eef6d4a97e86e5d906e6cbd1ba4f2b1e28c19bb6`
- Documentation baseline: `b70cb68fd2aa12054c8de304c552e185a19336e6`
- Live URL: <https://tax-evidence-pack.sociobot.in>
- Release: [v0.1.7](https://github.com/B-Divyesh/sf-tax-evidence-pack/releases/tag/v0.1.7)
- Full report: [`.factory/verification-2.md`](verification-2.md)

## What was verified

From a clean checkout, all eight declared claim commands passed. `npm test`,
`npm run build`, `npm run build:site`, `npm run test:browser`, Rust tests, and the
production dependency audit also passed.

Fresh desktop and phone browsers passed the cold first-screen, isolated sample,
reset, same-origin request, live offline reload, route/title, legal-page, designed
404, link, response-header, and light-theme Axe checks. Lighthouse mobile scored
99 performance, 100 accessibility, 100 best practices, and 100 SEO.

The v0.1.7 Debian package checksum matched. Its executable was launched from an
isolated consumer prefix. The desktop sample, encrypted vault, wrong-passphrase
recovery, restart persistence, real file import, fingerprint, and original-byte ZIP
export worked.

## Findings to repair

1. **High:** the public **Buy Plus** checkout returns HTTP 404.
2. **High:** a 57-record export is a one-page PDF with its final eight records off-page.
3. **High:** the desktop dark theme has a serious Axe contrast violation across 27 nodes.
4. **High:** the rolling four-year selector makes older stored years unavailable for review or export.
5. **Medium:** search loses focus after the first typed character.
6. **Medium:** cancelling file selection reports “Evidence added and fingerprinted.”
7. **Medium:** the GitHub release's `latest.json` links all return 404 and its `SHA256SUMS` cannot be checked against downloaded asset names.
8. **Medium:** public privacy, free-access, price, and update statements are missing from `.factory/claims.json`.
9. **Low:** **Start for real** leaves the modified demo key in browser storage.
10. **Low:** header and generated release links still include targets below 44×44 CSS px on phone.

## Evidence and rerun

The complete commands, results, earlier-finding disposition, and evidence paths are
in `.factory/verification-2.md`. Screenshots, sample output, the Lighthouse JSON,
and URL-verifier output are under `/work/.evidence/verification-2/`.

Use the documented Ubuntu packages, then run:

```sh
npm ci
npm test
npm run build
npm run build:site
npm run test:browser
cargo test --manifest-path src-tauri/Cargo.toml
npm audit --omit=dev --audit-level=high
```

Run every command in `.factory/claims.json` separately after the listed repairs.
Re-publish the release metadata and deploy before the next independent verification.

## Operator dependencies

- Register the `tax-evidence-pack` billing offer in the Sociobot billing service and
  verify the hosted checkout before exposing **Buy Plus**.
- macOS notarization and Windows Authenticode remain optional future work requiring
  the owner's platform signing credentials. The current release correctly labels
  its packages unsigned and ships no automatic updater.
