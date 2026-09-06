type SampleEvidence = {
  id: string;
  name: string;
  original: string;
  category: string;
  reference: string;
  amount: string;
  status: 'supported' | 'missing';
  fingerprint: string;
};

const demoStorageKey = 'demo:tax-evidence-pack:records';
const root = document.querySelector<HTMLDivElement>('#demo-app')!;
const encoder = new TextEncoder();

const sampleEvidence = (): SampleEvidence[] => [
  { id: 'rail', name: 'Luma Rail client visit', original: '2025-05-14-luma-rail.pdf', category: 'Travel', reference: 'BANK-1842', amount: '£86.40', status: 'supported', fingerprint: 'a4f6c8e219d0' },
  { id: 'print', name: 'Grove Print signage', original: '2025-06-03-grove-print.pdf', category: 'Marketing', reference: 'CARD-9921', amount: '£214.00', status: 'supported', fingerprint: 'c91df0a75042' },
  { id: 'hotel', name: 'Harbour Hotel workshop', original: '2025-06-21-harbour-hotel.pdf', category: 'Travel', reference: 'BANK-1906', amount: '£148.00', status: 'supported', fingerprint: '11e8bc82a9f4' },
  { id: 'software', name: 'Aster Space workspace', original: '2025-07-01-aster-space.pdf', category: 'Premises', reference: 'CARD-0038', amount: '£42.00', status: 'supported', fingerprint: 'f0a3dcb854e1' },
  { id: 'mileage', name: 'May mileage log', original: 'Evidence not attached', category: 'Travel', reference: 'CLAIM-051', amount: '£96.60', status: 'missing', fingerprint: 'missing' },
];

function loadRecords(): SampleEvidence[] {
  try {
    const saved = localStorage.getItem(demoStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as SampleEvidence[];
      if (Array.isArray(parsed) && parsed.every((item) => typeof item.id === 'string')) return parsed;
    }
  } catch {
    localStorage.removeItem(demoStorageKey);
  }
  return sampleEvidence();
}

let records = loadRecords();

function saveRecords() {
  localStorage.setItem(demoStorageKey, JSON.stringify(records));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function missingRate() {
  return Math.round((records.filter((record) => record.status === 'missing').length / records.length) * 100);
}

function render(status = '') {
  const missing = records.filter((record) => record.status === 'missing').length;
  root.innerHTML = `
    <section class="demo-intro" aria-labelledby="demo-title"><p class="eyebrow">Sample tax year 2025</p><h1 id="demo-title">Review a populated evidence binder</h1><p>This sample shows records ready for review and one missing mileage log to follow up.</p></section>
    <section class="demo-metrics" aria-label="Sample evidence overview"><div><span>Records in binder</span><strong>${records.length}</strong></div><div><span>Needs support</span><strong class="warning">${missing}</strong></div><div><span>Missing rate</span><strong>${missingRate()}%</strong><small>Follow up before export</small></div><div><span>Tax year</span><strong>2025</strong><small>Sample project</small></div></section>
    <section class="demo-register" aria-labelledby="register-title"><div class="demo-register-heading"><div><p class="eyebrow">Document register</p><h2 id="register-title">Evidence on file</h2></div><p>${records.length} records shown</p></div><div class="table-wrap"><table><thead><tr><th>Document</th><th>Tax context</th><th>Status</th><th>Fingerprint</th><th>Amount</th></tr></thead><tbody>${records.map((record) => `<tr><td><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(record.original)}</small></td><td><span>${escapeHtml(record.category)}</span><small>${escapeHtml(record.reference)}</small></td><td><span class="badge ${record.status}">${record.status === 'supported' ? '✓ Supported' : 'Needs support'}</span></td><td><code>${escapeHtml(record.fingerprint)}${record.status === 'supported' ? '…' : ''}</code></td><td>${escapeHtml(record.amount)}</td></tr>`).join('')}</tbody></table></div><div class="demo-actions"><button class="button secondary" id="add-reminder" type="button">Add sample reminder</button><button class="button primary" id="export-sample" type="button">Export sample review pack</button></div><p id="demo-status" class="demo-status" role="status" aria-live="polite">${escapeHtml(status)}</p></section>
    <section class="demo-note" aria-labelledby="demo-note-title"><h2 id="demo-note-title">What this sample proves</h2><p>It keeps sample data separate from your real binder. Export creates a ZIP with a PDF index and sample original-file entries.</p></section>`;
  document.querySelector<HTMLButtonElement>('#add-reminder')!.addEventListener('click', addReminder);
  document.querySelector<HTMLButtonElement>('#export-sample')!.addEventListener('click', exportSample);
}

function addReminder() {
  if (records.some((record) => record.id === 'insurance')) {
    render('The sample insurance reminder is already in this demo.');
    return;
  }
  records = [...records, { id: 'insurance', name: 'July insurance invoice', original: 'Evidence not attached', category: 'Insurance', reference: 'BANK-1939', amount: '£31.00', status: 'missing', fingerprint: 'missing' }];
  saveRecords();
  render('Sample reminder added. It is stored only in this demo.');
}

function u16(value: number) { return [value & 0xff, (value >>> 8) & 0xff]; }
function u32(value: number) { return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]; }

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function samplePdf() {
  const lines = ['Tax Evidence Pack — 2025 sample review index', 'Original sample files are included in this ZIP.', '', ...records.map((record) => `${record.name} | ${record.category} | ${record.reference} | ${record.status} | ${record.fingerprint}`)];
  const content = lines.map((line, index) => `BT /F1 ${index === 0 ? 16 : 9} Tf 42 ${770 - index * 15} Td (${line.replace(/[\\()]/g, '\\$&')}) Tj ET`).join('\n');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>', `<< /Length ${content.length} >>\nstream\n${content}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return encoder.encode(pdf);
}

function createZip(files: Array<{ name: string; bytes: Uint8Array }>) {
  const local: number[] = [];
  const central: number[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.bytes);
    const header = [0x50, 0x4b, 0x03, 0x04, ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(file.bytes.length), ...u32(file.bytes.length), ...u16(name.length), ...u16(0), ...name];
    local.push(...header, ...file.bytes);
    central.push(0x50, 0x4b, 0x01, 0x02, ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(file.bytes.length), ...u32(file.bytes.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...name);
    offset += header.length + file.bytes.length;
  }
  return new Uint8Array([...local, ...central, 0x50, 0x4b, 0x05, 0x06, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(central.length), ...u32(local.length), ...u16(0)]);
}

function exportSample() {
  const files = [{ name: 'Tax Evidence Pack 2025 sample review index.pdf', bytes: samplePdf() }, ...records.filter((record) => record.status === 'supported').map((record) => ({ name: `originals/${record.original.replace(/\.pdf$/, '.txt')}`, bytes: encoder.encode(`Sample original evidence for ${record.name}.\nFingerprint: ${record.fingerprint}`) }))];
  const blob = new Blob([createZip(files)], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tax-evidence-pack-2025-sample.zip';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
  render('Sample ZIP downloaded with a PDF index and four original-file entries.');
}

document.querySelector<HTMLButtonElement>('#reset-demo')!.addEventListener('click', () => {
  localStorage.removeItem(demoStorageKey);
  records = sampleEvidence();
  render('Demo reset. Your real binder was not changed.');
});

render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
