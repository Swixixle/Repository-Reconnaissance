Snapshot of the Node verification CLI (`npm run debrief -- <args>`). The process `scriptName` is `debrief` (legacy npm script: `reporecon`).

```
debrief [command]

Commands:
	debrief verify-claim <claim_id>         Verify a single claim hash against a repo snapshot
	debrief audit <dossier> --repo-path     Audit all VERIFIED claims in dossier <path>
	debrief validate-dossier <dossier>      Validate dossier.json against v2 schema
	debrief diff-dossier                    Compare two dossier files and output longitudinal UNKNOWNs, commit delta, and trust signals.
	debrief monitor <repo>                  Run longitudinal drift analysis comparing HEAD to baseline dossier.

Options:
	--version  Show version number                                       [boolean]
	--help     Show help                                                 [boolean]
```

---

```
debrief monitor <repo>

Run longitudinal drift analysis comparing HEAD to baseline dossier.

Positionals:
	repo  Path to git repo                                     [string] [required]

Options:
	--version   Show version number                                      [boolean]
	--help      Show help                                                [boolean]
	--baseline  Path to baseline dossier_v2 JSON               [string] [required]
	--out       Path to output drift report JSON               [string] [required]
```


