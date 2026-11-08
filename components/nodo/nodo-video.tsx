"use client";

import {useRef} from "react";
import {Download,Clapperboard} from "lucide-react";
import {trackNodo} from "@/lib/nodo/analytics";

type Props={src:string|null;descarga:string|null;poster:string|null;subtitulos:string|null;tamanoDescarga:string|null};

/** Video explicativo 9:16 con eventos de reproducción (inicio, 50 % y 100 %). */
export function NodoVideo({src,descarga,poster,subtitulos,tamanoDescarga}:Props){
  const enviados=useRef(new Set<string>());
  const una=(evento:"nodo_video_play"|"nodo_video_50"|"nodo_video_100")=>{
    if(enviados.current.has(evento))return;
    enviados.current.add(evento);trackNodo(evento);
  };

  return <div className="mx-auto w-full max-w-[420px]">
    <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] bg-navy shadow-soft ring-4 ring-white">
      {src?<video
        className="h-full w-full object-cover"
        controls playsInline preload="none"
        poster={poster??undefined}
        onPlay={()=>una("nodo_video_play")}
        onTimeUpdate={event=>{const v=event.currentTarget;if(!v.duration)return;const p=v.currentTime/v.duration;if(p>=.5)una("nodo_video_50");if(p>=.98)una("nodo_video_100");}}
        onEnded={()=>una("nodo_video_100")}
      >
        <source src={src} type="video/mp4"/>
        {subtitulos&&<track kind="captions" srcLang="es" label="Español" src={subtitulos} default/>}
        Tu navegador no puede reproducir este video. Puedes descargarlo con el botón de abajo.
      </video>:<div className="grid h-full place-items-center p-8 text-center text-white">
        <div><Clapperboard className="mx-auto h-12 w-12 text-yellow" aria-hidden="true"/><p className="mt-4 text-lg font-extrabold">El video se publicará muy pronto</p><p className="mt-2 text-sm text-white/75">Mientras tanto, puedes leer la propuesta y registrarte para el piloto.</p></div>
      </div>}
    </div>
    {descarga?<a href={descarga} download="NODO-Jovenes-Cotopaxi-video.mp4" onClick={()=>trackNodo("nodo_descarga",{archivo:"mp4"})} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-navy bg-white px-5 py-3 font-extrabold text-navy transition hover:bg-navy hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ocean">
      <Download size={18} aria-hidden="true"/>Descargar video (MP4){tamanoDescarga?` · ${tamanoDescarga}`:""}
    </a>:null}
  </div>;
}
