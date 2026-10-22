import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Caption, Desk, EndCard, FPS, Gameplay, Screen, Seg, TileBurst, totalFrames, useFonts } from './Common';

// The 16:9 trailer (YouTube, Reddit, the store listing): one idea per scene, the line on the left and real
// gameplay on the right, then the end card. Every number on screen is the game's own.

type Scene = { title: string; sub: string; segs: Seg[]; burst?: number };

const SCENES: Scene[] = [
  { title: 'Spell *words*.', sub: 'Tap tiles, play the word, watch it score.', segs: [{ clip: 'blazing', from: 1.5, to: 7.3 }] },
  { title: 'Collect *Glyphs*.', sub: '149 of them, each bending the scoring rules.', segs: [{ clip: 'shop', from: 1.6, to: 5.8 }] },
  {
    title: 'Order *matters*.',
    sub: 'Drag Ink Blot before Etymologist: +456 points.',
    segs: [
      { clip: 'order-after', from: 1.8, to: 4.0 },
      { clip: 'order-after', from: 6.4, to: 10.5 },
    ],
  },
  {
    title: 'Beat the *Bosses*.',
    sub: 'The Silencer: vowels score nothing.',
    segs: [
      { clip: 'silencer-pick', from: 0.8, to: 3.0 },
      { clip: 'silencer', from: 3.7, to: 7.7 },
    ],
  },
  { title: 'Rewrite your *tiles*.', sub: '37 Inks for your tiles, your bag and the blind.', segs: [{ clip: 'monotype', from: 1.4, to: 4.7 }] },
  { title: 'Break the *score*.', sub: 'One word. 169,000 points.', segs: [{ clip: 'big', from: 3.6, to: 9.9 }], burst: 5.9 },
];

const END = 105;
const sceneFrames = SCENES.map((s) => totalFrames(s.segs));
export const PROMO_FRAMES = sceneFrames.reduce((a, b) => a + b, 0) + END;

const SceneView: React.FC<{ scene: Scene; first: boolean }> = ({ scene, first }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = first ? spring({ frame, fps, config: { damping: 18, stiffness: 140 } }) : 1;
  const sub = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <Desk />
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - enter) * 300}px)`, opacity: enter }}>
        <Screen x={1390} y={44} h={992} radius={40}>
          <Gameplay segs={scene.segs} />
        </Screen>
      </div>
      <div style={{ position: 'absolute', left: 150, width: 860, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Caption lines={[scene.title]} size={116} align="left" />
        <div
          style={{
            marginTop: 26,
            fontFamily: 'Plex',
            fontWeight: 600,
            fontSize: 40,
            lineHeight: 1.3,
            color: C.faded,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 16}px)`,
          }}
        >
          {scene.sub}
        </div>
      </div>
      {scene.burst !== undefined && (
        <Sequence from={Math.round(scene.burst * FPS)} layout="none">
          <TileBurst cx={1390} cy={460} scale={0.8} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => {
  useFonts();
  let at = 0;
  return (
    <AbsoluteFill style={{ background: C.desk }}>
      {SCENES.map((scene, i) => {
        const from = at;
        at += sceneFrames[i];
        return (
          <Sequence key={i} from={from} durationInFrames={sceneFrames[i]}>
            <SceneView scene={scene} first={i === 0} />
          </Sequence>
        );
      })}
      <Sequence from={at}>
        <EndCard />
        <Audio src={staticFile('sfx/blind_won.wav')} volume={0.7} />
      </Sequence>
      <Audio
        src={staticFile('music.wav')}
        volume={(f) => 0.5 * interpolate(f, [0, 10, PROMO_FRAMES - 30, PROMO_FRAMES], [0, 1, 1, 0], { extrapolateRight: 'clamp' })}
      />
    </AbsoluteFill>
  );
};
