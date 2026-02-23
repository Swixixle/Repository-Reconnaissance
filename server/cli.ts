#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { reconHistory } from "./history";

async function main() {
  yargs(hideBin(process.argv))
    .command(
      "history",
      "Analyze git history and report hotspots",
      (yargs) =>
        yargs
          .option("repo", {
            type: "string",
            describe: "Path to repo",
            demandOption: true,
          })
          .option("since", {
            type: "string",
            default: "90d",
            describe: "History window (e.g. 90d or ISO date)",
          })
          .option("output", {
            type: "string",
            describe: "Output directory",
          })
          .option("format", {
            type: "string",
            choices: ["json", "md", "both"],
            default: "both",
            describe: "Output format",
          })
          .option("top", {
            type: "number",
            default: 30,
            describe: "Number of hotspots to report",
          })
          .option("include", {
            type: "string",
            describe: "Comma-separated include globs",
          })
          .option("exclude", {
            type: "string",
            describe: "Comma-separated exclude globs",
          }),
      async (argv) => {
        const include = argv.include ? argv.include.split(",") : undefined;
        const exclude = argv.exclude ? argv.exclude.split(",") : undefined;
        await reconHistory({
          repo: argv.repo,
          since: argv.since as string,
          output: argv.output as string,
          format: argv.format as any,
          top: argv.top as number,
          include,
          exclude,
        });
      }
    )
    .command(
      "history-diff",
      "Diff two hotspots or dossier reports for regressions",
      (yargs) =>
        yargs
          .option("before", {
            type: "string",
            describe: "Path to before file or directory",
            demandOption: true,
          })
          .option("after", {
            type: "string",
            describe: "Path to after file or directory",
            demandOption: true,
          })
          .option("metric", {
            type: "string",
            choices: ["score", "commits", "churn", "authors"],
            default: "score",
            describe: "Metric to diff",
          })
          .option("focus", {
            type: "number",
            default: 15,
            describe: "Number of top entries to track",
          })
          .option("threshold", {
            type: "number",
            default: 0,
            describe: "Delta threshold for regression/improvement",
          })
          .option("fail-on", {
            type: "string",
            choices: ["none", "regression", "high", "med", "any"],
            default: "none",
            describe: "CI gating mode",
          })
          .option("output", {
            type: "string",
            default: "./out/history-diff",
            describe: "Output directory",
          })
          .option("format", {
            type: "string",
            choices: ["json", "md", "both"],
            default: "both",
            describe: "Output format",
          })
          .option("verbose", {
            type: "boolean",
            default: false,
            describe: "Verbose tracked set listing",
          }),
      async (argv) => {
        const { reconHistoryDiff } = require("./historyDiff");
        try {
          await reconHistoryDiff({
            before: argv.before,
            after: argv.after,
            metric: argv.metric,
            focus: argv.focus,
            threshold: argv.threshold,
            failOn: argv["fail-on"],
            output: argv.output,
            format: argv.format,
            verbose: argv.verbose,
          });
        } catch (err) {
          console.error("Error:", err.message || err);
          process.exit(1);
        }
      }
    )
    .demandCommand(1)
    .help().argv;
}

main();
