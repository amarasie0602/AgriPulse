import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';

// The last 36 frames blend into source frames 0..35; the next loop starts at 36.
// No titles are baked in: the application owns the accessible text and actions.
export function HeroLoop() {
  const frame = useCurrentFrame();
  const style = { width: '100%', height: '100%', objectFit: 'cover' as const };
  const opacity = interpolate(frame, [324, 359], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: '#1c3022' }}>
    <OffthreadVideo src={staticFile('rice-fields.mp4')} trimBefore={36} muted style={style} />
    <Sequence from={324} durationInFrames={36}><AbsoluteFill style={{ opacity }}><OffthreadVideo src={staticFile('rice-fields.mp4')} muted style={style} /></AbsoluteFill></Sequence>
  </AbsoluteFill>;
}
