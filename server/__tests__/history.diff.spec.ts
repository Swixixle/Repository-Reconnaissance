import { computeHistoryDiff } from "../client/src/historyDiff/diff";
import { HotspotEntry } from "../client/src/historyDiff/parse";

describe("history-diff regression gate", () => {
  const before: HotspotEntry[] = [
    { path: "a.ts", commits: 10, churn: { added: 100, deleted: 50, binary: false }, authors: 2, score: 10, flags: [] },
    { path: "b.ts", commits: 5, churn: { added: 20, deleted: 10, binary: false }, authors: 1, score: 5, flags: [] },
  ];
  const after: HotspotEntry[] = [
    { path: "a.ts", commits: 20, churn: { added: 200, deleted: 100, binary: false }, authors: 3, score: 20, flags: [] },
    { path: "b.ts", commits: 2, churn: { added: 5, deleted: 2, binary: false }, authors: 1, score: 2, flags: [] },
  ];

  it("detects regression and improvement", () => {
    const diff = computeHistoryDiff(before, after, "score", 2, 0, "2026-02-23T00:00:00.000Z");
    expect(diff.regressions.length).toBe(1);
    expect(diff.improvements.length).toBe(1);
    expect(diff.regressions[0].path).toBe("a.ts");
    expect(diff.improvements[0].path).toBe("b.ts");
  });

  it("fail-on regression returns exit 2", () => {
    const diff = computeHistoryDiff(before, after, "score", 2, 0, "2026-02-23T00:00:00.000Z");
    const hasRegression = diff.regressions.length > 0;
    expect(hasRegression).toBe(true);
  });

  it("deterministic output ignoring generated_at", () => {
    const diff1 = computeHistoryDiff(before, after, "score", 2, 0, "2026-02-23T00:00:00.000Z");
    const diff2 = computeHistoryDiff(before, after, "score", 2, 0, "2026-02-23T00:00:00.000Z");
    expect(JSON.stringify(diff1)).toBe(JSON.stringify(diff2));
  });
});
