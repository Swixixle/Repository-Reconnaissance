import typer
import sys
import os
import json
import asyncio
from typing import Optional
from pathlib import Path

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from analyzer import Analyzer

app = typer.Typer()

@app.command()
def analyze(
    repo_url: str,
    output_dir: str = typer.Option(..., "--output-dir", "-o"),
):
    """
    Analyze a GitHub repository and generate a dossier.
    """
    console = Analyzer.get_console()
    console.print(f"[bold green]Starting analysis for:[/bold green] {repo_url}")
    
    try:
        analyzer = Analyzer(repo_url, output_dir)
        asyncio.run(analyzer.run())
        console.print(f"[bold green]Analysis complete![/bold green] Results in {output_dir}")
    except Exception as e:
        console.print(f"[bold red]Error during analysis:[/bold red] {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    app()
