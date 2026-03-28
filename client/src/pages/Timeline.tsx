import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useCallback, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDebriefApiKey } from "@/contexts/DebriefApiKeyContext";
import { isOpenWeb } from "@/lib/openWeb";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ChainItem = {
  id: string;
  targetId: string;
  runId: string;
  receiptHash: string;
  chainSequence: number;
  receiptType: string;
  scheduled: boolean;
  triggeredBy: string;
  timestamp: string;
  diffSummary: string | null;
  anomalyFlagged: boolean;
  anomalyReason: string | null;
  newCves: unknown[];
  closedCves: unknown[];
  newEndpoints: unknown[];
  removedEndpoints: unknown[];
  authChanges: unknown[];
  receiptDocument: Record<string, unknown> | null;
};

type VerifyResponse = {
  chainIntact: boolean;
  verificationLog: { chainSequence: number; ok: boolean; detail: string }[];
  gapsCount: number;
  anomaliesCount: number;
};

function headersWithKey(apiKey: string | null): Record<string, string> {
  if (apiKey) return { "X-Api-Key": apiKey };
  return {};
}

export default function TimelinePage() {
  const [, params] = useRoute("/timeline/:targetId");
  const targetId = params?.targetId;
  const { apiKey } = useDebriefApiKey();
  const h = () => headersWithKey(isOpenWeb ? null : apiKey);

  const { data, isLoading, error } = useQuery({
    queryKey: ["chain", targetId, apiKey],
    queryFn: async () => {
      const res = await fetch(`/api/targets/${targetId}/chain`, { credentials: "include", headers: h() });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ items: ChainItem[] }>;
    },
    enabled: !!targetId,
  });

  const { data: verify } = useQuery({
    queryKey: ["chain-verify", targetId, apiKey],
    queryFn: async () => {
      const res = await fetch(`/api/targets/${targetId}/chain/verify`, { credentials: "include", headers: h() });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<VerifyResponse>;
    },
    enabled: !!targetId,
  });

  const items = data?.items ?? [];
  const [selected, setSelected] = useState<ChainItem | null>(null);
  const [range, setRange] = useState<[ChainItem | null, ChainItem | null]>([null, null]);
  const [dragAnchor, setDragAnchor] = useState<ChainItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [verifyInline, setVerifyInline] = useState<string | null>(null);

  const exportChain = useCallback(async () => {
    const res = await fetch(`/api/targets/${targetId}/chain/export`, { credentials: "include", headers: h() });
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${targetId}.debrief-chain.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [targetId, apiKey]);

  const nodeClass = (item: ChainItem) => {
    const manual = !item.scheduled;
    if (item.receiptType === "gap") {
      return "border-2 border-red-500 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.45)]";
    }
    if (item.anomalyFlagged) {
      return "border-2 border-amber-400 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.35)]";
    }
    if (manual) {
      return "border-2 border-sky-500 bg-transparent";
    }
    return "border-2 border-sky-600 bg-sky-600";
  };

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.chainSequence - b.chainSequence), [items]);

  const exportRangeDiff = () => {
    const [a, b] = range;
    if (!a || !b) return;
    const later = a.chainSequence > b.chainSequence ? a : b;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            from: a.chainSequence < b.chainSequence ? a : b,
            to: later,
            diffSummary: later.diffSummary,
            newCves: later.newCves,
            closedCves: later.closedCves,
            newEndpoints: later.newEndpoints,
            removedEndpoints: later.removedEndpoints,
            authChanges: later.authChanges,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `range-diff-${targetId}.json`;
    el.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/targets">
                <Button variant="ghost" size="sm">
                  ← Targets
                </Button>
              </Link>
              <h1 className="text-xl font-display font-bold">Evidence timeline</h1>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">{targetId}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {verify && (
              <Badge variant={verify.chainIntact ? "default" : "destructive"}>
                {verify.chainIntact ? "Chain intact" : "Chain broken — see verify panel"}
              </Badge>
            )}
            <Button size="sm" onClick={() => void exportChain()}>
              Export chain
            </Button>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading chain…</p>}
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

        <div
          ref={scrollRef}
          className="overflow-x-auto pb-6 pt-4 border border-border/40 rounded-xl bg-muted/20 px-4"
        >
          <div className="flex items-center gap-6 min-w-max py-4">
            {sortedItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "relative w-4 h-4 rounded-full shrink-0 transition-transform hover:scale-125",
                      nodeClass(item),
                    )}
                    onClick={() => {
                      if (dragAnchor && dragAnchor.id !== item.id) {
                        setRange(
                          dragAnchor.chainSequence < item.chainSequence
                            ? [dragAnchor, item]
                            : [item, dragAnchor],
                        );
                        setDragAnchor(null);
                      } else {
                        setSelected(item);
                      }
                    }}
                    onMouseDown={() => setDragAnchor(item)}
                  >
                    <span className="sr-only">seq {item.chainSequence}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="text-xs space-y-1">
                    <div>{new Date(item.timestamp).toLocaleString()}</div>
                    <div>
                      {item.receiptType} · seq {item.chainSequence}
                    </div>
                    <div>{item.diffSummary?.slice(0, 160) || "—"}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="flex gap-4 text-[10px] text-muted-foreground uppercase tracking-wide mt-2">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-sky-600 border-2 border-sky-600" /> Analysis
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-400 border-2 border-amber-400" /> Anomaly
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 border-2 border-red-500" /> Gap
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-sky-500 bg-transparent" /> Manual
            </span>
          </div>
        </div>

        {verify && !verify.chainIntact && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
            <div className="font-medium text-destructive">Verification issues</div>
            <ul className="mt-2 list-disc pl-5 text-xs space-y-1">
              {verify.verificationLog
                .filter((s) => !s.ok)
                .map((s) => (
                  <li key={s.chainSequence}>
                    Seq {s.chainSequence}: {s.detail}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {(range[0] && range[1] && (
          <div className="rounded-xl border border-border/60 p-4 space-y-3 bg-card/40">
            <div className="font-semibold">Range diff</div>
            <p className="text-sm text-muted-foreground">
              Between {new Date(range[0]!.timestamp).toLocaleString()} and{" "}
              {new Date(range[1]!.timestamp).toLocaleString()}
            </p>
            <p className="text-sm">
              {(range[1]!.chainSequence > range[0]!.chainSequence ? range[1] : range[0])?.diffSummary ||
                "No summary stored."}
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-medium text-emerald-600">New CVEs</div>
                <pre className="mt-1 overflow-auto max-h-28 bg-muted/50 p-2 rounded">
                  {JSON.stringify(
                    (range[1]!.chainSequence > range[0]!.chainSequence ? range[1] : range[0])?.newCves || [],
                    null,
                    2,
                  )}
                </pre>
              </div>
              <div>
                <div className="font-medium text-red-600">Resolved CVEs</div>
                <pre className="mt-1 overflow-auto max-h-28 bg-muted/50 p-2 rounded">
                  {JSON.stringify(
                    (range[1]!.chainSequence > range[0]!.chainSequence ? range[1] : range[0])?.closedCves || [],
                    null,
                    2,
                  )}
                </pre>
              </div>
              <div>
                <div className="font-medium text-emerald-600">New endpoints</div>
                <pre className="mt-1 overflow-auto max-h-28 bg-muted/50 p-2 rounded">
                  {JSON.stringify(
                    (range[1]!.chainSequence > range[0]!.chainSequence ? range[1] : range[0])?.newEndpoints ||
                      [],
                    null,
                    2,
                  )}
                </pre>
              </div>
              <div>
                <div className="font-medium text-red-600">Removed endpoints</div>
                <pre className="mt-1 overflow-auto max-h-28 bg-muted/50 p-2 rounded">
                  {JSON.stringify(
                    (range[1]!.chainSequence > range[0]!.chainSequence ? range[1] : range[0])?.removedEndpoints ||
                      [],
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={exportRangeDiff}>
              Export this diff
            </Button>
          </div>
        )) ||
          null}

        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selected && (
              <>
                <SheetHeader>
                  <SheetTitle>Receipt detail · seq {selected.chainSequence}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Time:</span>{" "}
                    {new Date(selected.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">ISO:</span>{" "}
                    <span className="font-mono text-xs">{selected.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span> {selected.receiptType}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scheduled:</span>{" "}
                    {selected.scheduled ? "yes" : "no (manual)"}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-muted-foreground">Receipt hash:</span>
                    <code className="text-xs bg-muted px-1 rounded">{selected.receiptHash.slice(0, 16)}…</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void navigator.clipboard.writeText(selected.receiptHash)}
                    >
                      Copy
                    </Button>
                  </div>
                  {selected.receiptDocument?.previous_receipt_hash != null && (
                    <div className="text-xs font-mono break-all">
                      Previous: {String(selected.receiptDocument.previous_receipt_hash)}
                    </div>
                  )}
                  {selected.receiptType === "gap" && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-xs space-y-1">
                      <div>Gap duration evidence (missed schedule).</div>
                      {selected.receiptDocument?.gap_duration_seconds != null && (
                        <div>Seconds: {String(selected.receiptDocument.gap_duration_seconds)}</div>
                      )}
                    </div>
                  )}
                  {selected.anomalyFlagged && (
                    <div className="rounded-md bg-amber-500/15 border border-amber-500/40 p-3 text-amber-900 dark:text-amber-100">
                      {selected.anomalyReason}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Summary:</span>
                    <p className="mt-1">{selected.diffSummary || "—"}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      void (async () => {
                        const res = await fetch(`/api/targets/${targetId}/chain/verify`, {
                          credentials: "include",
                          headers: h(),
                        });
                        const j = await res.json().catch(() => ({}));
                        setVerifyInline(JSON.stringify(j, null, 2));
                      })();
                    }}
                  >
                    Verify this receipt (full chain)
                  </Button>
                  {verifyInline && (
                    <pre className="text-[10px] bg-muted/60 p-2 rounded max-h-48 overflow-auto mt-2">
                      {verifyInline}
                    </pre>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}
