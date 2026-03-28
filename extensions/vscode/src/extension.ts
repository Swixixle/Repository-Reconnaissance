// STUB: VS Code extension entry — minimal “open Debrief in browser” command.
// Planned: Deeper workspace integration (local analyze, status).
// Status: Not production-ready. Do not ship as supported product surface without roadmap.

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand("debrief.analyzeFolder", (uri: vscode.Uri) => {
    vscode.env.openExternal(vscode.Uri.parse(`https://debrief.app/analyze?path=${encodeURIComponent(uri.fsPath)}`));
  });
  context.subscriptions.push(cmd);
}

export function deactivate() {}
