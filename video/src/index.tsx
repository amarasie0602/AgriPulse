import React from 'react';
import { AbsoluteFill, Composition, Img, OffthreadVideo, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

type FilmProps = { durationSeconds: number; useFootage: boolean };
const scenes = [
  { eyebrow: 'AGRIPULSE / A CLEARER PERSPECTIVE', title: 'Every field has a story.', subtitle: 'Keep yours in view.' },
  { eyebrow: 'LAND / CROPS / RESOURCES', title: 'Plan the season.', subtitle: 'From the first planting to the next harvest.' },
  { eyebrow: 'OBSERVE / RECORD / UNDERSTAND', title: 'Grow with perspective.', subtitle: 'Your farms. Your records. A more informed tomorrow.' },
];
function Scene({ index, frames, useFootage }: { index: number; frames: number; useFootage: boolean }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18, frames - 18, frames - 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rise = interpolate(frame, [0, 24], [18, 0], { extrapolateRight: 'clamp' });
  const zoom = interpolate(frame, [0, frames], [1.02, 1.08]);
  const scene = scenes[index];
  return <AbsoluteFill style={{ opacity }}>
    {useFootage ? <OffthreadVideo src={staticFile('rice-fields.mp4')} muted trimBefore={index * 180} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Img src={staticFile('rice-terraces.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, objectPosition: `${40 + index * 10}% center` }} />}
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(9,30,21,.82), rgba(9,30,21,.12))' }} />
    <AbsoluteFill style={{ justifyContent: 'center', padding: 90, transform: `translateY(${rise}px)` }}>
      <p style={{ fontSize: 17, letterSpacing: 4, color: '#d1ddbc' }}>{scene.eyebrow}</p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 80, lineHeight: 1.08, maxWidth: 800, margin: '28px 0' }}>{scene.title}</h1>
      <p style={{ fontSize: 25, color: '#efeadd', maxWidth: 700, lineHeight: 1.5 }}>{scene.subtitle}</p>
    </AbsoluteFill>
    <div style={{ position: 'absolute', bottom: 50, left: 90, right: 90, borderTop: '1px solid #ffffff55', paddingTop: 18, display: 'flex', justifyContent: 'space-between', fontSize: 14, letterSpacing: 2 }}><span>AGRIPULSE</span><span>FARM OPERATIONS, IN FOCUS</span></div>
  </AbsoluteFill>;
}
function Film({ useFootage }: FilmProps) {
  const { durationInFrames } = useVideoConfig();
  const frames = Math.floor(durationInFrames / scenes.length);
  return <AbsoluteFill style={{ background: '#091e15', color: '#faf7ee', fontFamily: 'Arial, sans-serif' }}>{scenes.map((_, index) => <Sequence key={index} from={index * frames} durationInFrames={index === 2 ? durationInFrames - index * frames : frames}><Scene index={index} frames={frames} useFootage={useFootage} /></Sequence>)}</AbsoluteFill>;
}
function Root() {
  return <Composition id="AgriPulse" component={Film} width={1920} height={1080} fps={30} durationInFrames={540} defaultProps={{ durationSeconds: 18, useFootage: false }} calculateMetadata={({ props }) => {
    if (!Number.isFinite(props.durationSeconds) || props.durationSeconds < 6 || props.durationSeconds > 30) throw new Error('Choose a duration between 6 and 30 seconds.');
    return { durationInFrames: Math.round(props.durationSeconds * 30) };
  }} />;
}
registerRoot(Root);
