import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebriefApiKey } from "@/contexts/DebriefApiKeyContext";
import { isOpenWeb } from "@/lib/openWeb";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ScheduledTarget = {
  id: string;
  repoUrl: string;
  repoName: string | null;
  targetLabel: string | null;
  interval: string;
  timezone: string;
  active: boolean;
  lastRunAt: string | null;
  chainLength: number;
};

async function fetchTargets(getHeaders: () => Record<string, string>) {
  const res = await fetch("/api/targets", { credentials: "include", headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<ScheduledTarget[]>;
}

function headersWithKey(apiKey: string | null): Record<string, string> {
  if (apiKey) return { "X-Api-Key": apiKey };
  return {};
}

export default function TargetsPage() {
  const { apiKey } = useDebriefApiKey();
  const qc = useQueryClient();
  const h = () => headersWithKey(isOpenWeb ? null : apiKey);
  const { data, isLoading, error } = useQuery({
    queryKey: ["scheduled-targets", apiKey],
    queryFn: () => fetchTargets(h),
  });

  const [repoUrl, setRepoUrl] = useState("https://github.com/expressjs/express");
  const [label, setLabel] = useState("");
  const [interval, setInterval] = useState<string>("manual");

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/targets", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...h() },
        body: JSON.stringify({
          repo_url: repoUrl.trim(),
          target_label: label || undefined,
          interval,
          timezone: "UTC",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-targets"] }),
  });

  const toggleMut = useMutation({
    mutationFn: async (t: ScheduledTarget) => {
      const res = await fetch(`/api/targets/${t.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...h() },
        body: JSON.stringify({ active: !t.active }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-targets"] }),
  });

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-display font-bold">Scheduled targets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Evidence chain registration — each target gets a tamper-evident receipt timeline.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/30 p-6 space-y-4">
          <h2 className="font-semibold">Register target</h2>
          <div className="space-y-2">
            <Label>Repository URL</Label>
            <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Label (optional)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="My service" />
          </div>
          <div className="space-y-2">
            <Label>Schedule</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual only</SelectItem>
                <SelectItem value="three_daily">Three times daily (06:00, 14:00, 22:00)</SelectItem>
                <SelectItem value="daily">Daily (06:00)</SelectItem>
                <SelectItem value="weekly">Weekly (Mon 06:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMut.isPending} onClick={() => createMut.mutate()}>
            {createMut.isPending ? "Creating…" : "Create & run genesis analysis"}
          </Button>
          {createMut.isError && (
            <p className="text-sm text-destructive">{(createMut.error as Error).message}</p>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-3">Your targets</h2>
          {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {error && <p className="text-destructive text-sm">{(error as Error).message}</p>}
          <ul className="space-y-2">
            {data?.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-3 justify-between rounded-lg border border-border/50 px-4 py-3"
              >
                <div>
                  <div className="font-medium">{t.targetLabel || t.repoName || t.repoUrl}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate max-w-[280px] md:max-w-md">
                    {t.repoUrl}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Interval: {t.interval} · Chain length: {t.chainLength}
                    {t.lastRunAt ? ` · Last: ${new Date(t.lastRunAt).toLocaleString()}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/timeline/${t.id}`}>
                    <Button size="sm" variant="secondary">
                      Timeline
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => toggleMut.mutate(t)}>
                    {t.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
