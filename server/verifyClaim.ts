import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { hashClaimExcerpt } from "../claims/hash";
import * as fs from "fs";

async function verifyClaimCLI() {
  yargs(hideBin(process.argv))
    .command(
      "verify-claim <claim_id>",
      "Verify a claim hash against repo snapshot",
      (yargs) =>
        yargs
          .option("repo-path", {
            type: "string",
            describe: "Path to local repo",
            demandOption: true,
          })
          .option("dossier", {
            type: "string",
            describe: "Path to dossier.json",
            default: "dossier.json",
          }),
      async (argv) => {
        const dossierPath = argv.dossier as string;
        const repoPath = argv["repo-path"] as string;
        const claimId = argv.claim_id as string;
        let dossier;
        try {
          dossier = JSON.parse(fs.readFileSync(dossierPath, "utf8"));
        } catch (e) {
          console.error("ERROR: Failed to load dossier.");
          process.exit(3);
        }
        const claim = dossier.claims.find((c: any) => c.claim_id === claimId);
        if (!claim) {
          console.error("ERROR: Claim not found.");
          process.exit(3);
        }
        // TODO: Checkout commit and extract file bytes (git show <commit>:<path>)
        // For now, assume file exists at repoPath/claim.file
        const filePath = `${repoPath}/${claim.file}`;
        const result = hashClaimExcerpt(filePath, claim.line_start, claim.line_end);
        if (result.error) {
          console.error(`ERROR: ${result.error}`);
          process.exit(3);
        }
        console.log(`Expected Hash: ${claim.excerpt_hash}`);
        console.log(`Computed Hash: ${result.excerptHash}`);
        const verdict = claim.excerpt_hash === result.excerptHash ? "MATCH" : "MISMATCH";
        console.log(`Verdict: ${verdict}`);
        // Print canonical excerpt (max 200 lines)
        if (result.canonicalExcerpt) {
          const lines = result.canonicalExcerpt.split("\n");
          if (lines.length <= 200) {
            console.log("Canonical Excerpt:\n" + result.canonicalExcerpt);
          } else {
            console.log("Canonical Excerpt (head/tail):");
            console.log(lines.slice(0, 100).join("\n"));
            console.log("...\n...");
            console.log(lines.slice(-100).join("\n"));
          }
        }
        process.exit(verdict === "MATCH" ? 0 : 2);
      }
    )
    .demandCommand(1)
    .help().argv;
}

verifyClaimCLI();
