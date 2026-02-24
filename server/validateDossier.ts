import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs";
import Ajv from "ajv";

async function validateDossierCLI() {
  yargs(hideBin(process.argv))
    .command(
      "validate-dossier <dossier>",
      "Validate dossier.json against v2 schema",
      (yargs) =>
        yargs.option("schema", {
          type: "string",
          describe: "Path to schema file",
          default: "schemas/dossier_v2.schema.json",
        }),
      async (argv) => {
        const dossierPath = argv.dossier as string;
        const schemaPath = argv.schema as string;
        let dossier, schema;
        try {
          dossier = JSON.parse(fs.readFileSync(dossierPath, "utf8"));
        } catch (e) {
          console.error("ERROR: Failed to load dossier.");
          process.exit(1);
        }
        try {
          schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
        } catch (e) {
          console.error("ERROR: Failed to load schema.");
          process.exit(1);
        }
        const ajv = new Ajv({ strict: false });
        const validate = ajv.compile(schema);
        const valid = validate(dossier);
        if (!valid) {
          console.error("Validation failed:", validate.errors);
          process.exit(2);
        }
        console.log("Dossier is valid.");
        process.exit(0);
      }
    )
    .demandCommand(1)
    .help().argv;
}

validateDossierCLI();
