import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { hashClaimExcerpt } from "../claims/hash";
import * as fs from "fs";

async function auditCLI() {
  yargs(hideBin(process.argv))
    .command(
      "audit <dossier> --repo-path <path>",
      "Audit all VERIFIED claims in dossier",
      (yargs) =>
        yargs
          .option("repo-path", {
            type: "string",
            describe: "Path to local repo",
            demandOption: true,
          }),
      async (argv) => {
        const dossierPath = argv.dossier as string;
        const repoPath = argv["repo-path"] as string;
        let dossier;
        try {
          dossier = JSON.parse(fs.readFileSync(dossierPath, "utf8"));
        } catch (e) {
          console.error("ERROR: Failed to load dossier.");
          process.exit(3);
        }
        const report = {
          total_verified: 0,
          valid: 0,
          drifted: 0,
          invalidated: 0,
          commit_mismatch: 0,
          canonicalization_mismatch: 0,
          file_missing: 0,
          encoding_error: 0,
          drifted_claims: [] as any[],
        };
        for (const claim of dossier.claims.filter((c: any) => c.epistemic_status === "VERIFIED")) {
          report.total_verified++;
          // TODO: Checkout commit and extract file bytes (git show <commit>:<path>)
          // For now, assume file exists at repoPath/claim.file
          const filePath = `${repoPath}/${claim.file}`;
          const result = hashClaimExcerpt(filePath, claim.line_start, claim.line_end);
          if (result.error === "FILE_MISSING") {
            report.file_missing++;
            continue;
          }
          if (result.error === "ENCODING_ERROR") {
            report.encoding_error++;
            continue;
          }
          if (result.error === "EXCERPT_TOO_LARGE") {
            report.invalidated++;
            continue;
          }
          if (claim.canonicalization_version !== "v1") {
            report.canonicalization_mismatch++;
            continue;
          }
          if (claim.excerpt_hash === result.excerptHash) {
            report.valid++;
          } else {
            report.drifted++;
            report.drifted_claims.push({
              claim_id: claim.claim_id,
              expected_hash: claim.excerpt_hash,
              computed_hash: result.excerptHash,
              // Minimal diff: show head/tail of canonical excerpt
              diff: {
                expected: claim.canonical_excerpt,
                actual: result.canonicalExcerpt,
              },
            });
          }
        }
        fs.writeFileSync("audit_report.json", JSON.stringify(report, null, 2));
        console.log("Audit complete. Report written to audit_report.json.");
        process.exit(0);
      }
    )
    .demandCommand(1)
    .help().argv;
}

auditCLI();
