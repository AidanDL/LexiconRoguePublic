import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, CLIP_BG, Caption, Desk, EndCard, FPS, Gameplay, InkCaption, PlateCaption, Screen, Seg, Sticker, TileBurst, Window, totalFrames, useFonts } from './Common';

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
  /** How the short is framed (default 'phone': the whole phone on the walnut desk, serif hook above):
   * - 'closeup': flat parchment, a cropped window on the game (each cut's focus), ink type and a stamped [sticker];
   * - 'pov': the game full-bleed with punch-ins, TikTok-style white text plates;
   * - 'split': a would-you poll; wax red over Base blue, [segs] on top and [segsB] below, hook = the two options. */
  look?: 'phone' | 'closeup' | 'pov' | 'split';
  /** The lower half's cuts in the split look (no sound of their own). */
  segsB?: Seg[];
  /** The stamped label in the close-up look. */
  sticker?: string;
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
  {
    // Daily streak: 9 days, today's Daily one word from clearing ante 1; clearing it makes 10 and fills a freeze slot.
    id: 'daily-streak',
    segs: [
      { clip: 'streak', from: 0.3, to: 2.5 },
      { clip: 'streak', from: 3.1, to: 12.6 },
      { clip: 'streak', from: 14.9, to: 18.4 },
    ],
    hook: ['*10-day* streak', 'on the line 🔥'],
    pops: [
      { at: 2.2, lines: ['Last play:', '*60* points to go'] },
      { at: 10.9, lines: ['Ante 1 cleared.', '*10 days* 🔥'] },
      { at: 11.7, lines: ['10 days earns a', 'streak *freeze* ❄️'] },
    ],
    zoom: { at: 10.5, until: 11.6, scale: 1.6, origin: '62% 3%' },
    impact: 10.9,
    musicFrom: 28.0,
  },
  {
    // The real Daily #3 (28 Oct 2026), played from the Daily tab with the game's own tiles: ante 1 in four words, the
    // last (AGENDUM, 408) beating the Boss; the streak lights to 1. Clip: daily-real.
    id: 'beat-my-daily',
    look: 'closeup',
    sticker: 'TODAY’S DAILY · SAME TILES FOR ALL',
    segs: [
      { clip: 'daily-real', from: 8.8, to: 12.6, focus: { x: 540, y: 1060, w: 980 } },
      { clip: 'daily-real', from: 27.4, to: 30.0, focus: { x: 540, y: 1060, w: 980 } },
      { clip: 'daily-real', from: 37.4, to: 40.0, focus: { x: 540, y: 1060, w: 980 } },
      { clip: 'daily-real', from: 53.4, to: 57.9, focus: { x: 540, y: 1040, w: 820 } },
      { clip: 'daily-real', from: 58.1, to: 59.7, focus: { x: 640, y: 150, w: 520 } },
      { clip: 'daily-real', from: 64.3, to: 66.6, focus: { x: 540, y: 330, w: 1000 } },
    ],
    hook: ['Beat *408*', 'in one word?'],
    pops: [
      { at: 9.0, lines: ['AGENDUM:', '*408* 🔥'] },
      { at: 13.6, lines: ['Ante 1 cleared.', 'Streak: day *1*'] },
      { at: 15.2, lines: ['Your best word?', '*Comment it* 👇'] },
    ],
    musicFrom: 40.0,
  },
  {
    // POV: a 10-day streak (staged), yesterday missed; the game spends the freeze on load, then today's Daily makes it
    // 11. Clip: frozen.
    id: 'freeze-saved',
    look: 'pov',
    segs: [
      { clip: 'frozen', from: 0.2, to: 1.8, focus: { x: 330, y: 1250, w: 560 } },
      { clip: 'frozen', from: 1.8, to: 3.2, focus: { x: 540, y: 420, w: 760 } },
      { clip: 'frozen', from: 4.4, to: 6.6, focus: { x: 540, y: 1450, w: 760 } },
      { clip: 'frozen', from: 7.4, to: 10.2, focus: { x: 540, y: 1000, w: 700 } },
      { clip: 'frozen', from: 10.3, to: 11.8, focus: { x: 680, y: 60, w: 480 } },
      { clip: 'frozen', from: 15.0, to: 18.2, focus: { x: 540, y: 800, w: 1080 } },
    ],
    hook: ['POV: you forgot', 'your *Daily* yesterday'],
    pops: [
      { at: 1.6, lines: ['a *freeze* covered it ❄️', 'still 10 days'] },
      { at: 3.0, lines: ['now clear ante 1', 'to keep it going'] },
      { at: 7.6, lines: ['*11* days 🔥'] },
      { at: 9.1, lines: ['Has a freeze', 'ever *saved* you? 👇'] },
    ],
    musicFrom: 12.0,
  },
  {
    // Would-you poll: today's Daily still to play with a freeze held (clip: held) against what missing it costs: the
    // freeze is spent on the missed day (clip: frozen).
    id: 'freeze-or-play',
    look: 'split',
    segs: [
      { clip: 'held', from: 0.2, to: 2.2, focus: { x: 540, y: 330, w: 1000 } },
      { clip: 'held', from: 2.7, to: 5.2, focus: { x: 540, y: 330, w: 1000 } },
      { clip: 'held', from: 5.2, to: 8.4, focus: { x: 540, y: 1600, w: 1000 } },
    ],
    segsB: [
      { clip: 'held', from: 0.2, to: 3.0, focus: { x: 860, y: 240, w: 440 } },
      { clip: 'frozen', from: 0.2, to: 3.0, focus: { x: 330, y: 1300, w: 640 } },
      { clip: 'frozen', from: 0.2, to: 2.3, focus: { x: 860, y: 240, w: 440 } },
    ],
    hook: ['A · Play today’s Daily now', 'B · Skip it, let the freeze cover'],
    pops: [{ at: 5.6, lines: ['A or B? 👇'] }],
    musicFrom: 62.0,
  },
  {
    // POV: ante 8's Boss, The Final Word (1 Play, 12,000), with a late-run build; FINISHED scores 14,400 and wins the
    // run. Clips: final-pick, final. Every cut shows the whole screen (or all of its content) slightly smaller, with its top edge low, so the
    // text plates sit on the game's own empty background and no UI is cut at the frame's edges.
    id: 'final-boss',
    look: 'pov',
    segs: [
      { clip: 'final-pick', from: 0.3, to: 3.1, focus: { x: 540, y: 526, w: 1137 } },
      { clip: 'final', from: 2.3, to: 10.6, focus: { x: 540, y: 658, w: 1450 } },
      { clip: 'final', from: 10.9, to: 13.5, focus: { x: 540, y: 526, w: 1137 } },
    ],
    hook: ['POV: you finally reached', 'the *last* Boss'],
    pops: [
      { at: 1.4, lines: ['Only *1 Play*.', '12,000 to win.'] },
      { at: 10.4, lines: ['*14,400* 🏆'] },
      { at: 11.8, lines: ['Which Boss would you', '*least* want here? 👇'] },
    ],
    musicFrom: 33.0,
  },
];

