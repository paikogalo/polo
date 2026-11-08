import {Cpu,Rocket,Sprout} from "lucide-react";
import {NodoButton} from "@/components/nodo/nodo-button";
import {nodoAssets} from "@/lib/nodo/assets";

/** Franja destacada de NODO en la portada, debajo del hero. */
export function NodoHomeBand(){
  const {logoBlancoSrc}=nodoAssets();
  return <section id="nodo" aria-labelledby="nodo-home-title" className="nodo-hero relative overflow-clip text-white">
    <div className="nodo-gradient-ring h-1.5" aria-hidden="true"/>
    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ocean/20 blur-3xl" aria-hidden="true"/>
    <div className="absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-yellow/15 blur-3xl" aria-hidden="true"/>
    <div className="section relative grid grid-cols-1 items-center gap-8 py-12 sm:py-14 lg:grid-cols-[1.25fr_1fr] lg:py-16 [&>*]:min-w-0">
      <div className="text-center lg:text-left">
        <span className="chip bg-yellow text-navy">Nuevo · Jóvenes de 16 a 30 años</span>
        <h2 id="nodo-home-title" className="mt-5 flex flex-col items-center gap-4 lg:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoBlancoSrc} alt="nodo" width={349} height={100} className="h-14 w-auto sm:h-16"/>
          <span className="max-w-xl text-2xl font-black leading-tight sm:text-3xl">Plataforma de emprendimiento y tecnología para jóvenes de 16 a 30 años</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/80 lg:mx-0">Aprende - Emprende y Crece aquí: un nodo en cada cantón de Cotopaxi, para que emprender no signifique irse.</p>
        <div className="mt-7 flex justify-center lg:justify-start"><NodoButton ubicacion="home" size="lg"/></div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {[[Rocket,"Escuela de emprendimiento","De la idea a tu primer producto"],[Cpu,"Laboratorio agro-digital","Computadoras, impresión 3D, sensores y drones"],[Sprout,"Fondo semilla concursable","Para empresas rurales juveniles"]].map(([I,t,d],i)=>{const Icon=I as typeof Rocket;return <li key={String(t)} className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm text-left">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${["bg-yellow","bg-ocean","bg-pink"][i]} text-navy`}><Icon size={22} aria-hidden="true"/></span>
          <span><b className="block text-base">{String(t)}</b><span className="text-sm text-white/75">{String(d)}</span></span>
        </li>})}
      </ul>
    </div>
  </section>;
}
