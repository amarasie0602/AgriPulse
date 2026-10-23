import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { AUTH_SCENES, AUTH_SCENE_SECONDS } from '@/content/authStory'

const duration=AUTH_SCENES.length*AUTH_SCENE_SECONDS
export function AuthStory() {
  const video=useRef<HTMLVideoElement>(null)
  const [time,setTime]=useState(0),[loaded,setLoaded]=useState(false),[playing,setPlaying]=useState(false),[failed,setFailed]=useState(false),[staticMode,setStaticMode]=useState(false)
  const pendingSeek=useRef(0)
  useEffect(()=>{
    const query=matchMedia('(prefers-reduced-motion: reduce)')
    const connection=(navigator as Navigator & {connection?:{saveData?:boolean;effectiveType?:string}}).connection
    const update=()=>{const limited=query.matches||Boolean(connection?.saveData)||['slow-2g','2g'].includes(connection?.effectiveType??'');setStaticMode(limited);if(limited){video.current?.pause();setPlaying(false)}}
    update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update)
  },[])
  useEffect(()=>{
    if(!playing)return
    let handle=0
    const tick=()=>{if(video.current)setTime(video.current.currentTime);handle=requestAnimationFrame(tick)}
    handle=requestAnimationFrame(tick);return()=>cancelAnimationFrame(handle)
  },[playing])
  const index=Math.min(AUTH_SCENES.length-1,Math.floor(time/AUTH_SCENE_SECONDS)),scene=AUTH_SCENES[index]
  function seek(next:number){setTime(next);pendingSeek.current=next;if(video.current)video.current.currentTime=next}
  function seekChapter(chapter: number) {
    // Land after the footage crossfade when seeking a loaded film while paused.
    const transition = chapter > 0 && loaded && !staticMode && !failed ? 0.45 : 0
    seek(chapter * AUTH_SCENE_SECONDS + transition)
  }
  async function play(){
    if(staticMode||failed)return
    if(!loaded){setLoaded(true);return}
    if(!video.current)return
    if(video.current.ended)seek(0)
    try{await video.current.play()}catch{setPlaying(false)}
  }
  function skip(){video.current?.pause();setPlaying(false);document.querySelector<HTMLInputElement>('#auth-form input')?.focus();document.getElementById('auth-form')?.scrollIntoView({block:'nearest'})}
  return <>
    {loaded&&!staticMode&&!failed&&<video ref={video} className="auth-story-video" src="/media/agripulse-auth-story.mp4" muted playsInline preload="auto" aria-hidden="true" onLoadedMetadata={()=>{if(video.current){video.current.currentTime=pendingSeek.current;void video.current.play().catch(()=>setPlaying(false))}}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{setTime(duration);setPlaying(false)}} onError={()=>{setFailed(true);setPlaying(false)}}/>}
    <div className="auth-story-content" data-scene={index}><p className="eyebrow">AGRIPULSE / {scene.label.toUpperCase()}</p><h1 key={index}>{scene.title.split(' ').map((word,i)=><span key={i} style={playing ? {opacity:Math.max(0,Math.min(1,(time-index*AUTH_SCENE_SECONDS-i*.055)/.45)),transform:`translateY(${12*(1-Math.max(0,Math.min(1,(time-index*AUTH_SCENE_SECONDS-i*.055)/.45)))}px)`} : undefined}>{word}{' '}</span>)}</h1><p className="auth-introduction">{scene.description}</p></div>
    <div className="auth-story-controls"><nav className="story-chapters" aria-label="Story chapters">{AUTH_SCENES.map((chapter,i)=><button key={chapter.label} type="button" aria-label={`Chapter ${i+1}: ${chapter.label}`} aria-current={index===i?'step':undefined} onClick={()=>seekChapter(i)}><span>{String(i+1).padStart(2,'0')} {chapter.label}</span><progress max={AUTH_SCENE_SECONDS} value={Math.max(0,Math.min(AUTH_SCENE_SECONDS,time-i*AUTH_SCENE_SECONDS))}/></button>)}</nav>
      <div className="story-playback">{!staticMode&&!failed&&<button type="button" onClick={()=>playing?video.current?.pause():void play()}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pause story':loaded?'Play story':'Watch the story'}</button>}<button type="button" onClick={()=>{seek(0);if(loaded&&!staticMode&&!failed)void play()}}><RotateCcw size={14}/>Replay</button><button type="button" onClick={skip}>Skip to form →</button></div>
      {(failed||staticMode)&&<p className="story-fallback" role="status">{failed?'Video unavailable. Explore the story with the chapter controls.':'Still-image experience. Explore each chapter at your own pace.'}</p>}
    </div>
  </>
}
