import { invoke } from '@tauri-apps/api/core';
import './style.css';
import './sample.css';
import { filterEvidence, formatBytes, missingRate, taxYears } from './core';
import type { EvidenceItem, VaultSummary } from './types';

const root = document.querySelector<HTMLDivElement>('#app')!;
const isDesktop = '__TAURI_INTERNALS__' in window;
let evidence: EvidenceItem[] = [];
let unlocked = false;
let selectedYear = String(new Date().getFullYear());
let selectedStatus = '';
let search = '';
let toast = '';
let sampleMode = false;

const esc = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);

function icon(name: 'archive' | 'plus' | 'download' | 'trash' | 'check' | 'lock') {
  const paths = { archive: '<path d="M4 7h16v13H4zM3 4h18v3H3zM9 11h6"/>', plus: '<path d="M12 5v14M5 12h14"/>', download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/>', trash: '<path d="M5 7h14m-9 3v7m4-7v7M9 7V4h6v3m-8 0 1 14h8l1-14"/>', check: '<path d="m5 12 4 4L19 6"/>', lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>' };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
}

function appShell() {
  const filtered = filterEvidence(evidence, search, selectedYear, selectedStatus);
  const missing = evidence.filter((i) => i.status === 'missing').length;
  root.innerHTML = `
    <a class="skip" href="#main">Skip to evidence register</a>
    <header class="topbar"><a class="wordmark" href="#" aria-label="Tax Evidence Pack home"><span class="mark">${icon('archive')}</span> Tax Evidence <b>Pack</b></a><span class="local">${icon('lock')} Encrypted on this device</span><button class="quiet" id="theme" aria-label="Toggle colour theme">◐</button></header>
    <main id="main">${sampleMode ? '<section class="sample-banner" role="status"><span><b>Sample project.</b> Nothing is saved to your real binder.</span><button class="quiet" id="leave-sample">Start for real</button></section>' : ''}
      <section class="masthead"><div><p class="eyebrow">${selectedYear} tax year · private evidence binder</p><h1>Your evidence, ready to review.</h1><p class="lede">Keep the original file, its fingerprint, and the transaction context together — then hand over a readable index and untouched originals.</p></div><div class="actions"><button class="primary" id="add">${icon('plus')} Add evidence</button><button class="secondary" id="missing">Flag missing</button><button class="secondary" id="export">${icon('download')} Export review pack</button></div></section>
      <section class="metrics" aria-label="Evidence overview"><div><span>Records in binder</span><strong>${evidence.length}</strong></div><div><span>Needs support</span><strong class="${missing ? 'warning' : 'good'}">${missing}</strong></div><div><span>Missing rate</span><strong>${missingRate(evidence)}%</strong><small>Target: under 5%</small></div><div><span>Integrity</span><strong class="good">${icon('check')} Hashed</strong><small>Each original is fingerprinted</small></div></section>
      <section class="register" aria-labelledby="register-title"><div class="register-heading"><div><p class="eyebrow">Document register</p><h2 id="register-title">Evidence on file</h2></div><p class="count" aria-live="polite">${filtered.length} shown</p></div>
      <div class="filters"><label>Search evidence<input id="search" value="${esc(search)}" placeholder="Name, category, transaction…" /></label><label>Tax year<select id="year">${taxYears().map(y => `<option ${y === selectedYear ? 'selected' : ''}>${y}</option>`).join('')}</select></label><label>Status<select id="status"><option value="">All records</option><option value="supported" ${selectedStatus === 'supported' ? 'selected' : ''}>Supported</option><option value="missing" ${selectedStatus === 'missing' ? 'selected' : ''}>Missing support</option></select></label></div>
      <div class="table-wrap">${recordsTable(filtered)}</div></section>
      <section class="method"><div class="stamp">${icon('lock')}</div><div><p class="eyebrow">Your local archive</p><h2>Built for a question from your accountant, not a new ledger.</h2><p>Files are encrypted at rest with your passphrase, stored only on this computer, and exported without changing the originals. Tax Evidence Pack organizes records; it is not tax advice or a guarantee of record-retention compliance in every jurisdiction.</p></div></section>
    </main><div class="toast" role="status" aria-live="polite">${esc(toast)}</div>`;
  bindApp();
}

