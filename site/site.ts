type Release = { version: string; platforms: Record<string, { url: string; sha256?: string }> };
const slug = 'tax-evidence-pack';
const key = `sb_license:${slug}`;
const api = 'https://api.sociobot.in/api/v1/products/tax-evidence-pack';
const el = <T extends HTMLElement>(id: string) => document.querySelector<T>(`#${id}`)!;

function storedLicense() { return localStorage.getItem(key); }
function saveLicense(token: string) { localStorage.setItem(key, token.trim()); localStorage.removeItem(`${key}:verdict`); verifyLicense(token.trim()); }
async function verifyLicense(token: string) {
  if (!token) return;
  const status = el<HTMLParagraphElement>('license-status');
  const cached = localStorage.getItem(`${key}:verdict`);
  if (cached) { const value = JSON.parse(cached); if (Date.now() - value.time < 86_400_000) { status.textContent = value.valid ? 'Plus license active.' : 'License no longer active.'; return; } }
  status.textContent = 'Checking license…';
  try { const response = await fetch(`${api}/verify?license=${encodeURIComponent(token)}`); const verdict = await response.json(); localStorage.setItem(`${key}:verdict`, JSON.stringify({ ...verdict, time: Date.now() })); status.textContent = verdict.valid ? 'Plus license active.' : 'License no longer active — you can purchase a new one below.'; if (!verdict.valid) localStorage.removeItem(key); } catch { status.textContent = 'License saved. Verification will resume when you are online.'; }
}
function platform() { const ua = navigator.userAgent.toLowerCase(); if (ua.includes('win')) return 'windows'; if (ua.includes('mac')) return 'macos'; return 'linux'; }
async function release() { const button = el<HTMLAnchorElement>('download-button'); const copy = el<HTMLParagraphElement>('download-copy'); try { const response = await fetch('https://github.com/B-Divyesh/sf-tax-evidence-pack/releases/latest/download/latest.json', { cache: 'no-store' }); if (!response.ok) throw new Error('not released'); const latest = await response.json() as Release; const item = latest.platforms[platform()]; if (!item?.url) throw new Error('platform missing'); button.href = item.url; button.textContent = `Download ${latest.version} for ${platform() === 'macos' ? 'macOS' : platform() === 'windows' ? 'Windows' : 'Linux'}`; copy.textContent = item.sha256 ? `Latest ${latest.version}. SHA-256 is published with the release.` : `Latest ${latest.version}.`; } catch { copy.textContent = 'The first release is being prepared. Browse release assets for your platform.'; } }
const incoming = new URLSearchParams(location.search).get('license'); if (incoming) { saveLicense(incoming); history.replaceState({}, '', location.pathname + location.hash); } else if (storedLicense()) verifyLicense(storedLicense()!);
el<HTMLButtonElement>('restore').addEventListener('click', () => { el<HTMLDivElement>('license-area').hidden = false; el<HTMLInputElement>('license-input').focus(); });
el<HTMLButtonElement>('save-license').addEventListener('click', () => saveLicense(el<HTMLInputElement>('license-input').value));
release();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
