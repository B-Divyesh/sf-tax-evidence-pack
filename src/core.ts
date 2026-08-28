import type { EvidenceItem } from './types';

export const taxYears = (now = new Date()) => {
  const y = now.getFullYear();
  return [String(y + 1), String(y), String(y - 1), String(y - 2)];
};

export function filterEvidence(items: EvidenceItem[], query: string, year: string, status: string) {
  const q = query.trim().toLocaleLowerCase();
  return items.filter((item) =>
    (!q || [item.name, item.category, item.transaction_ref, item.note].join(' ').toLocaleLowerCase().includes(q)) &&
    (!year || item.tax_year === year) && (!status || item.status === status)
  );
}

export function missingRate(items: EvidenceItem[]) {
  return items.length ? Math.round((items.filter((i) => i.status === 'missing').length / items.length) * 100) : 0;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
