#!/usr/bin/env bash
# Refreshes the Codex from the game source: src/content/catalog.json, public/glyphs/*.svg and public/inks/*.svg.
# Usage: scripts/sync-catalog.sh [path to the LexiconRogue repo, default ../LexiconRogue]
set -euo pipefail

site="$(cd "$(dirname "$0")/.." && pwd)"
game="$(cd "${1:-$site/../LexiconRogue}" && pwd)"
tmp_test="$game/test/zz_export_catalog_test.dart"

cp "$site/scripts/export_catalog_test.dart" "$tmp_test"
trap 'rm -f "$tmp_test"' EXIT
(cd "$game" && CATALOG_OUT="$site/src/content/catalog.json" flutter test "$tmp_test" --reporter=compact)

# Art: every Glyph's illustration and every Ink's icon, replacing the old sets.
rm -rf "$site/public/glyphs" "$site/public/inks"
mkdir -p "$site/public/glyphs" "$site/public/inks"
node -e '
  const c = require(process.argv[1]);
  console.log(c.glyphs.map((g) => g.id).join("\n"));
' "$site/src/content/catalog.json" | while read -r id; do cp "$game/assets/glyphs/$id.svg" "$site/public/glyphs/"; done
node -e '
  const c = require(process.argv[1]);
  console.log([...new Set(c.inks.map((i) => i.icon))].join("\n"));
' "$site/src/content/catalog.json" | while read -r icon; do cp "$game/tool/icons/svg/$icon.svg" "$site/public/inks/"; done

echo "Synced $(ls "$site/public/glyphs" | wc -l | tr -d ' ') Glyph and $(ls "$site/public/inks" | wc -l | tr -d ' ') Ink images."
