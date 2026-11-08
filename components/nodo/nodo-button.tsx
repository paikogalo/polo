"use client";

import {ArrowRight} from "lucide-react";
import {NODO_ICON_SRC,nodoHref,type NodoUbicacion} from "@/lib/nodo/constants";
import {trackNodo} from "@/lib/nodo/analytics";

type Size="md"|"lg"|"compact";

const sizes:Record<Size,string>={
  compact:"min-h-11 gap-2 px-3.5 py-2 text-sm",
  md:"min-h-12 gap-2.5 px-5 py-3 text-[15px]",
  lg:"min-h-14 max-w-full gap-2.5 whitespace-normal px-4 py-3.5 text-[15px] leading-tight min-[400px]:text-base sm:gap-3 sm:whitespace-nowrap sm:px-7 sm:py-4 sm:text-lg",
};
const iconSizes:Record<Size,string>={compact:"h-7 w-7",md:"h-8 w-8",lg:"h-9 w-9 sm:h-10 sm:w-10"};

/**
 * Botón NODO · Exclusivo para jóvenes. Fondo amarillo #F7A713 y texto #183247 (contraste AA);
 * hover y foco invierten a #183247 con texto blanco. Siempre agrega utm_source con su ubicación.
 */
const cortes={sm:["sm:hidden","hidden sm:inline"],"2xl":["2xl:hidden","hidden 2xl:inline"]} as const;

export function NodoButton({ubicacion,size="md",hash="",label="NODO · Exclusivo para jóvenes",shortLabel,shortUntil="sm",escalonado=false,className="",onNavigate}:{
  ubicacion:NodoUbicacion;size?:Size;hash?:string;label?:string;shortLabel?:string;shortUntil?:keyof typeof cortes;/** Menú de escritorio: "NODO" → "NODO · Jóvenes" (≥1366 px) → texto completo (≥1700 px). */escalonado?:boolean;className?:string;onNavigate?:()=>void;
}){
  return <a
    href={nodoHref(ubicacion,hash)}
    aria-label={escalonado||shortLabel?label:undefined}
    onClick={()=>{trackNodo("nodo_boton_click",{ubicacion});onNavigate?.();}}
    className={`group inline-flex items-center justify-center rounded-full ${size==="lg"?"":"whitespace-nowrap"} bg-yellow font-extrabold text-navy shadow-[0_10px_28px_rgba(247,167,19,.35)] ring-2 ring-yellow/40 transition duration-200 hover:-translate-y-0.5 hover:bg-navy hover:text-white hover:ring-navy/30 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy motion-reduce:transform-none motion-reduce:transition-none ${sizes[size]} ${className}`}
  >
    <span className={`grid shrink-0 place-items-center rounded-full bg-white ${iconSizes[size]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={NODO_ICON_SRC} alt="" width={40} height={40} className="h-[72%] w-[72%]"/>
    </span>
    {escalonado
      ?<><span className="min-[1366px]:hidden">NODO</span><span className="hidden min-[1366px]:inline min-[1700px]:hidden">NODO · Jóvenes</span><span className="hidden min-[1700px]:inline">{label}</span></>
      :shortLabel?<><span className={cortes[shortUntil][0]}>{shortLabel}</span><span className={cortes[shortUntil][1]}>{label}</span></>:<span>{label}</span>}
    {size==="lg"&&<ArrowRight size={20} aria-hidden="true" className="transition group-hover:translate-x-0.5 motion-reduce:transform-none"/>}
  </a>;
}