function recordsTable(items: EvidenceItem[]) {
  if (!items.length) return `<div class="empty"><div class="empty-stamp">${icon('archive')}</div><h3>${evidence.length ? 'No records match these filters' : 'Start your evidence binder'}</h3><p>${evidence.length ? 'Try a different year, status, or search term.' : 'Add receipts, invoices, reimbursement proof, or a missing-evidence reminder. Originals remain encrypted on this device.'}</p><button class="primary" id="empty-add">${icon('plus')} Add evidence</button></div>`;
  return `<table><thead><tr><th>Document</th><th>Tax context</th><th>Status</th><th>Fingerprint</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${items.map(item => `<tr><td><strong>${esc(item.name)}</strong><small>${esc(item.original_name || 'Missing-document marker')} · ${formatBytes(item.size)}</small></td><td><span>${esc(item.category || 'Uncategorized')}</span><small>${esc(item.tax_year)} · ${esc(item.transaction_ref || 'No transaction reference')}</small></td><td><span class="badge ${item.status}">${item.status === 'supported' ? icon('check') + ' Supported' : 'Needs support'}</span></td><td><code title="SHA-256: ${esc(item.hash)}">${esc(item.hash.slice(0, 12))}…</code></td><td><button class="icon-button delete" data-id="${item.id}" aria-label="Remove ${esc(item.name)}">${icon('trash')}</button></td></tr>`).join('')}</tbody></table>`;
}

function bindApp() {
  document.querySelector('#search')?.addEventListener('input', (e) => { search = (e.target as HTMLInputElement).value; appShell(); });
  document.querySelector('#year')?.addEventListener('change', (e) => { selectedYear = (e.target as HTMLSelectElement).value; appShell(); });
  document.querySelector('#status')?.addEventListener('change', (e) => { selectedStatus = (e.target as HTMLSelectElement).value; appShell(); });
  document.querySelector('#theme')?.addEventListener('click', () => document.documentElement.classList.toggle('dark'));
  ['#add', '#empty-add'].forEach((selector) => document.querySelector(selector)?.addEventListener('click', addEvidence));
  document.querySelector('#missing')?.addEventListener('click', addMissing);
  document.querySelector('#export')?.addEventListener('click', exportPack);
  document.querySelector('#leave-sample')?.addEventListener('click', () => { sampleMode = false; evidence = []; unlockScreen(); });
  document.querySelectorAll<HTMLButtonElement>('.delete').forEach(button => button.addEventListener('click', async () => {
    if (!confirm('Remove this record and encrypted original from this binder? This cannot be undone.')) return;
    await invoke('delete_evidence', { id: button.dataset.id }); await refresh(); setToast('Record removed from this binder.');
  }));
}

async function addEvidence() {
  if (sampleMode) return setToast('This sample is read-only. Choose Start for real to add your own evidence.');
  if (!isDesktop) return setToast('Open the installed app to add encrypted files.');
  const category = prompt('Category for these files (for example: Travel)', 'Uncategorized');
  if (category === null) return;
  const transactionRef = prompt('Transaction reference for these files (optional)', '') || '';
  try { await invoke('import_files', { taxYear: selectedYear, category, transactionRef }); await refresh(); setToast('Evidence added and fingerprinted.'); }
  catch (error) { setToast(`Could not add evidence: ${String(error)}`); }
}
async function exportPack() {
  if (sampleMode) return setToast('The browser demo can export a sample pack. Choose Start for real to export your own evidence.');
  if (!isDesktop) return setToast('Open the installed app to export a review pack.');
  try { const path = await invoke<string>('export_pack', { taxYear: selectedYear }); setToast(`Review pack exported to ${path}`); }
  catch (error) { setToast(`Could not export pack: ${String(error)}`); }
}
async function addMissing() {
  if (sampleMode) return setToast('This sample is read-only. Choose Start for real to add your own reminder.');
  if (!isDesktop) return setToast('Open the installed app to mark missing evidence.');
  const name = prompt('What evidence is missing? (for example: Stationery receipt)');
  if (!name) return;
  const category = prompt('Category (optional)', 'Uncategorized') || 'Uncategorized';
  const transactionRef = prompt('Transaction reference (optional)', '') || '';
  try { await invoke('add_missing_evidence', { taxYear: selectedYear, name, category, transactionRef }); await refresh(); setToast('Missing-evidence marker added.'); }
  catch (error) { setToast(`Could not add marker: ${String(error)}`); }
}
function setToast(message: string) { toast = message; appShell(); window.setTimeout(() => { if (toast === message) { toast = ''; appShell(); } }, 4500); }
async function refresh() { evidence = await invoke<EvidenceItem[]>('list_evidence'); appShell(); }

