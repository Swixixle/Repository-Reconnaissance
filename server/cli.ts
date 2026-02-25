#!/usr/bin/env node

import yargsFactory from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { registerVerifyClaim } from "./verifyClaim";
import { registerAudit } from "./audit";
import { registerDiffDossier } from "./diffDossier";
import { registerValidateDossier } from "./validateDossier";

export function main(argv = process.argv) {
  const y = yargsFactory(hideBin(argv))
    .scriptName("reporecon")
    .strict()
    .demandCommand(1)
    .help();

  registerVerifyClaim(y);
  registerAudit(y);
  registerValidateDossier(y);
  registerDiffDossier(y);

  return y.parse();
}

if (require.main === module) {
  main();
}
