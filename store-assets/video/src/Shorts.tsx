import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Caption, Desk, EndCard, FPS, Gameplay, Screen, Seg, TileBurst, totalFrames, useFonts } from './Common';

// Vertical shorts (TikTok, YouTube Shorts, Instagram Reels) and 4:5 feed cuts (Reddit, Instagram and Facebook feeds).
// Each: a hook from the first frame, one idea shown in real gameplay, the payoff on the frame the game shows it,
// then a 1.5 s end card. Captions sit above the game screen, clear of the platforms' top tabs, and the screen
// stays narrow enough to keep clear of their right-hand buttons.

const END = 45;

type Pop = { at: number; lines: string[] };
type Zoom = { at: number; until: number; scale: number; origin: string };

type ShortSpec = {
  id: string;
  segs: Seg[];
  /** Hook lines, on screen from the first frame; *stars* set a word in gold. */
  hook: string[];
  /** Captions that replace the hook from [at] seconds into the gameplay. */
  pops: Pop[];
  /** Tiles burst from the screen at this many seconds in (the payoff). */
  impact?: number;
  /** Push in on part of the screen for a moment. */
  zoom?: Zoom;
  /** Where the music starts, in seconds of music.wav. */
  musicFrom: number;
  /** End card call to action (default "Free on Google Play"). */
  cta?: string;
  /** Frames each cut fades out and back in over (default: hard cuts). */
  fade?: number;
  /** Volume of the game's own sound effects under the music (default 1). */
  sfx?: number;
};

const SHORTS: ShortSpec[] = [
  {
    id: 'one-word',
    segs: [{ clip: 'big', from: 1.4, to: 10.7 }],
    hook: ['How much can', '*ONE* word score?'],
    pops: [{ at: 7.9, lines: ['*169,000*', 'points 🤯'] }],
    impact: 8.0,
    musicFrom: 0,
  },
  {
    id: 'glyph-order',
    segs: [
      { clip: 'order-before', from: 3.9, to: 7.9 },
      { clip: 'order-after', from: 1.8, to: 4.0 },
      { clip: 'order-after', from: 6.4, to: 11.3 },
    ],
    hook: ['Same word.', 'Same Glyphs.'],
    pops: [
      { at: 4.0, lines: ['Now swap', 'their *ORDER*…'] },
      { at: 9.8, lines: ['*+456* points', 'from one drag'] },
    ],
    impact: 10.0,
    musicFrom: 11.4,
  },
  {
    id: 'no-vowels',
    segs: [
      { clip: 'silencer-pick', from: 0.6, to: 3.0 },
      { clip: 'silencer', from: 1.4, to: 8.5 },
    ],
    hook: ['This Boss makes', '*VOWELS* worthless'],
    pops: [
      { at: 2.6, lines: ['So spell', 'with *none* 🤫'] },
      { at: 8.2, lines: ['No vowels:', '*×4 Mult*'] },
    ],
    impact: 8.3,
    musicFrom: 22.9,
  },
  {
    id: 'glyph-pack',
    segs: [{ clip: 'shop', from: 1.2, to: 6.4 }],
    hook: ['Open a', '*Glyph pack*'],
    pops: [
      { at: 1.5, lines: ['Pick *ONE*.', 'Which one?'] },
      { at: 3.4, lines: ['*×5 Mult*', 'with exactly 3 Glyphs'] },
    ],
    impact: 3.5,
    musicFrom: 34.3,
  },
  {
    id: 'every-tile',
    segs: [
      { clip: 'monotype', from: 1.4, to: 4.7 },
      { clip: 'monotype', from: 7.1, to: 12.6 },
    ],
    hook: ['Every tile in hand:', '*+2 Base*, for good'],
    pops: [
      { at: 1.9, lines: ['Watch the', 'numbers turn *blue*'] },
      { at: 3.3, lines: ['Now make', 'them count'] },
    ],
    zoom: { at: 1.8, until: 3.2, scale: 1.25, origin: '50% 88%' },
    impact: 8.5,
    musicFrom: 45.7,
  },
  {
    // Pre-launch teaser: three payoffs, each built up to and then held still for a beat (the one-word, no-vowels
    // and eight-letters moments), with a soft dip between them, then "Out Monday".
    id: 'teaser-monday',
    segs: [
      { clip: 'big', from: 0.9, to: 9.8, hold: 1.4 },
      { clip: 'silencer', from: 3.0, to: 7.4, hold: 1.4 },
      { clip: 'anagram', from: 3.7, to: 9.75, hold: 1.6 },
    ],
    fade: 10,
    sfx: 0.45,
    hook: ['A word game that', '*breaks* its rules'],
    pops: [
      { at: 8.6, lines: ['*169,000*', 'from one word 🤯'] },
      { at: 10.3, lines: ['Bosses', 'bend the *rules*'] },
      { at: 16.1, lines: ['Find the', '*8-letter* word'] },
      { at: 22.3, lines: ['Out *Monday*', '26 October'] },
    ],
    impact: 8.6,
    musicFrom: 0,
    cta: 'Out 26 October on Google Play',
  },
  {
    id: 'eight-letters',
    segs: [{ clip: 'anagram', from: 0.5, to: 10.5 }],
    hook: ['Find the', '*8-letter* word 👀'],
    pops: [
      { at: 2.85, lines: ['Got it?'] },
      { at: 8.9, lines: ['All 8 tiles:', '*Lexicon!*'] },
    ],
    impact: 9.0,
    musicFrom: 57.1,
  },
];

