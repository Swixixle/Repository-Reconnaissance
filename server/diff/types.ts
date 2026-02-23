export type DiffCategory = "capability"|"unknown"|"risk"|"security"|"dependency"|"api"|"meta";

export type ChangeType = "added"|"removed"|"modified";

export type Severity = "low"|"med"|"high";

export type DossierDiff = {
  generated_at: string;
  before: { repo: string; git_hash?: string; generated_at?: string; source?: string };
  after:  { repo: string; git_hash?: string; generated_at?: string; source?: string };
  changes: Array<{
    category: DiffCategory;
    change_type: ChangeType;
    key: string;
    before?: unknown;
    after?: unknown;
    severity?: Severity;
    summary: string;
    evidence?: Array<{ file?: string; detail?: string }>;
  }>;
  totals: { added: number; removed: number; modified: number };
  regression_summary?: {
    has_regressions: boolean;
    highest_severity?: Severity;
    counts_by_severity: Record<Severity, number>;
  };
};
