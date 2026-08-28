#!/usr/bin/env sh
set -eu
repo="B-Divyesh/sf-tax-evidence-pack"; base="https://github.com/$repo/releases/latest/download"
case "$(uname -s)" in Darwin) key="macos";; Linux) key="linux";; *) echo "Tax Evidence Pack supports macOS and Linux from this installer." >&2; exit 1;; esac
tmp="${TMPDIR:-/tmp}/tax-evidence-pack-$$"; mkdir -p "$tmp"; trap 'rm -rf "$tmp"' EXIT
curl -fsSL "$base/latest.json" -o "$tmp/latest.json"
url="$(node -e "const x=require('$tmp/latest.json'); console.log(x.platforms['$key'].url)")"; sum="$(node -e "const x=require('$tmp/latest.json'); console.log(x.platforms['$key'].sha256)")"
file="$tmp/${url##*/}"; curl -fL "$url" -o "$file"; actual="$(shasum -a 256 "$file" | awk '{print $1}')"; [ "$actual" = "$sum" ] || { echo "Checksum verification failed." >&2; exit 1; }
echo "Verified $file"; if [ "$key" = "macos" ]; then open "$file"; echo "Opened verified DMG. Drag Tax Evidence Pack to Applications; first launch may require right-click → Open."; else chmod +x "$file"; mkdir -p "$HOME/.local/bin"; cp "$file" "$HOME/.local/bin/tax-evidence-pack.AppImage"; echo "Installed verified AppImage to $HOME/.local/bin/tax-evidence-pack.AppImage"; fi
