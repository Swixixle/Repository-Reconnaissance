import fs from "fs";
import path from "path";
import { reconHistory } from "../history";

describe("recon history scaffold", () => {
  const repoPath = path.resolve(__dirname, "fixtures/workspace/dummy-a");
  const outputDir = path.resolve(__dirname, "out/history-test");

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  it("generates hotspots.json and hotspots.md with stub content", async () => {
    await reconHistory({ repo: repoPath, since: "90d", output: outputDir, format: "both" });
    const jsonPath = path.join(outputDir, "hotspots.json");
    const mdPath = path.join(outputDir, "hotspots.md");
    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(mdPath)).toBe(true);
    const json = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    expect(json).toHaveProperty("generated_at");
    expect(json).toHaveProperty("repo");
    expect(json).toHaveProperty("window");
    expect(json).toHaveProperty("totals");
    expect(json).toHaveProperty("hotspots");
    expect(Array.isArray(json.hotspots)).toBe(true);
    const md = fs.readFileSync(mdPath, "utf-8");
    expect(md).toContain("# Hotspots Report");
    expect(md).toContain("No hotspots found in the selected window.");
  });
});
