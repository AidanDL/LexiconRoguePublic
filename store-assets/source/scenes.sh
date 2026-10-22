#!/bin/zsh
# Generates the recording scenes (profile + one run per scene) from the game source into source/scenes/,
# or with "load <scene>" puts that scene on the emulator and launches the game on it.
# Needs a debuggable build installed (profile mode records smoothly: flutter build apk --profile).
set -e
HERE=${0:A:h}
GAME=${GAME:-$HERE/../../../LexiconRogue}
PKG=com.littlefathom.lexicon_rogue
ADB=${ADB:-adb}

if [[ $1 == load ]]; then
  $ADB shell am force-stop $PKG
  for f in profile run-$2; do
    $ADB push "$HERE/scenes/$f.json" /data/local/tmp/$f.json >/dev/null
  done
  $ADB shell "run-as $PKG sh -c 'mkdir -p app_flutter && cat /data/local/tmp/profile.json > app_flutter/profile.json && cat /data/local/tmp/run-$2.json > app_flutter/run.json && rm -f app_flutter/daily_run.json'"
  $ADB shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
  echo "loaded $2"
  exit 0
fi

tmp="$GAME/test/zz_make_scenes_test.dart"
cp "$HERE/make_scenes_test.dart" "$tmp"
trap 'rm -f "$tmp"' EXIT
(cd "$GAME" && SCENES_OUT="$HERE/scenes" flutter test "$tmp" --reporter=expanded 2>&1 | grep -E "^[a-z0-9]+: |Error|error:" || true)
ls "$HERE/scenes"
