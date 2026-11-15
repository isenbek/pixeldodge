#!/usr/bin/env bash
# The game into the app: site/ (the game as build/build.py makes it: one page, Three.js and the fonts) copied to
# public/play/, where the build picks it up and serves it at /play/index.html, a page of its own outside the app's
# frame. Run before every build and before dev (package.json does); public/play/ is not committed, site/ is the source.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$HERE/site/index.html" ] || { echo "no game at site/index.html" >&2; exit 1; }
rm -rf "$HERE/public/play"; mkdir -p "$HERE/public/play"
cp -a "$HERE/site/." "$HERE/public/play/"
rm -f "$HERE/public/play/_test.html"
