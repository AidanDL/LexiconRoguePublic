import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Freeze,
  Img,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Lexicon Rogue's look, from the game's lib/ui/theme.dart: walnut desk, parchment, iron-gall ink, gold leaf,
// wax seals; Base blue and Mult red. Display type is Fraunces, body IBM Plex Sans (the game's own fonts).

export const FPS = 30;

export const C = {
  desk: '#1E1712',
  deskLight: '#2C221B',
  panel: '#3A2D24',
  parchment: '#F3E9D2',
  parchmentDark: '#E2D3B0',
  ink: '#2B2118',
  faded: '#B9A889',
  gold: '#D4A82F',
  wax: '#8E1F2F',
  base: '#2F6DB5',
  mult: '#C0392B',
};

/** Size of the prepared gameplay clips (public/clips): the phone screen without its status and navigation bars. */
export const CLIP_W = 1080;
export const CLIP_H = 1958;

export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Fraunces', `url(${staticFile('fonts/Fraunces-Black.ttf')})`, { weight: '900' }),
      new FontFace('Fraunces', `url(${staticFile('fonts/Fraunces-Bold.ttf')})`, { weight: '700' }),
      new FontFace('Plex', `url(${staticFile('fonts/IBMPlexSans-Bold.ttf')})`, { weight: '700' }),
      new FontFace('Plex', `url(${staticFile('fonts/IBMPlexSans-SemiBold.ttf')})`, { weight: '600' }),
    ];
    Promise.all(faces.map((f) => f.load())).then((loaded) => {
      loaded.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    });
  }, [handle]);
};

const LETTERS = 'LEXICONROGUESPELLWORDSBENDRULESBREAKSCORE';
const VALUES: Record<string, number> = { E: 1, A: 1, I: 1, O: 1, N: 1, R: 1, S: 1, T: 1, L: 2, U: 2, D: 2, G: 3, C: 3, M: 3, P: 3, B: 4, W: 4, K: 5, X: 8 };

/** A letter tile as the game draws it: parchment, ink letter, value in the corner. */
export const Tile: React.FC<{ letter: string; size: number; style?: React.CSSProperties }> = ({ letter, size, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.14,
      background: C.parchment,
      boxShadow: `0 ${size * 0.06}px 0 ${C.parchmentDark}, 0 ${size * 0.1}px ${size * 0.2}px rgba(0,0,0,0.45)`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Fraunces',
      fontWeight: 900,
      fontSize: size * 0.62,
      color: C.ink,
      ...style,
    }}
  >
    {letter}
    <span style={{ position: 'absolute', right: size * 0.1, bottom: size * 0.04, fontFamily: 'Plex', fontWeight: 700, fontSize: size * 0.2, opacity: 0.75 }}>
      {VALUES[letter] ?? 1}
    </span>
  </div>
);

/** The walnut desk with faint letter tiles drifting up behind everything, like the game's home screen. */
export const Desk: React.FC<{ glow?: string }> = ({ glow = C.gold }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const n = Math.round((width * height) / 90000);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${glow}22, transparent 60%), radial-gradient(ellipse at 50% 50%, ${C.deskLight}, ${C.desk} 75%)` }}>
      {Array.from({ length: n }, (_, i) => {
        const size = 70 + random(`s${i}`) * 90;
        const speed = 0.5 + random(`v${i}`) * 1.1;
        const span = height + size * 2;
        const y = ((random(`y${i}`) * span - frame * speed) % span + span) % span - size;
        return (
          <Tile
            key={i}
            letter={LETTERS[i % LETTERS.length]}
            size={size}
            style={{
              position: 'absolute',
              left: random(`x${i}`) * (width - size),
              top: y,
              opacity: 0.07 + random(`o${i}`) * 0.06,
              transform: `rotate(${(random(`r${i}`) - 0.5) * 40 + frame * (random(`w${i}`) - 0.5) * 0.3}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** A run of one prepared clip, in seconds of that clip. */
/** A cut of a clip; [hold] freezes its last frame for that many seconds, so a payoff can sink in. */
export type Seg = { clip: string; from: number; to: number; hold?: number };

const playFrames = (s: Seg) => Math.round((s.to - s.from) * FPS);
export const segFrames = (s: Seg) => playFrames(s) + Math.round((s.hold ?? 0) * FPS);
export const totalFrames = (segs: Seg[]) => segs.reduce((a, s) => a + segFrames(s), 0);

/** Fades its children in over the first [frames] and out over the last, of [total]. */
const Fade: React.FC<{ frames: number; total: number; children: React.ReactNode }> = ({ frames, total, children }) => {
  const f = useCurrentFrame();
  const opacity = frames ? interpolate(f, [0, frames, total - frames, total], [0, 1, 1, 0], { extrapolateRight: 'clamp' }) : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** Gameplay, cut from segments back to back, with its own sound effects. [fade] (frames) dips each cut to
 * the screen's background and back, a breath between moments. */
export const Gameplay: React.FC<{ segs: Seg[]; volume?: number; fade?: number }> = ({ segs, volume = 1, fade = 0 }) => {
  let at = 0;
  return (
    <>
      {segs.map((s, i) => {
        const from = at;
        at += segFrames(s);
        const video = (v: number) => (
          <OffthreadVideo
            src={staticFile(`clips/${s.clip}.mp4`)}
            startFrom={Math.round(s.from * FPS)}
            volume={v}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        );
        return (
          <Sequence key={i} from={from} durationInFrames={segFrames(s)}>
            <Fade frames={fade} total={segFrames(s)}>
              <Sequence durationInFrames={playFrames(s)}>{video(volume)}</Sequence>
              {s.hold ? (
                <Sequence from={playFrames(s)}>
                  <Freeze frame={playFrames(s) - 1}>{video(0)}</Freeze>
                </Sequence>
              ) : null}
            </Fade>
          </Sequence>
        );
      })}
    </>
  );
};

/** The phone screen on the desk: rounded, with a soft shadow and a hairline edge. */
export const Screen: React.FC<{ x: number; y: number; h: number; radius?: number; children: React.ReactNode }> = ({ x, y, h, radius = 44, children }) => {
  const w = (h * CLIP_W) / CLIP_H;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        overflow: 'hidden',
        background: C.desk,
        boxShadow: `0 0 0 3px ${C.panel}, 0 40px 90px rgba(0,0,0,0.65)`,
      }}
    >
      {children}
    </div>
  );
};

