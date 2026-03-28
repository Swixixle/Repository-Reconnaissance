# Debrief — public overview (internal reference)

## What this is

**Debrief** reads a codebase and delivers a verified, plain-language brief: operational posture, risks, API surface, and structured outputs backed by file-level evidence. The internal evidence and receipt layer is **PTA (Proof Trust Anchor)** — cryptographic hashing, optional signing, and the time-based evidence trail described in the main README.

## Who it's for

* Engineering leadership and platform teams evaluating operational readiness
* DevOps and SRE teams onboarding to unfamiliar codebases
* Security and compliance reviewers requiring evidence-backed system documentation
* Technical due diligence teams assessing acquisition targets or vendor systems
* Organizations that need consistent, reproducible documentation standards across projects

## What problem it solves

In complex software environments, understanding operational reality is fragile and inconsistent:

* Documentation falls out of sync with code
* Deployment requirements are scattered across multiple files
* Onboarding to unfamiliar systems requires weeks of tribal knowledge transfer
* Compliance reviews lack structured evidence trails
* Operational gaps remain invisible until production incidents

Debrief turns static code artifacts into **structured, evidence-backed operational documentation** that technical operators and non-technical stakeholders can use.

## What you get

* **Operator dashboards** (`operate.json`) — boot commands, integration points, deployment config, readiness scores, and operational gaps with severity ratings
* **Evidence-backed claims** — findings cite file:line evidence with cryptographic verification (SHA-256 snippet hashes) where applicable
* **Human-readable dossiers** (`DOSSIER.md`) — markdown summaries for stakeholder review
* **CI and webhooks** — optional GitHub-triggered analysis with a results feed
* **Explicit uncertainty tracking** — separation between EVIDENCED, INFERRED, and UNKNOWN findings
* **Time-based evidence trail** — scheduled snapshots with chained, verifiable receipts (see root `README.md`)

## What makes it different

* **Evidence-first posture** — findings are anchored to verifiable source artifacts where marked EVIDENCED
* **Static-artifact analysis** — reproducible from source and config (runtime observation is out of scope)
* **Clear verification model** — EVIDENCED claims include hashes; UNKNOWN items are labeled explicitly
* **Operator-focused outputs** — operational readiness rather than decorative architecture diagrams
* **Multi-artifact support** — application code, infrastructure-as-code, data pipelines, ML workflows, policy-as-code

## Typical use cases

* Operational onboarding and unfamiliar codebase ramp-up
* Pre-deployment readiness assessment
* Technical due diligence and vendor evaluation
* Compliance-oriented documentation workflows
* CI/CD quality gates for documentation and posture drift
* Multi-repo inventory and standardization
* Infrastructure migration planning

## Integration overview (high level)

* **CLI** — Python `debrief` (see `pyproject.toml`) and Node `npm run debrief`
* **Web UI** — React client with optional Clerk auth and Stripe billing
* **API** — Express routes for ingestion and runs
* **Deterministic mode** — paths that avoid LLM dependence where configured

Specific integration patterns and deployment architectures are case-specific.

## Trust boundaries and limitations

* **Static analysis** — analyzes source files, configuration, and lockfiles; does not observe live runtime behavior by default
* **Not a substitute for penetration testing** — structural and posture observations, not exploit validation
* **Evidence scope** — "EVIDENCED" means anchored to a hash-verified snippet; it does not prove correctness or security
* **LLM outputs** — when used, interpretive content is labeled accordingly; not deterministic ground truth

## Inquiries

See `docs/internal/CONTACT.md`.

## Disclosure notice

Public documentation describes product behavior and interfaces at a high level. Threat models, proprietary analysis methods, and internal cryptographic details may not be fully disclosed here.
