// TypeScript type for WorkspaceGraph artifact
export type WorkspaceGraph = {
  generated_at: string;
  repos: Array<{
    name: string;
    path: string;
    git?: { hash?: string; branch?: string };
    tech: { runtime?: string; language?: string; package_manager?: string };
  }>;
  edges: Array<{
    from: string;
    to: string; // repo name OR "external:<pkg>"
    type: "npm"|"workspace"|"file"|"git"|"monorepo"|"http"|"contract"|"grpc";
    evidence: Array<{ file: string; detail: string }>;
    risk: { level: "low"|"med"|"high"; reasons: string[] };
  }>;
};