function unlockScreen(message = '') {
  root.innerHTML = `<main class="unlock"><section><div class="seal">${icon('lock')}</div><p class="eyebrow">Local encrypted vault</p><h1>Open your evidence binder.</h1><p>Choose a passphrase that stays on this device. It encrypts your originals and the document register. There is no recovery service.</p><label for="pass">Passphrase<input id="pass" type="password" autocomplete="current-password" autofocus /></label><p id="unlock-message" class="form-message" aria-live="polite">${esc(message)}</p><div class="unlock-actions"><button class="primary" id="unlock">Open binder</button><button class="secondary" id="sample-project">Load sample project</button></div><p class="fine-print">The sample is read-only and never writes to your vault. Organization only — not tax advice or a promise of legal record retention.</p></section></main>`;
  const open = async () => { const password = (document.querySelector('#pass') as HTMLInputElement).value; if (password.length < 10) return unlockScreen('Use at least 10 characters for this local vault.'); try { await invoke('unlock_vault', { password }); unlocked = true; await refresh(); } catch { unlockScreen('That passphrase did not open this vault. Try again.'); } };
  document.querySelector('#unlock')?.addEventListener('click', open); document.querySelector('#pass')?.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') open(); });
  document.querySelector('#sample-project')?.addEventListener('click', () => { sampleMode = true; selectedYear = '2025'; evidence = sampleProject(); appShell(); });
}

function sampleProject(): EvidenceItem[] {
  return [
    { id: 'sample-rail', name: 'Luma Rail client visit', original_name: '2025-05-14-luma-rail.pdf', hash: 'a4f6c8e219d0b2b5', mime: 'application/pdf', size: 88412, imported_at: '2025-05-14T12:00:00Z', tax_year: '2025', category: 'Travel', transaction_ref: 'BANK-1842', status: 'supported', note: '' },
    { id: 'sample-print', name: 'Grove Print signage', original_name: '2025-06-03-grove-print.pdf', hash: 'c91df0a75042017a', mime: 'application/pdf', size: 124921, imported_at: '2025-06-03T12:00:00Z', tax_year: '2025', category: 'Marketing', transaction_ref: 'CARD-9921', status: 'supported', note: '' },
    { id: 'sample-hotel', name: 'Harbour Hotel workshop', original_name: '2025-06-21-harbour-hotel.pdf', hash: '11e8bc82a9f4e0d7', mime: 'application/pdf', size: 140882, imported_at: '2025-06-21T12:00:00Z', tax_year: '2025', category: 'Travel', transaction_ref: 'BANK-1906', status: 'supported', note: '' },
    { id: 'sample-mileage', name: 'May mileage log', original_name: '', hash: 'missing-evidence', mime: '', size: 0, imported_at: '2025-05-31T12:00:00Z', tax_year: '2025', category: 'Travel', transaction_ref: 'CLAIM-051', status: 'missing', note: 'Evidence has not been attached yet' }
  ];
}

if (isDesktop) unlockScreen(); else { evidence = []; appShell(); }
