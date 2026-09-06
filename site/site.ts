type ReleaseAsset = { name: string; url: string; sha256?: string; signature?: string | null; signed?: boolean };
type ReleasePlatform = { label?: string; url?: string; sha256?: string; signature?: string | null; signed?: boolean; artifacts?: ReleaseAsset[] };
type Release = { version?: string; published?: boolean; release_url?: string; platforms?: Record<string, ReleasePlatform> };

const slug = 'tax-evidence-pack';
const key = `sb_license:${slug}`;
const api = 'https://api.sociobot.in/api/v1/products/tax-evidence-pack';
const el = <T extends HTMLElement>(id: string) => document.querySelector<T>(`#${id}`)!;

function storedLicense() { return localStorage.getItem(key); }
function saveLicense(token: string) {
  const value = token.trim();
  const status = el<HTMLParagraphElement>('license-status');
  if (!value) { status.textContent = 'Paste a license token, then restore it.'; return; }
  localStorage.setItem(key, value); localStorage.removeItem(`${key}:verdict`); verifyLicense(value);
}
async function verifyLicense(token: string) {
  if (!token) return;
  const status = el<HTMLParagraphElement>('license-status');
  const cached = localStorage.getItem(`${key}:verdict`);
  if (cached) {
    try {
      const value = JSON.parse(cached);
      if (Date.now() - value.time < 86_400_000) { status.textContent = value.valid ? 'Plus license active.' : 'License no longer active.'; return; }
    } catch { localStorage.removeItem(`${key}:verdict`); }
  }
  status.textContent = 'Checking license…';
  try { const response = await fetch(`${api}/verify?license=${encodeURIComponent(token)}`); const verdict = await response.json(); localStorage.setItem(`${key}:verdict`, JSON.stringify({ ...verdict, time: Date.now() })); status.textContent = verdict.valid ? 'Plus license active.' : 'License no longer active — you can purchase a new one below.'; if (!verdict.valid) localStorage.removeItem(key); } catch { status.textContent = 'License saved. Verification will resume when you are online.'; }
}

function platform() { const ua = navigator.userAgent.toLowerCase(); if (ua.includes('win')) return 'windows'; if (ua.includes('mac')) return 'macos'; return 'linux'; }
function platformName(name: string) { return name === 'macos' ? 'macOS' : name === 'windows' ? 'Windows' : 'Linux'; }

function renderAssets(platforms: Record<string, ReleasePlatform>) {
  const list = el<HTMLUListElement>('release-assets');
  list.replaceChildren();
  for (const [name, item] of Object.entries(platforms)) {
    const artifacts = item.artifacts?.length ? item.artifacts : item.url ? [{ name: `${platformName(name)} installer`, url: item.url, sha256: item.sha256, signature: item.signature, signed: item.signed }] : [];
    for (const asset of artifacts) {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = asset.url; link.textContent = `${platformName(name)}: ${asset.name}`; link.rel = 'noopener';
      const hash = document.createElement('code'); hash.textContent = asset.sha256 ? `SHA-256 ${asset.sha256}` : 'SHA-256 published in release notes';
      const signing = document.createElement('span'); signing.className = 'release-signing'; signing.textContent = asset.signature ? 'Signature available' : asset.signed ? 'Signed' : 'Unsigned';
      row.append(link, hash, signing); list.append(row);
    }
  }
  list.hidden = !list.children.length;
}

async function release() {
  const button = el<HTMLAnchorElement>('download-button');
  const copy = el<HTMLParagraphElement>('download-copy');
  const releasePage = button.href;
  try {
    // Same origin by design: GitHub's release-download redirect does not grant browser CORS.
    const response = await fetch(new URL('/latest.json', location.origin), { cache: 'no-store' });
    if (!response.ok) throw new Error('manifest unavailable');
    const latest = await response.json() as Release;
    const platforms = latest.platforms ?? {};
    const item = platforms[platform()];
    if (!latest.published || !latest.version || !item?.url) throw new Error('not published');
    button.href = item.url;
    button.textContent = `Download ${latest.version} for ${platformName(platform())}`;
    copy.textContent = item.sha256 ? `Version ${latest.version} · SHA-256 verified in the release manifest.` : `Version ${latest.version}.`;
    renderAssets(platforms);
  } catch {
    button.href = releasePage;
    copy.textContent = 'Downloads are being published. Browse the release page for status.';
  }
}

const incoming = new URLSearchParams(location.search).get('license');
if (incoming) { saveLicense(incoming); history.replaceState({}, '', location.pathname + location.hash); } else if (storedLicense()) verifyLicense(storedLicense()!);
el<HTMLButtonElement>('restore').addEventListener('click', () => { el<HTMLDivElement>('license-area').hidden = false; el<HTMLInputElement>('license-input').focus(); });
el<HTMLButtonElement>('save-license').addEventListener('click', () => saveLicense(el<HTMLInputElement>('license-input').value));
release();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
