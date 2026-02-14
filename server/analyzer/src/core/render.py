"""
Phase 3: Mode Rendering

Renders analysis reports from EvidencePack only.
Never re-reads extraction artifacts directly.
Never re-runs extraction or analysis.

Modes:
  - engineer: Full file:line references, raw evidence, verbose
  - auditor: VERIFIED + UNKNOWN only, evidence anchors, no inferred narrative
  - executive: Metrics first (DCI), surface area summaries, no file:line clutter
"""

from typing import Dict, Any, List
from pathlib import Path


def render_report(pack: Dict[str, Any], mode: str = "engineer") -> str:
    if mode == "engineer":
        return _render_engineer(pack)
    elif mode == "auditor":
        return _render_auditor(pack)
    elif mode == "executive":
        return _render_executive(pack)
    else:
        return _render_engineer(pack)


def save_report(content: str, output_dir: Path, mode: str) -> Path:
    filename = f"REPORT_{mode.upper()}.md"
    path = output_dir / filename
    with open(path, "w") as f:
        f.write(content)
    return path


def _render_evidence_anchor(ev: dict) -> str:
    display = ev.get("display", ev.get("path", "?"))
    snippet_hash = ev.get("snippet_hash", "")
    if snippet_hash:
        return f"`{display}` (hash: `{snippet_hash}`)"
    return f"`{display}`"


def _get_verified_sections(pack: Dict[str, Any]) -> Dict[str, List[Dict]]:
    verified = pack.get("verified", {})
    if isinstance(verified, dict):
        return verified
    return {}


def _count_verified_claims(pack: Dict[str, Any]) -> int:
    total = 0
    for section_claims in _get_verified_sections(pack).values():
        if isinstance(section_claims, list):
            total += len(section_claims)
    return total


def _render_engineer(pack: Dict[str, Any]) -> str:
    lines = [
        f"# Program Totality Report — Engineer View",
        f"",
        f"**EvidencePack Version:** {pack.get('evidence_pack_version', '?')}",
        f"**Generated:** {pack.get('generated_at', '?')}",
        f"**Mode:** {pack.get('mode', '?')}",
        f"**Run ID:** {pack.get('run_id', '?')}",
        f"",
        "---",
        "",
    ]

    summary = pack.get("summary", {})
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Total files scanned: {summary.get('total_files', 0)}")
    lines.append(f"- Total claims: {summary.get('total_claims', 0)}")
    lines.append(f"- Verified claims: {summary.get('verified_claims', 0)}")
    lines.append(f"- Unknown categories: {summary.get('unknown_categories', 0)}")
    lines.append(f"- Verified categories: {summary.get('verified_categories', 0)}")
    lines.append("")

    dci = pack.get("metrics", {}).get("dci", {})
    lines.append("## Deterministic Coverage Index (DCI)")
    lines.append("")
    lines.append(f"**Score:** {dci.get('score', 0):.2%}")
    lines.append(f"**Formula:** {dci.get('formula', 'N/A')}")
    components = dci.get("components", {})
    for k, v in components.items():
        lines.append(f"- {k}: {v:.2%}")
    lines.append(f"")
    lines.append(f"*{dci.get('interpretation', '')}*")
    lines.append("")

    verified_sections = _get_verified_sections(pack)
    for section_name, claims in sorted(verified_sections.items()):
        lines.append(f"## Verified: {section_name}")
        lines.append("")
        if not isinstance(claims, list) or not claims:
            lines.append("No verified claims in this section.")
            lines.append("")
            continue
        for claim in claims:
            lines.append(f"### {claim.get('statement', '?')}")
            lines.append(f"Confidence: {claim.get('confidence', 0):.0%}")
            for ev in claim.get("evidence", []):
                if isinstance(ev, dict):
                    lines.append(f"- Evidence: {_render_evidence_anchor(ev)}")
            lines.append("")

    lines.append("## Known Unknown Surface")
    lines.append("")
    lines.append("| Category | Status | Notes |")
    lines.append("|----------|--------|-------|")
    for u in pack.get("unknowns", []):
        status = u.get("status", "UNKNOWN")
        lines.append(f"| {u.get('category', '?')} | {status} | {u.get('notes', '')} |")
    lines.append("")

    hashes = pack.get("hashes", {}).get("snippets", [])
    lines.append(f"## Snippet Hashes ({len(hashes)} total)")
    lines.append("")
    for h in hashes[:20]:
        lines.append(f"- `{h}`")
    if len(hashes) > 20:
        lines.append(f"- ... and {len(hashes) - 20} more")
    lines.append("")

    return "\n".join(lines)


