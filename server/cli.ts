#!/usr/bin/env node

import yargsFactory from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { registerVerifyClaim } from "./verifyClaim";
import { registerAudit } from "./audit";
import { registerValidateDossier } from "./validateDossier";
import { registerDiffDossier } from "./diffDossier";
import { registerMonitor } from "./monitor";

function main(argv = process.argv) {
  const y = yargsFactory(hideBin(argv))
    .scriptName("reporecon")
    .strict()
    .demandCommand(1)
    .help();

  registerVerifyClaim(y);
  registerAudit(y);
  registerValidateDossier(y);
  registerDiffDossier(y);
  registerMonitor(y);

  y.parse();
}

if (require.main === module) {
  main(process.argv);
}
