console.error("[cli.ts] loaded");

import yargsFactory from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { registerVerifyClaim } from "./verifyClaim";
import { registerAudit } from "./audit";
import { registerValidateDossier } from "./validateDossier";
import { registerMonitor } from "./monitor";
import { registerCoverage } from "./coverage"; // MUST exist

export function main(argv = process.argv) {
  const y = yargsFactory(hideBin(argv))
    .scriptName("reporecon")
    .strict()
    .recommendCommands()
    .help()
    .wrap(Math.min(120, yargsFactory(hideBin(argv)).terminalWidth()));

  registerVerifyClaim(y);
  registerAudit(y);
  registerValidateDossier(y);
  registerMonitor(y);
  registerCoverage(y);

    return y.parse();
  return y.parse();
}

if (require.main === module) {
  main();
}