const bodyFrames = (spec: ShortSpec) => Math.max(totalFrames(spec.segs), spec.segsB ? totalFrames(spec.segsB) : 0);

/** The end card and the music bed, shared by every look. */
const Outro: React.FC<{ spec: ShortSpec; body: number; card: React.ReactNode }> = ({ spec, body, card }) => {
  const musicEnd = body + END;
  return (
    <>
      <Sequence from={body}>
        {card}
        <Audio src={staticFile('sfx/blind_won.wav')} volume={0.7} />
      </Sequence>
      <Audio
        src={staticFile('music.wav')}
        startFrom={Math.round(spec.musicFrom * FPS)}
        volume={(f) => 0.45 * interpolate(f, [0, 8, musicEnd - 12, musicEnd], [0, 1, 1, 0], { extrapolateRight: 'clamp' })}
      />
    </>
  );
};

/** The caption on show: the hook (started early, so it's settled on frame 1), then each pop from its time. */
const Captions: React.FC<{ spec: ShortSpec; render: (lines: string[]) => React.ReactNode }> = ({ spec, render }) => {
  const t = useCurrentFrame() / FPS;
  const popped = spec.pops.filter((p) => t >= p.at).at(-1);
  return popped ? (
    <Sequence from={Math.round(popped.at * FPS)} layout="none">
      {render(popped.lines)}
    </Sequence>
  ) : (
    <Sequence from={-15} layout="none">
      {render(spec.hook)}
    </Sequence>
  );
};

