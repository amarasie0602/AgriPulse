import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { AUTH_SCENES, AUTH_SCENE_SECONDS } from '../../frontend/src/content/authStory';
function Chapter({index, titles}: {index:number; titles:boolean}) {
  const frame=useCurrentFrame(),scene=AUTH_SCENES[index];
  const opacity=interpolate(frame,[0,12],[0,1],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{opacity:index ? opacity : 1}}>
    <OffthreadVideo src={staticFile(scene.source)} trimBefore={scene.offset*30} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    {titles && <AbsoluteFill style={{background:'linear-gradient(90deg,#10291ddd,transparent)',justifyContent:'center',padding:70,color:'#fffefa'}}><p style={{fontFamily:'Arial',fontSize:15,letterSpacing:3}}>AGRIPULSE / {scene.label.toUpperCase()}</p><h1 style={{fontFamily:'Georgia',fontWeight:400,fontSize:65,maxWidth:650,lineHeight:1.1}}>{scene.title.split(' ').map((word,i)=><span key={i} style={{display:'inline-block',marginRight:16,opacity:interpolate(frame,[i*3,i*3+12],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),transform:`translateY(${interpolate(frame,[i*3,i*3+12],[12,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}px)`}}>{word}</span>)}</h1></AbsoluteFill>}
  </AbsoluteFill>
}
export function AuthStoryFilm({titles=false}:{titles?:boolean}) {
  return <AbsoluteFill style={{background:'#10291d'}}>{AUTH_SCENES.map((_,i)=><Sequence key={i} from={i*AUTH_SCENE_SECONDS*30} durationInFrames={Math.min(600-i*150,162)}><Chapter index={i} titles={titles}/></Sequence>)}</AbsoluteFill>
}
