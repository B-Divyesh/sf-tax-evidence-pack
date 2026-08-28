import { describe, expect, it } from 'vitest';
import { filterEvidence, formatBytes, missingRate } from './core';

const items = [{ id: '1', name: 'Train receipt', original_name: 'train.pdf', hash: '', mime: 'application/pdf', size: 1800, imported_at: '', tax_year: '2026', category: 'Travel', transaction_ref: 'TX-4', status: 'supported' as const, note: 'client visit' }, { id: '2', name: 'Cash claim', original_name: '', hash: '', mime: '', size: 0, imported_at: '', tax_year: '2026', category: 'Meals', transaction_ref: '', status: 'missing' as const, note: '' }];
describe('evidence helpers', () => {
  it('finds records across human metadata', () => expect(filterEvidence(items, 'client', '2026', '').map(i => i.id)).toEqual(['1']));
  it('calculates missing evidence', () => expect(missingRate(items)).toBe(50));
  it('formats file sizes', () => expect(formatBytes(2048)).toBe('2.0 KB'));
});
