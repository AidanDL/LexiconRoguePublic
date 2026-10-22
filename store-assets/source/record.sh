#!/bin/zsh
# Records one gameplay clip from a scene (see scenes.sh), on an emulator with a 1080x2160 screen.
# Usage: record.sh <scene> <name> <seconds> [pre-step ...] -- [step ...]
#   pre-steps run before recording starts; steps run while recording.
#   step: word:0,1,2  tap those hand slots (0 = leftmost) as if typing
#         play · swap · x,y tap · hold:x,y:ms · swipe:x1,y1,x2,y2 · drag:x1,y1,x2,y2 · wait:S
# The run is opened from the home screen's Continue button before the pre-steps.
# Output: ../video/raw-clips/<name>.mp4, with the game's audio (needs scrcpy: brew install scrcpy)
set -e
ADB=${ADB:-adb}
HERE=${0:A:h}
scene=$1 name=$2 secs=$3
shift 3
pre=() post=() seen=0
for a in "$@"; do if [[ $a == -- ]]; then seen=1; elif (( seen )); then post+=$a; else pre+=$a; fi; done

slot() { echo $(( 97 + $1 * 1265 / 10 )); }
run() {
  case $1 in
    word:*) for i in ${(s:,:)${1#word:}}; do $ADB shell input tap $(slot $i) 1750; sleep ${GAP:-0.18}; done ;;
    play) $ADB shell input tap 833 1907 ;;
    swap) $ADB shell input tap 178 1907 ;;
    hold:*) local r=${1#hold:}; local xy=${r%:*} ms=${r##*:}; $ADB shell input swipe ${xy%,*} ${xy#*,} ${xy%,*} ${xy#*,} $ms ;;
    swipe:*) $ADB shell input swipe ${(s:,:)${1#swipe:}} 600 ;;
    drag:*) local c=(${(s:,:)${1#drag:}})   # long-press, then slide (reorders Glyphs)
      $ADB shell "input motionevent DOWN $c[1] $c[2]; sleep 0.9; for i in 1 2 3 4 5 6 7 8 9 10; do input motionevent MOVE \$(( $c[1] + ($c[3] - $c[1]) * i / 10 )) \$(( $c[2] + ($c[4] - $c[2]) * i / 10 )); sleep 0.04; done; sleep 0.3; input motionevent UP $c[3] $c[4]" ;;
    wait:*) sleep ${1#wait:} ;;
    *) $ADB shell input tap ${1%,*} ${1#*,} ;;
  esac
}

"$HERE/scenes.sh" load $scene >/dev/null
sleep ${BOOT:-9}
run 540,1015   # Continue run
sleep 2.5
for s in $pre; do run $s; done
mkdir -p "$HERE/../video/raw-clips"
out="$HERE/../video/raw-clips/$name.mp4"
rm -f "$out"
# scrcpy records the game's own audio with the video (the screenrecord tool has no audio).
scrcpy --no-window --no-control --record="$out" --time-limit=$secs --video-bit-rate=20M --max-fps=60 --audio-codec=aac --audio-bit-rate=192K >/dev/null 2>&1 &
rec=$!
sleep 1.2
for s in $post; do run $s; done
wait $rec
[[ -s "$out" ]]
echo "recorded $name"
