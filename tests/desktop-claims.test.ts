import { spawn } from 'node:child_process';
import { describe, expect, test } from 'vitest';

function cargoClaim(filter: string) {
  return new Promise<{ code: number | null; output: string }>((resolve, reject) => {
    const child = spawn('cargo', ['test', '--manifest-path', 'src-tauri/Cargo.toml', filter], { cwd: process.cwd() });
    let output = '';
    child.stdout.on('data', (chunk) => { output += String(chunk); });
    child.stderr.on('data', (chunk) => { output += String(chunk); });
    child.once('error', reject);
    child.once('close', (code) => resolve({ code, output }));
  });
}

describe('desktop outcome claims', () => {
  test('@claim:encrypted-vault verifies encrypted bytes and passphrase recovery paths', async () => {
    const result = await cargoClaim('claim_encrypted_vault');
    expect(result.code, result.output).toBe(0);
    expect(result.output).toContain('claim_encrypted_vault_keeps_plaintext_out_of_stored_bytes ... ok');
  }, 180_000);

  test('@claim:sha256-fingerprint verifies a known imported-file digest', async () => {
    const result = await cargoClaim('claim_sha256_fingerprint');
    expect(result.code, result.output).toBe(0);
    expect(result.output).toContain('claim_sha256_fingerprint_matches_imported_bytes ... ok');
  }, 180_000);

  test('@claim:original-file-export opens the review ZIP and compares original bytes', async () => {
    const result = await cargoClaim('claim_export_includes_originals');
    expect(result.code, result.output).toBe(0);
    expect(result.output).toContain('claim_export_includes_originals_and_review_index ... ok');
  }, 180_000);
});
