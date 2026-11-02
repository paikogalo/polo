"use client";
import {Download,FileDown} from "lucide-react";
import {useEffect,useRef} from "react";

type Props={slug:string;titulo:string;planHref:string;className?:string};

/**
 * Infografía animada del Plan de Trabajo.
 * Se reproduce una sola vez cuando entra en pantalla y queda en su cuadro final.
 * Con "reducir movimiento" activado muestra la imagen estática.
 */
export function PlanInfografia({slug,titulo,planHref,className=""}:Props){
  const ref=useRef<HTMLVideoElement>(null);
  const base=`/plan-de-trabajo/${slug}`;

  useEffect(()=>{
    const video=ref.current;
    if(!video)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window))return;
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          video.play().catch(()=>{});
          io.disconnect();
        }
      });
    },{threshold:0.4});
    io.observe(video);
    return ()=>io.disconnect();
  },[]);

  return <figure className={`m-0 ${className}`}>
    <div className="overflow-hidden rounded-[1.75rem] bg-deep shadow-soft ring-1 ring-navy/10">
      <video ref={ref} className="block aspect-[4/5] h-auto w-full" muted playsInline preload="none" poster={`${base}-poster.webp`} aria-label={`Infografía: ${titulo}`}>
        <source src={`${base}-web.mp4`} type="video/mp4"/>
      </video>
    </div>
    <figcaption className="mt-4 flex flex-wrap items-center gap-2">
      <a href={planHref} download className="inline-flex min-h-11 items-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-coralDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"><FileDown size={18} aria-hidden="true"/>Descarga el plan de trabajo</a>
      <a href={`${base}.png`} download className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-3 text-sm font-bold text-deep transition hover:border-ocean hover:text-oceanDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean"><Download size={17} aria-hidden="true"/>Descargar esta infografía</a>
    </figcaption>
  </figure>;
}
