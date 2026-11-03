#!/bin/zsh
# raw-clips/*.mp4 (from ../source/record-all.sh) -> public/clips/: status and navigation bars cropped off
# (1080x1958), constant 30 fps, and the game's sound effects raised 28 dB (the emulator captures them at about -32 dB peak).
# scrcpy's audio arrives about 0.1 s after the picture (measured on final.mp4: each scoring tick sounds 0.10-0.12 s after
# the chip changes), so the sound is moved AUDIO_LEAD seconds earlier.
# Usage: ./prep-clips.sh [name ...]  (default: every raw clip)
set -e
cd ${0:A:h}
mkdir -p public/clips
AUDIO_LEAD=${AUDIO_LEAD:-0.1}
files=(raw-clips/*.mp4); (( $# )) && files=(${@/#/raw-clips/}) && files=(${files/%/.mp4})
for f in $files; do
  ffmpeg -v error -y -i $f -itsoffset -$AUDIO_LEAD -i $f -map 0:v -map 1:a -vf "crop=1080:1958:0:76,fps=30" \
    -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p \
    -af "volume=28dB,alimiter=limit=0.9" -c:a aac -b:a 192k -ar 48000 public/clips/${f:t}
  echo "prepared ${f:t}"
done
