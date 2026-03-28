/**
 * Topological order for education graph nodes (dependencies first).
 */
export function computeLogicalDependencyOrder(
  nodeIds: string[],
  edges: { source: string; target: string }[],
): string[] {
  const ids = [...nodeIds];
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of ids) {
    indegree.set(id, 0);
    adj.set(id, []);
  }
  for (const e of edges) {
    if (!adj.has(e.source) || !indegree.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
  }
  const queue = ids.filter((id) => indegree.get(id) === 0);
  const out: string[] = [];
  while (queue.length) {
    const n = queue.shift()!;
    out.push(n);
    for (const v of adj.get(n) ?? []) {
      const d = (indegree.get(v) ?? 0) - 1;
      indegree.set(v, d);
      if (d === 0) queue.push(v);
    }
  }
  if (out.length < ids.length) {
    for (const id of ids) {
      if (!out.includes(id)) out.push(id);
    }
  }
  return out;
}