def _render_auditor(pack: Dict[str, Any]) -> str:
    lines = [
        f"# Program Totality Report — Auditor View",
        f"",
        f"**EvidencePack Version:** {pack.get('evidence_pack_version', '?')}",
        f"**Generated:** {pack.get('generated_at', '?')}",
        f"",
        "This report shows only VERIFIED and UNKNOWN findings.",
        "No inferred narrative is included.",
        "",
        "---",
        "",
    ]

    lines.append("## Known Unknown Surface")
    lines.append("")
    lines.append("| Category | Status | Description | Evidence Anchors |")
    lines.append("|----------|--------|-------------|------------------|")
    for u in pack.get("unknowns", []):
        status = u.get("status", "UNKNOWN")
        ev_anchors = ", ".join(
            _render_evidence_anchor(e) for e in u.get("evidence", []) if isinstance(e, dict)
        ) or "—"
        lines.append(f"| {u.get('category', '?')} | **{status}** | {u.get('description', '')} | {ev_anchors} |")
    lines.append("")

    verified_sections = _get_verified_sections(pack)
    for section_name, claims in sorted(verified_sections.items()):
        if not isinstance(claims, list) or not claims:
            continue
        lines.append(f"## Verified: {section_name}")
        lines.append("")
        for claim in claims:
            lines.append(f"- **{claim.get('statement', '?')}**")
            lines.append(f"  Confidence: {claim.get('confidence', 0):.0%}")
            for ev in claim.get("evidence", []):
                if isinstance(ev, dict):
                    lines.append(f"  - Evidence anchor: {_render_evidence_anchor(ev)}")
            lines.append("")

    dci = pack.get("metrics", {}).get("dci", {})
    lines.append("## DCI Score")
    lines.append("")
    lines.append(f"**{dci.get('score', 0):.2%}** — {dci.get('interpretation', '')}")
    lines.append("")

    return "\n".join(lines)


def _render_executive(pack: Dict[str, Any]) -> str:
    summary = pack.get("summary", {})
    dci = pack.get("metrics", {}).get("dci", {})
    unknowns = pack.get("unknowns", [])
    unknown_count = len([u for u in unknowns if u.get("status") == "UNKNOWN"])
    verified_cat_count = len([u for u in unknowns if u.get("status") == "VERIFIED"])

    lines = [
        f"# Program Totality Report — Executive Summary",
        f"",
        f"**Generated:** {pack.get('generated_at', '?')}",
        f"",
        "---",
        "",
        "## Key Metrics",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| DCI Score | {dci.get('score', 0):.1%} |",
        f"| Files Scanned | {summary.get('total_files', 0)} |",
        f"| Total Claims | {summary.get('total_claims', 0)} |",
        f"| Verified Claims | {summary.get('verified_claims', 0)} |",
        f"| Unknown Categories | {unknown_count} / {len(unknowns)} |",
        f"| Verified Categories | {verified_cat_count} / {len(unknowns)} |",
        "",
        f"*{dci.get('interpretation', '')}*",
        "",
        "## Coverage Breakdown",
        "",
    ]

    components = dci.get("components", {})
    for k, v in components.items():
        bar_filled = int(v * 20)
        bar = "#" * bar_filled + "-" * (20 - bar_filled)
        lines.append(f"- **{k}**: [{bar}] {v:.0%}")
    lines.append("")

    lines.append("## Verified Surface Area")
    lines.append("")
    verified_sections = _get_verified_sections(pack)
    if verified_sections:
        for section_name, claims in sorted(verified_sections.items()):
            count = len(claims) if isinstance(claims, list) else 0
            lines.append(f"- {section_name}: {count} verified claim(s)")
    else:
        lines.append("- No verified claims with deterministic evidence.")
    lines.append("")

    if unknown_count > 0:
        lines.append("## Operational Blind Spots")
        lines.append("")
        lines.append("*The following categories lack deterministic evidence.*")
        lines.append("")
        for u in unknowns:
            if u.get("status") == "UNKNOWN":
                lines.append(f"- **{u.get('category', '?')}**: {u.get('description', '')}")
        lines.append("")

    return "\n".join(lines)