/** Close-up: flat parchment, a stamped label, ink headline, and a window cropped to the part of the screen that matters. */
const CloseupShort: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  const body = bodyFrames(spec);
  const win = { x: 40, y: 540, w: 1000, h: 1020 };
  return (
    <AbsoluteFill style={{ background: C.parchment }}>
      <Sequence durationInFrames={body}>
        {spec.sticker ? <Sticker text={spec.sticker} top={168} /> : null}
        <Captions spec={spec} render={(lines) => <InkCaption lines={lines} size={100} top={250} />} />
        <Window {...win}>
          <Gameplay segs={spec.segs} volume={spec.sfx} box={{ w: win.w, h: win.h }} />
        </Window>
      </Sequence>
      <Outro spec={spec} body={body} card={<EndCard cta={spec.cta} bg={C.parchment} fg={C.ink} sub="#6E5C47" />} />
    </AbsoluteFill>
  );
};

/** POV: the game fills the frame, each cut punching in; the text sits on white plates like TikTok's own. */
const PovShort: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  const body = bodyFrames(spec);
  return (
    <AbsoluteFill style={{ background: CLIP_BG }}>
      <Sequence durationInFrames={body}>
        <Gameplay segs={spec.segs} volume={spec.sfx} box={{ w: 1080, h: 1920 }} />
        <Captions spec={spec} render={(lines) => <PlateCaption lines={lines} size={66} top={250} />} />
      </Sequence>
      <Outro spec={spec} body={body} card={<EndCard cta={spec.cta} bg="#111" fg="#fff" sub="#bbb" />} />
    </AbsoluteFill>
  );
};

/** Would-you poll: two flat colour blocks, each an option over a window on the game, "OR" (then the pops) on the seam. */
const SplitShort: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  const body = bodyFrames(spec);
  const box = { w: 960, h: 600 };
  const label = (text: string, top: number) => (
    <div style={{ position: 'absolute', left: 60, right: 60, top, fontFamily: 'Plex', fontWeight: 700, fontSize: 64, lineHeight: 1.1, color: C.parchment, letterSpacing: '-0.01em' }}>
      {text}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: C.base }}>
      <Sequence durationInFrames={body}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 960, background: C.wax }} />
        {label(spec.hook[0], 170)}
        <Window x={60} y={270} {...box} edge="rgba(0,0,0,0.3)">
          <Gameplay segs={spec.segs} volume={spec.sfx} box={box} />
        </Window>
        {label(spec.hook[1], 1050)}
        <Window x={60} y={1150} {...box} edge="rgba(0,0,0,0.3)">
          <Gameplay segs={spec.segsB ?? []} volume={0} box={box} />
        </Window>
        <Captions
          spec={{ ...spec, hook: ['OR'] }}
          render={(lines) => (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 960 - 58, textAlign: 'center' }}>
              <span style={{ display: 'inline-block', fontFamily: 'Plex', fontWeight: 700, fontSize: 60, lineHeight: '116px', padding: '0 44px', borderRadius: 58, background: C.gold, color: C.ink, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                {lines.join(' ')}
              </span>
            </div>
          )}
        />
      </Sequence>
      <Outro spec={spec} body={body} card={<EndCard cta={spec.cta} bg={C.base} fg={C.parchment} sub={C.parchmentDark} />} />
    </AbsoluteFill>
  );
};

const LOOKS = { closeup: CloseupShort, pov: PovShort, split: SplitShort };

const Short: React.FC<{ spec: ShortSpec }> = ({ spec }) => {
  useFonts();
  if (spec.look && spec.look !== 'phone') {
    const Look = LOOKS[spec.look];
    return <Look spec={spec} />;
  }
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
          // Started 15 frames early so the hook is already settled and readable on frame 1.
          <Sequence from={-15} layout="none">
            <Caption lines={spec.hook} size={capSize} top={capTop} />
          </Sequence>
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
        <Composition id={`short-${spec.id}`} component={Short} defaultProps={{ spec }} durationInFrames={bodyFrames(spec) + END} fps={FPS} width={1080} height={1920} />
        {/* The framed looks are laid out for 9:16 only. */}
        {spec.look && spec.look !== 'phone' ? null : (
          <Composition id={`feed-${spec.id}`} component={Short} defaultProps={{ spec }} durationInFrames={bodyFrames(spec) + END} fps={FPS} width={1080} height={1350} />
        )}
      </React.Fragment>
    ))}
  </>
);

export const SHORT_IDS = SHORTS.map((s) => s.id);
