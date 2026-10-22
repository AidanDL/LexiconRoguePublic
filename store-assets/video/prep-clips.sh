#!/bin/zsh
# raw-clips/*.mp4 (from ../source/record-all.sh) -> public/clips/: status and navigation bars cropped off
# (1080x1958), constant 30 fps, and the game's sound effects raised 28 dB (the emulator captures them at about -32 dB peak).
set -e
cd ${0:A:h}
mkdir -p public/clips
for f in raw-clips/*.mp4; do
  ffmpeg -v error -y -i $f -vf "crop=1080:1958:0:76,fps=30" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p \
    -af "volume=28dB,alimiter=limit=0.9" -c:a aac -b:a 192k -ar 48000 public/clips/${f:t}
  echo "prepared ${f:t}"
done
