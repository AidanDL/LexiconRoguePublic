#!/bin/zsh
# Renders a 512×512 icon per Play Billing product (Play Console → Monetize → Products) from the game's own art
# into Postiz/media/lexicon-rogue/iap-icons/<product id>.png.
set -e
HERE=${0:A:h}
GAME=${GAME:-$HERE/../../../LexiconRogue}
OUT=${OUT:-$HERE/../../../../Postiz/media/lexicon-rogue/iap-icons}
tmp="$GAME/test/zz_make_iap_icons_test.dart"
cp "$HERE/make_iap_icons_test.dart" "$tmp"
trap 'rm -f "$tmp"' EXIT
(cd "$GAME" && ICONS_OUT="${OUT:A}" flutter test "$tmp" --reporter=expanded 2>&1 | grep -E "^[a-z_0-9]+: |Error|error:|Expected|Exception" || true)