/** One caption line; words wrapped in *stars* are set in gold. */
const Rich: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith('*') ? (
        <span key={i} style={{ color: C.gold }}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);

/** Caption lines that spring in one after another (and gently settle, no bounce). */
export const Caption: React.FC<{
  lines: string[];
  size: number;
  /** Absolute position; omit [top] to lay the caption out in flow (inside a column). */
  top?: number;
  left?: number;
  right?: number;
  align?: 'center' | 'left';
}> = ({ lines, size, top, left = 60, right = 60, align = 'center' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={top === undefined ? { textAlign: align } : { position: 'absolute', left, right, top, textAlign: align }}>
      {lines.map((line, i) => {
        const s = spring({ frame: frame - i * 4, fps, config: { damping: 14, stiffness: 180, mass: 0.7 } });
        return (
          <div
            key={i}
            style={{
              fontFamily: 'Fraunces',
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.04,
              letterSpacing: '-0.01em',
              color: C.parchment,
              textShadow: `0 ${size * 0.07}px 0 ${C.wax}, 0 0 ${size * 0.5}px rgba(0,0,0,0.85)`,
              opacity: s,
              transform: `translateY(${(1 - s) * size * 0.4}px) scale(${0.92 + 0.08 * s})`,
              transformOrigin: align === 'center' ? '50% 100%' : '0% 100%',
            }}
          >
            <Rich text={line} />
          </div>
        );
      })}
    </div>
  );
};

/** Letter tiles thrown out from a point: the payoff burst. */
export const TileBurst: React.FC<{ cx: number; cy: number; scale?: number }> = ({ cx, cy, scale = 1 }) => {
  const frame = useCurrentFrame();
  if (frame > 45) return null;
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => {
        const a = random(`ba${i}`) * Math.PI * 2;
        const v = (14 + random(`bv${i}`) * 22) * scale;
        const t = frame;
        const size = (40 + random(`bs${i}`) * 40) * scale;
        return (
          <Tile
            key={i}
            letter={LETTERS[(i * 7) % LETTERS.length]}
            size={size}
            style={{
              position: 'absolute',
              left: cx + Math.cos(a) * v * t - size / 2,
              top: cy + Math.sin(a) * v * t + 0.9 * t * t * scale - size / 2,
              transform: `rotate(${t * (random(`br${i}`) - 0.5) * 30}deg)`,
              opacity: interpolate(t, [0, 30, 45], [1, 1, 0]),
            }}
          />
        );
      })}
    </>
  );
};

/** End card: the icon, the name, the promise and where to get it. */
export const EndCard: React.FC<{ cta?: string }> = ({ cta = 'Free on Google Play' }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const k = Math.min(width / 1080, height / 1350);
  const icon = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  const rest = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <Desk />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Img
          src={staticFile('icon.png')}
          style={{ width: 300 * k, height: 300 * k, borderRadius: 66 * k, boxShadow: '0 30px 70px rgba(0,0,0,0.6)', transform: `scale(${icon})` }}
        />
        <div
          style={{
            marginTop: 44 * k,
            fontFamily: 'Fraunces',
            fontWeight: 900,
            fontSize: 132 * k,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: C.parchment,
            opacity: rest,
            transform: `translateY(${(1 - rest) * 30}px)`,
          }}
        >
          Lexicon Rogue
        </div>
        <div style={{ marginTop: 22 * k, fontFamily: 'Plex', fontWeight: 600, fontSize: 40 * k, color: C.faded, opacity: rest }}>
          Spell words. Bend the rules. Break the score.
        </div>
        <div
          style={{
            marginTop: 46 * k,
            fontFamily: 'Plex',
            fontWeight: 700,
            fontSize: 52 * k,
            color: C.ink,
            background: C.gold,
            borderRadius: 999,
            padding: `${16 * k}px ${54 * k}px`,
            boxShadow: `0 ${8 * k}px 0 #8a6a14`,
            opacity: rest,
            transform: `scale(${0.9 + 0.1 * rest})`,
          }}
        >
          {cta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
