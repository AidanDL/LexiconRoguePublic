# Lexicon Rogue social videos

Real gameplay, recorded from the game and edited in [Remotion](https://remotion.dev), following
`Postiz/BRAND_GUIDE.md` and the launch marketing playbook.

| Output (`video/out/`) | Spec |
|---|---|
| `lexicon-rogue-promo.mp4` | 1920×1080, 35.6 s trailer (YouTube, Reddit, store listing) |
| `lexicon-rogue-thumbnail.png` | 1280×720 YouTube thumbnail |
| `shorts/lexicon-rogue-<idea>-9x16.mp4` | 6 shorts, 1080×1920 (Shorts, Reels, TikTok, Facebook, Threads, Bluesky) |
| `feed/lexicon-rogue-<idea>-4x5.mp4` | the same 6 at 1080×1350 (feeds, Reddit) |
| `POSTING-GUIDE.md` | titles, captions, hashtags, links and the two-week schedule per platform |

## Remaking them

1. **Device:** the Android35 emulator at 1080×2160 (`adb shell wm size 1080x2160`), a clean demo status bar, and a
   **profile** build of the game installed (`flutter build apk --profile --target-platform android-arm64` in the game
   repo: AOT-compiled so animations are smooth, and debuggable so saves can be loaded). The network must be on: the
   first launch fetches the word list.
2. **Clips:** `source/record-all.sh` (about 6 minutes, needs `scrcpy` for the audio: `brew install scrcpy`).
   - `source/make_scenes_test.dart` builds each scene's game state with the real rules (`source/scenes.sh` runs it inside
     the game repo and prints each scene's score, so the numbers in the videos are checked against the game).
   - `source/record.sh` loads a scene, opens the run, and records while tapping out the word.
   - The profile turns the game's music off, so clips carry only the sound effects; the edit lays the music under them whole.
3. **Prepare:** `video/prep-clips.sh` crops the status and navigation bars, makes the clips 30 fps and raises the effects.
4. **Render:** `cd video && npm install && ./render-all.sh` (`npm run studio` to preview and adjust).
   - `src/Shorts.tsx`: one spec per short (clip segments, hook, payoff captions and their timing, zoom, music offset).
   - `src/Promo.tsx`: the trailer's scenes. `src/Common.tsx`: palette, fonts, desk background, end card.

Fonts (Fraunces, IBM Plex Sans), music and sound effects are copied from the game (`assets/`); all are the game's own
or OFL-licensed.
