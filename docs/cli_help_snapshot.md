

```
reporecon [command]

Commands:
	reporecon verify-claim <claim_id>         Verify a single claim hash against a repo snapshot
	reporecon audit <dossier> --repo-path     Audit all VERIFIED claims in dossier <path>
	reporecon validate-dossier <dossier>      Validate dossier.json against v2 schema
	reporecon diff-dossier                    Compare two dossier files and output longitudinal UNKNOWNs, commit delta, and trust signals.
	reporecon monitor <repo>                  Run longitudinal drift analysis comparing HEAD to baseline dossier.

Options:
	--version  Show version number                                       [boolean]
	--help     Show help                                                 [boolean]
```

---

```
reporecon monitor <repo>

Run longitudinal drift analysis comparing HEAD to baseline dossier.

Positionals:
	repo  Path to git repo                                     [string] [required]

Options:
	--version   Show version number                                      [boolean]
	--help      Show help                                                [boolean]
	--baseline  Path to baseline dossier_v2 JSON               [string] [required]
	--out       Path to output drift report JSON               [string] [required]
```


