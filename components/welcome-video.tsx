"use client";
import {Volume2,X} from "lucide-react";
import {useEffect,useRef,useState} from "react";
import {TUTORIAL_POSTER,TUTORIAL_SRC} from "@/lib/video-src";

/**
 * Ventana emergente de inicio: tutorial vertical "¿Cómo funciona la plataforma?".
 * Arranca en silencio (los navegadores bloquean el autoplay con sonido) y trae subtítulos incrustados;
 * el botón "Activar sonido" lo reanuda con audio.
 */
export function WelcomeVideo(){
  const [open,setOpen]=useState(true);
  const [muted,setMuted]=useState(true);
  const video=useRef<HTMLVideoElement>(null);
  const cerrar=useRef<HTMLButtonElement>(null);
  const videoUrl=process.env.NEXT_PUBLIC_CAMPAIGN_VIDEO_URL;
  useEffect(()=>{
    if(!open)return;
    cerrar.current?.focus();
    const close=(event:KeyboardEvent)=>event.key==="Escape"&&setOpen(false);
    window.addEventListener("keydown",close);
    return()=>window.removeEventListener("keydown",close);
  },[open]);
  if(!open)return null;
  const activarSonido=()=>{const v=video.current;if(!v)return;v.muted=false;setMuted(false);if(v.ended||v.currentTime>v.duration-1)v.currentTime=0;void v.play();};
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-deep/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Video: cómo funciona la plataforma" onMouseDown={event=>event.target===event.currentTarget&&setOpen(false)}>
    <div className="relative w-full max-w-[400px]">
      <button ref={cerrar} onClick={()=>setOpen(false)} className="absolute -right-2 -top-2 z-20 grid h-11 w-11 place-items-center rounded-full bg-yellow text-deep shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-white sm:-right-5 sm:-top-5" aria-label="Cerrar video"><X aria-hidden="true"/></button>
      <div className="overflow-hidden rounded-[2rem] bg-black shadow-2xl ring-4 ring-white/15">
        <video ref={video} className="mx-auto aspect-[9/16] max-h-[80vh] w-full bg-deep object-contain" controls autoPlay muted={muted} playsInline preload="metadata" poster={videoUrl?undefined:TUTORIAL_POSTER}
          onVolumeChange={event=>setMuted(event.currentTarget.muted)}>
          <source src={videoUrl||TUTORIAL_SRC} type="video/mp4"/>Tu navegador no puede reproducir este video.
        </video>
      </div>
      {muted&&<button type="button" onClick={activarSonido} className="absolute left-1/2 top-4 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-yellow px-5 font-extrabold text-deep shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-white"><Volume2 size={18} aria-hidden="true"/>Activar sonido</button>}
    </div>
  </div>;
}
