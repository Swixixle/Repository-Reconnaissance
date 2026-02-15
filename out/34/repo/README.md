# prompt-box (pb)

A safety-first command gate for pasted terminal commands.

## What it does
- Reads commands from stdin (or clipboard via `pb clip`)
- Classifies each command: ALLOW / REVIEW / BLOCK
- Shows a plan
- Optionally runs only ALLOW commands after you type YES

## Install (local)
cd ~/prompt-box
chmod +x pb
sudo ln -sf "$(pwd)/pb" /usr/local/bin/pb

## Usage
printf "pwd\nls -la\n" | pb check
printf "pwd\nls -la\n" | pb run

## Security guarantees
- No shell=True
- Uses shlex.split
- No implicit pipes, redirects, or globbing
