export type EvidenceItem = {
  id: string; name: string; original_name: string; hash: string; mime: string;
  size: number; imported_at: string; tax_year: string; category: string;
  transaction_ref: string; status: 'supported' | 'missing'; note: string;
};

export type VaultSummary = { count: number; missing: number };
