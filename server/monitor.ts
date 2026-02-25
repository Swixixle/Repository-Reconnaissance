import { Argv } from 'yargs';
import { monitorDrift } from '../src/claims/monitorDrift';

export function registerMonitor(y: Argv) {
  y.command(
    'monitor <repo>',
    'Run longitudinal drift analysis comparing HEAD to baseline dossier.',
    (yargs) =>
      yargs
        .positional('repo', {
          type: 'string',
          describe: 'Path to git repo',
        })
        .option('baseline', {
          type: 'string',
          demandOption: true,
          describe: 'Path to baseline dossier_v2 JSON',
        })
        .option('out', {
          type: 'string',
          demandOption: true,
          describe: 'Path to output drift report JSON',
        }),
    async (argv) => {
      try {
        const { repo, baseline, out } = argv;
        const result = monitorDrift(repo, baseline, out);
        console.log('Drift report written to', out);
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
      } catch (err) {
        console.error('Monitor failed:', err.message);
        process.exit(2);
      }
    }
  );
}
