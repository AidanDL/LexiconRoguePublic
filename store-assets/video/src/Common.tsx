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

/** The game's background as it comes out of the prepared clips (a shade under C.desk after encoding): fills any part of
 * a framed look the clip doesn't reach, so the edge doesn't show. */
export const CLIP_BG = '#1A160F';

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

/** A cut of a clip, in seconds of that clip; [hold] freezes its last frame for that many seconds, so a payoff can
 * sink in. [focus] (framed looks only) is the part of the clip to fill the frame with: its centre and width in clip
 * pixels (1080×1958); the cut punches in on it. */
export type Focus = { x: number; y: number; w: number };
export type Seg = { clip: string; from: number; to: number; hold?: number; focus?: Focus };

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
export const Gameplay: React.FC<{ segs: Seg[]; volume?: number; fade?: number; box?: { w: number; h: number } }> = ({
  segs,
  volume = 1,
  fade = 0,
  box,
}) => {
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
              <Framed box={box} focus={s.focus}>
                <Sequence durationInFrames={playFrames(s)}>{video(volume)}</Sequence>
                {s.hold ? (
                  <Sequence from={playFrames(s)}>
                    <Freeze frame={playFrames(s) - 1}>{video(0)}</Freeze>
                  </Sequence>
                ) : null}
              </Framed>
            </Fade>
          </Sequence>
        );
      })}
    </>
  );
};

/** Critically damped (no overshoot): the framed looks' punch-ins and captions settle, they don't bounce. */
const SETTLE = { damping: 26, stiffness: 170, mass: 1 };

/** Places a whole clip so its [focus] fills [box], punching in from slightly wide as the cut starts. Without a box
 * the clip simply fills its parent (the phone look). */
const Framed: React.FC<{ box?: { w: number; h: number }; focus?: Focus; children: React.ReactNode }> = ({ box, focus, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!box) return <>{children}</>;
  const f = focus ?? { x: CLIP_W / 2, y: CLIP_H / 2, w: Math.min(CLIP_W, (box.w / box.h) * CLIP_H) };
  const k = (box.w / f.w) * (0.9 + 0.1 * spring({ frame, fps, config: SETTLE }));
  return (
    <div style={{ position: 'absolute', left: box.w / 2 - f.x * k, top: box.h / 2 - f.y * k, width: CLIP_W * k, height: CLIP_H * k }}>
      {children}
    </div>
  );
};

/** A rounded window onto the game, for the framed looks: a crop of the screen rather than the whole phone. */
export const Window: React.FC<{ x: number; y: number; w: number; h: number; radius?: number; edge?: string; children: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  radius = 40,
  edge = 'rgba(0,0,0,0.25)',
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: radius,
      overflow: 'hidden',
      background: CLIP_BG,
      boxShadow: `0 0 0 2px ${edge}, 0 24px 60px rgba(0,0,0,0.35)`,
    }}
  >
    {children}
  </div>
);

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
const Rich: React.FC<{ text: string; accent?: string }> = ({ text, accent = C.gold }) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith('*') ? (
        <span key={i} style={{ color: accent }}>
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

/** Caption set flat in ink on paper (the close-up look): heavy Fraunces, tight tracking, *stars* in wax red. */
export const InkCaption: React.FC<{ lines: string[]; size: number; top: number }> = ({ lines, size, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top }}>
      {lines.map((line, i) => {
        const s = spring({ frame: frame - i * 3, fps, config: SETTLE });
        return (
          <div
            key={i}
            style={{
              fontFamily: 'Fraunces',
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              color: C.ink,
              opacity: s,
              transform: `translateY(${(1 - s) * 24}px)`,
            }}
          >
            <Rich text={line} accent={C.wax} />
          </div>
        );
      })}
    </div>
  );
};

/** A small stamped label (the close-up look's "DAILY #3"): wax ink, slightly tilted like the game's month stamps. */
export const Sticker: React.FC<{ text: string; top: number; left?: number; color?: string; tilt?: number }> = ({
  text,
  top,
  left = 70,
  color = C.wax,
  tilt = -3,
}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left,
      transform: `rotate(${tilt}deg)`,
      fontFamily: 'Plex',
      fontWeight: 700,
      fontSize: 38,
      letterSpacing: '0.08em',
      color,
      border: `5px solid ${color}`,
      borderRadius: 14,
      padding: '6px 22px',
    }}
  >
    {text}
  </div>
);

/** TikTok-native text: each line on its own rounded white plate, black IBM Plex Sans, *stars* in wax red (the POV
 * look). Plates cut in, no animation, like typed text. */
export const PlateCaption: React.FC<{ lines: string[]; size: number; top: number }> = ({ lines, size, top }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top, textAlign: 'center' }}>
    {lines.map((line, i) => (
      <div key={i} style={{ marginTop: i ? size * 0.12 : 0 }}>
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'Plex',
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.2,
            color: '#111',
            background: '#fff',
            borderRadius: size * 0.22,
            padding: `${size * 0.08}px ${size * 0.3}px`,
          }}
        >
          <Rich text={line} accent={C.wax} />
        </span>
      </div>
    ))}
  </div>
);

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
export const EndCard: React.FC<{ cta?: string; bg?: string; fg?: string; sub?: string }> = ({
  cta = 'Free on Google Play',
  bg,
  fg = C.parchment,
  sub = C.faded,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const k = Math.min(width / 1080, height / 1350);
  const icon = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  const rest = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: bg }}>
      {bg ? null : <Desk />}
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
            color: fg,
            opacity: rest,
            transform: `translateY(${(1 - rest) * 30}px)`,
          }}
        >
          Lexicon Rogue
        </div>
        <div style={{ marginTop: 22 * k, fontFamily: 'Plex', fontWeight: 600, fontSize: 40 * k, color: sub, opacity: rest }}>
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
