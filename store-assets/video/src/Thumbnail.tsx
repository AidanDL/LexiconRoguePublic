import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, CLIP_H, CLIP_W, Desk, Tile, useFonts } from './Common';

// YouTube thumbnail (1280×720): one idea, big type, readable small. The game screen at the moment JAZZING
// lands its 169,000 (public/thumb-game.png, a frame of the big clip).
export const Thumbnail: React.FC = () => {
  useFonts();
  const h = 680;
  const w = (h * CLIP_W) / CLIP_H;
  return (
    <AbsoluteFill>
      <Desk />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 76% 50%, ${C.gold}44, transparent 50%)` }} />
      <div style={{ position: 'absolute', left: 64, top: 120, width: 700 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 30 }}>
          {'ONE WORD'.split('').map((l, i) =>
            l === ' ' ? <div key={i} style={{ width: 22 }} /> : <Tile key={i} letter={l} size={74} style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 3}deg)` }} />,
          )}
        </div>
        <div style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: 150, lineHeight: 0.95, letterSpacing: '-0.03em', color: C.gold, textShadow: `0 10px 0 ${C.wax}` }}>
          169,000
        </div>
        <div style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: 92, lineHeight: 1, color: C.parchment, marginTop: 14, textShadow: '0 6px 0 rgba(0,0,0,0.5)' }}>
          points
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1000 - w / 2,
          top: 20,
          width: w,
          height: h,
          borderRadius: 30,
          overflow: 'hidden',
          boxShadow: `0 0 0 3px ${C.panel}, 0 30px 70px rgba(0,0,0,0.7)`,
          transform: 'rotate(3deg)',
        }}
      >
        <Img src={staticFile('thumb-game.png')} style={{ width: '100%', height: '100%' }} />
      </div>
    </AbsoluteFill>
  );
};
