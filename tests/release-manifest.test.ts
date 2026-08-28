import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const hash = (char: string) => char.repeat(64);
let temp = '';
afterEach(async () => { if (temp) await rm(temp, { recursive: true, force: true }); });

describe('same-origin release manifest build', () => {
  it('keeps every installer, checksum, and signature metadata from the release API', async () => {
    const assets = [
      { name: 'Tax-Evidence-Pack-arm64.dmg', browser_download_url: 'https://downloads.test/mac-arm.dmg', digest: `sha256:${hash('a')}` },
      { name: 'Tax-Evidence-Pack-x64.dmg', browser_download_url: 'https://downloads.test/mac-x64.dmg', digest: `sha256:${hash('b')}` },
      { name: 'Tax-Evidence-Pack.msi', browser_download_url: 'https://downloads.test/windows.msi', digest: `sha256:${hash('c')}` },
      { name: 'Tax-Evidence-Pack.exe', browser_download_url: 'https://downloads.test/windows.exe', digest: `sha256:${hash('d')}` },
      { name: 'Tax-Evidence-Pack.AppImage', browser_download_url: 'https://downloads.test/linux.AppImage', digest: `sha256:${hash('e')}` },
      { name: 'Tax-Evidence-Pack.deb', browser_download_url: 'https://downloads.test/linux.deb', digest: `sha256:${hash('f')}` },
      { name: 'Tax-Evidence-Pack.msi.sig', browser_download_url: 'https://downloads.test/windows.msi.sig' },
      { name: 'SHA256SUMS', browser_download_url: 'http://placeholder/sums' },
    ];
    const server = createServer((request, response) => {
      const origin = `http://${request.headers.host}`;
      if (request.url === '/latest') return response.end(JSON.stringify({ tag_name: 'v2.4.0', html_url: 'https://github.com/example/releases/tag/v2.4.0', assets: assets.map((asset) => asset.name === 'SHA256SUMS' ? { ...asset, browser_download_url: `${origin}/sums` } : asset) }));
      if (request.url === '/sums') return response.end(`${hash('a')}  Tax-Evidence-Pack-arm64.dmg\n${hash('c')}  Tax-Evidence-Pack.msi\n${hash('e')}  Tax-Evidence-Pack.AppImage\n`);
      response.statusCode = 404; response.end();
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    const api = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}/latest`;
    temp = await mkdtemp(join(tmpdir(), 'tep-manifest-'));
    const output = join(temp, 'latest.json');
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, ['scripts/generate-release-manifest.mjs', output], { cwd: process.cwd(), env: { ...process.env, RELEASE_MANIFEST_API_URL: api } });
      child.once('error', reject); child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`manifest generator exited ${code}`)));
    });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const manifest = JSON.parse(await readFile(output, 'utf8'));
    expect(manifest).toMatchObject({ published: true, version: '2.4.0' });
    expect(manifest.platforms.macos.artifacts).toHaveLength(2);
    expect(manifest.platforms.windows.artifacts).toHaveLength(2);
    expect(manifest.platforms.linux.artifacts).toHaveLength(2);
    expect(manifest.platforms.windows.url).toBe('https://downloads.test/windows.msi');
    expect(manifest.platforms.windows.sha256).toBe(hash('c'));
    expect(manifest.platforms.windows.artifacts[0].signature).toBe('https://downloads.test/windows.msi.sig');
  });
});
