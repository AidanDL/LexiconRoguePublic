#!/bin/zsh
# Renders Lexicon Rogue's videos into Postiz/media/lexicon-rogue/ (layout: Postiz/media/README.md).
# Every video cuts from the prepared recordings in public/clips/ (source/record-all.sh, then ./prep-clips.sh).
# Usage: ./render-all.sh [teaser|all]
set -e
cd ${0:A:h}
MEDIA=~/Documents/personal/little-fathom/Postiz/media/lexicon-rogue
mkdir -p $MEDIA/{shorts,trailer,teasers}
npx remotion render src/index.ts short-teaser-monday $MEDIA/teasers/lexicon-rogue-teaser-monday-9x16.mp4 --log=error
echo "rendered teaser-monday"
[[ $1 == all ]] || exit 0
npx remotion render src/index.ts Promo $MEDIA/trailer/lexicon-rogue-promo.mp4 --log=error
npx remotion still src/index.ts Thumbnail $MEDIA/trailer/lexicon-rogue-thumbnail.png --log=error
for id in one-word glyph-order no-vowels glyph-pack every-tile eight-letters; do
  npx remotion render src/index.ts short-$id $MEDIA/shorts/lexicon-rogue-$id-9x16.mp4 --log=error
  echo "rendered $id"
done
