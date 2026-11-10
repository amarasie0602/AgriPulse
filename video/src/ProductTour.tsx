import React from 'react';
import { AbsoluteFill, Img, Loop, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { HeroLoop } from './HeroLoop';
const pages = [
  ['dashboard', 'Your farm overview', 'Land, crops, resources, and estimated impact in one workspace.'],
  ['farms', 'Manage each farm', 'Keep locations, land area, and crop varieties organized.'],
  ['crops', 'Follow the growing season', 'Record planting dates, observed stages, and harvest plans.'],
  ['resources', 'Record what you use', 'Track water, energy, fuel, and crop inputs in their own units.'],
  ['analytics', 'Understand your records', 'Explore dated observations and transparent emissions estimates.'],
];
function Page({ page }: { page: typeof pages[number] }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0,12,108,119], [0,1,1,0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' });
  const rise = interpolate(frame, [0,18], [12,0], { extrapolateRight:'clamp' });
  return <AbsoluteFill style={{opacity,transform:`translateY(${rise}px)`,padding:40}}>
    <div style={{width:245,marginTop:115}}><div style={{fontSize:11,letterSpacing:2,color:'#d9e4c8'}}>AGRIPULSE</div><h1 style={{fontFamily:'Georgia, serif',fontSize:35,fontWeight:400,lineHeight:1.14,margin:'20px 0'}}>{page[1]}</h1><p style={{fontSize:14,lineHeight:1.8,color:'#ebefdf'}}>{page[2]}</p></div>
    <Img src={staticFile(`ui/${page[0]}.png`)} style={{position:'absolute',left:310,top:90,width:610,height:370,objectFit:'contain',objectPosition:'center',borderRadius:6,boxShadow:'0 12px 45px #071c2355'}} />
  </AbsoluteFill>;
}
export function ProductTour() {
  return <AbsoluteFill style={{background:'#123321',color:'#fffefa',fontFamily:'Arial, sans-serif'}}>
    <Loop durationInFrames={360}><HeroLoop /></Loop>
    <AbsoluteFill style={{background:'linear-gradient(90deg,#0d291de8,#0d291d88)'}} />
    {pages.map((page,index)=><Sequence key={page[0]} from={index*120} durationInFrames={120}><Page page={page} /></Sequence>)}
    <div style={{position:'absolute',bottom:25,left:40,fontSize:10,letterSpacing:1,color:'#dbe6cc'}}>PRODUCT WALKTHROUGH / EXAMPLE WORKSPACE · TEST RECORDS</div>
  </AbsoluteFill>;
}
