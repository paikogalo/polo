"use client";

import {useEffect,useRef,useState} from "react";
import {Clapperboard,Download,PlayCircle,X} from "lucide-react";
import {trackNodo} from "@/lib/nodo/analytics";

const EVENTO="nodo:abrir-video";
const VISTO="nodo_video_visto";

/** Botón que abre la ventana emergente del video desde cualquier parte de la página. */
export function NodoVideoTrigger({children,className=""}:{children?:React.ReactNode;className?:string}){
  return <button type="button" onClick={()=>window.dispatchEvent(new Event(EVENTO))} className={className}>
    {children??<><PlayCircle size={22} aria-hidden="true"/>Ver el video</>}
  </button>;
}

type Props={src:string|null;descarga:string|null;poster:string|null;subtitulos:string|null;tamanoDescarga:string|null};

/**
 * Ventana emergente con el video 9:16. Se abre sola en la primera visita de la sesión (solo si el video ya está publicado),
 * y siempre con los botones "Ver el video". Escape o clic fuera la cierran; el foco vuelve al botón que la abrió.
 */
export function NodoVideoModal({src,descarga,poster,subtitulos,tamanoDescarga}:Props){
  const [open,setOpen]=useState(false);
  const cerrar=useRef<HTMLButtonElement>(null);
  const origen=useRef<Element|null>(null);
  const video=useRef<HTMLVideoElement>(null);
  const enviados=useRef(new Set<string>());
  const una=(e:"nodo_video_play"|"nodo_video_50"|"nodo_video_100")=>{if(!enviados.current.has(e)){enviados.current.add(e);trackNodo(e);}};

  useEffect(()=>{
    const abrir=()=>{origen.current=document.activeElement;setOpen(true);};
    window.addEventListener(EVENTO,abrir);
    let auto:number|undefined;
    if(src){try{if(!sessionStorage.getItem(VISTO)){sessionStorage.setItem(VISTO,"1");auto=window.setTimeout(abrir,700);}}catch{/* sin almacenamiento */}}
    return()=>{window.removeEventListener(EVENTO,abrir);window.clearTimeout(auto);};
  },[src]);

  useEffect(()=>{
    if(!open)return;
    cerrar.current?.focus();
    const tecla=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false);};
    window.addEventListener("keydown",tecla);
    document.body.style.overflow="hidden";
    return()=>{window.removeEventListener("keydown",tecla);document.body.style.overflow="";(origen.current as HTMLElement|null)?.focus?.();};
  },[open]);

  if(!open)return null;
  return <div role="dialog" aria-modal="true" aria-label="Video de NODO" className="fixed inset-0 z-[110] grid place-items-center bg-navy/85 p-4 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
    <div className="relative w-full max-w-[400px]">
      <button ref={cerrar} type="button" onClick={()=>setOpen(false)} aria-label="Cerrar video" className="absolute -right-2 -top-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-yellow text-navy shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-white sm:-right-5 sm:-top-5"><X aria-hidden="true"/></button>
      <div className="nodo-gradient-ring rounded-[2.2rem] p-1.5 shadow-2xl">
        <div className="relative aspect-[9/16] max-h-[78vh] overflow-hidden rounded-[1.9rem] bg-navy">
          {src?<video ref={video} className="h-full w-full object-cover" controls autoPlay playsInline preload="metadata" poster={poster??undefined}
            onPlay={()=>una("nodo_video_play")}
            onTimeUpdate={e=>{const v=e.currentTarget;if(!v.duration)return;const p=v.currentTime/v.duration;if(p>=.5)una("nodo_video_50");if(p>=.98)una("nodo_video_100");}}
            onEnded={()=>una("nodo_video_100")}>
            <source src={src} type="video/mp4"/>
            {subtitulos&&<track kind="captions" srcLang="es" label="Español" src={subtitulos} default/>}
            Tu navegador no puede reproducir este video.
          </video>:<div className="grid h-full place-items-center p-8 text-center text-white"><div><Clapperboard className="mx-auto h-14 w-14 text-yellow" aria-hidden="true"/><p className="mt-4 text-xl font-extrabold">El video se publicará muy pronto</p><p className="mt-2 text-sm text-white/80">Mientras tanto, regístrate para el piloto en la pantalla del teléfono.</p></div></div>}
        </div>
      </div>
      {descarga&&<a href={descarga} download="NODO-Jovenes-Cotopaxi-video.mp4" onClick={()=>trackNodo("nodo_descarga",{archivo:"mp4"})} className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-extrabold text-navy hover:bg-yellow"><Download size={18} aria-hidden="true"/>Descargar video (MP4){tamanoDescarga?` · ${tamanoDescarga}`:""}</a>}
    </div>
  </div>;
}
