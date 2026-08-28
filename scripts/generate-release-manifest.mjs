import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const repository = 'B-Divyesh/sf-tax-evidence-pack';
const releasePage = `https://github.com/${repository}/releases`;
const output = process.argv[2] ?? 'dist/site/latest.json';
const apiUrl = process.env.RELEASE_MANIFEST_API_URL ?? `https://api.github.com/repos/${repository}/releases/latest`;
const emptyPlatforms = () => Object.fromEntries(['macos', 'windows', 'linux'].map((name) => [name, { label: name === 'macos' ? 'macOS' : name === 'windows' ? 'Windows' : 'Linux', signed: false, artifacts: [] }]));
function fallback(reason) { return { schema: 1, published: false, version: null, release_url: releasePage, generated_at: new Date().toISOString(), reason, platforms: emptyPlatforms() }; }
function platformFor(name) { const value = name.toLowerCase(); if (value.endsWith('.dmg')) return 'macos'; if (value.endsWith('.msi') || value.endsWith('.exe')) return 'windows'; if (value.endsWith('.appimage') || value.endsWith('.deb')) return 'linux'; return null; }
function parseSums(text) { const sums = new Map(); for (const line of text.split('\n')) { const match = line.match(/^([a-fA-F0-9]{64})\s+[* ](.+)$/); if (match) sums.set(match[2], match[1].toLowerCase()); } return sums; }
async function fetchJson(url) { const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'tax-evidence-pack-site-build' }, signal: AbortSignal.timeout(12_000) }); if (!response.ok) throw new Error(`release API returned ${response.status}`); return response.json(); }
async function createManifest() {
  try {
    const release = await fetchJson(apiUrl);
    const checksumAsset = release.assets?.find((asset) => asset.name === 'SHA256SUMS');
    let sums = new Map();
    if (checksumAsset?.browser_download_url) try { const response = await fetch(checksumAsset.browser_download_url, { headers: { 'User-Agent': 'tax-evidence-pack-site-build' }, signal: AbortSignal.timeout(12_000) }); if (response.ok) sums = parseSums(await response.text()); } catch { /* API digests below are a safe fallback. */ }
    const platforms = emptyPlatforms();
    for (const asset of release.assets ?? []) {
      const name = platformFor(asset.name); if (!name) continue;
      const siblingSignature = (release.assets ?? []).find((other) => other.name === `${asset.name}.sig` || other.name === `${asset.name}.minisig`);
      const sha256 = sums.get(asset.name) ?? asset.digest?.replace(/^sha256:/, '') ?? null;
      platforms[name].artifacts.push({ name: asset.name, url: asset.browser_download_url, sha256, signature: siblingSignature?.browser_download_url ?? null, signed: Boolean(siblingSignature) });
    }
    for (const [name, entry] of Object.entries(platforms)) {
      const preferred = entry.artifacts.find((asset) => name === 'macos' ? asset.name.includes('aarch64') || asset.name.includes('arm64') : name === 'windows' ? asset.name.endsWith('.msi') : asset.name.endsWith('.AppImage')) ?? entry.artifacts[0];
      if (preferred) Object.assign(entry, { url: preferred.url, sha256: preferred.sha256, signature: preferred.signature, signed: preferred.signed });
    }
    return { schema: 1, published: true, version: String(release.tag_name ?? '').replace(/^v/, ''), release_url: release.html_url ?? releasePage, generated_at: new Date().toISOString(), platforms };
  } catch (error) { return fallback(error instanceof Error ? error.message : 'release metadata unavailable'); }
}
const manifest = await createManifest();
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`wrote ${output} (${manifest.published ? `release ${manifest.version}` : 'release pending'})`);