const Short: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const body = totalFrames(spec.segs);
  const tall = height / width > 1.5;
  // Screen below a caption band; in 4:5 the screen is smaller so both fit.
  const capTop = tall ? 150 : 46;
  const capSize = tall ? 96 : 74;
  const screenTop = tall ? 400 : 238;
  const screenH = tall ? 1460 : 1080;
  const t = frame / FPS;
  const popped = spec.pops.filter((p) => t >= p.at).at(-1);
  const z = spec.zoom;
  const zin = z ? spring({ frame: frame - z.at * FPS, fps, config: { damping: 18, stiffness: 120 } }) : 0;
  const zout = z ? spring({ frame: frame - z.until * FPS, fps, config: { damping: 18, stiffness: 120 } }) : 0;
  const zoom = z ? 1 + (z.scale - 1) * (zin - zout) : 1;
  const impactF = spec.impact === undefined ? undefined : Math.round(spec.impact * FPS);
  const flash = impactF === undefined ? 0 : interpolate(frame, [impactF, impactF + 2, impactF + 14], [0, 0.35, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const musicEnd = body + END;
  return (
    <AbsoluteFill style={{ background: C.desk }}>
      <Sequence durationInFrames={body}>
        <Desk />
        <Screen x={width / 2} y={screenTop} h={screenH} radius={tall ? 48 : 36}>
          <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: z?.origin }}>
            <Gameplay segs={spec.segs} fade={spec.fade} volume={spec.sfx} />
          </AbsoluteFill>
        </Screen>
        {popped ? (
          <Sequence from={Math.round(popped.at * FPS)} layout="none">
            <Caption lines={popped.lines} size={capSize} top={capTop} />
          </Sequence>
        ) : (
          <Caption lines={spec.hook} size={capSize} top={capTop} />
        )}
        {impactF !== undefined && (
          <Sequence from={impactF} layout="none">
            <TileBurst cx={width / 2} cy={screenTop + screenH * 0.42} scale={tall ? 1 : 0.8} />
          </Sequence>
        )}
        <AbsoluteFill style={{ background: C.parchment, opacity: flash, pointerEvents: 'none' }} />
      </Sequence>
      <Sequence from={body}>
        <EndCard cta={spec.cta} />
        <Audio src={staticFile('sfx/blind_won.wav')} volume={0.7} />
      </Sequence>
      <Audio
        src={staticFile('music.wav')}
        startFrom={Math.round(spec.musicFrom * FPS)}
        volume={(f) => 0.45 * interpolate(f, [0, 8, musicEnd - 12, musicEnd], [0, 1, 1, 0], { extrapolateRight: 'clamp' })}
      />
    </AbsoluteFill>
  );
};

/** Every short in 9:16 (1080×1920) and 4:5 (1080×1350). */
export const ShortCompositions: React.FC = () => (
  <>
    {SHORTS.map((spec) => (
      <React.Fragment key={spec.id}>
        <Composition id={`short-${spec.id}`} component={Short} defaultProps={{ spec }} durationInFrames={totalFrames(spec.segs) + END} fps={FPS} width={1080} height={1920} />
        <Composition id={`feed-${spec.id}`} component={Short} defaultProps={{ spec }} durationInFrames={totalFrames(spec.segs) + END} fps={FPS} width={1080} height={1350} />
      </React.Fragment>
    ))}
  </>
);

export const SHORT_IDS = SHORTS.map((s) => s.id);
