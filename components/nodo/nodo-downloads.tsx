"use client";

import {Download,FileText,Film,Shapes} from "lucide-react";
import {trackNodo} from "@/lib/nodo/analytics";

type Item={archivo:"pdf"|"mp4"|"logo";titulo:string;detalle:string;href:string|null;nombreDescarga:string;tamano:string|null};

const iconos={pdf:FileText,mp4:Film,logo:Shapes};

export function NodoDownloads({items}:{items:Item[]}){
  return <ul className="grid gap-4 md:grid-cols-3">
    {items.map(item=>{const Icon=iconos[item.archivo];return <li key={item.archivo} className="flex flex-col rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-yellow"><Icon aria-hidden="true"/></span>
      <h3 className="mt-4 text-lg font-extrabold text-navy">{item.titulo}</h3>
      <p className="mt-1 flex-1 text-sm leading-6 text-navy/75">{item.detalle}</p>
      {item.href?<a href={item.href} download={item.nombreDescarga} onClick={()=>trackNodo("nodo_descarga",{archivo:item.archivo})} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-yellow px-5 py-3 font-extrabold text-navy transition hover:bg-navy hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy">
        <Download size={18} aria-hidden="true"/>Descargar{item.tamano?<span className="font-semibold">· {item.tamano}</span>:null}
      </a>:<span className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-dashed border-navy/25 px-5 py-3 text-sm font-bold text-navy/70">Disponible pronto</span>}
    </li>})}
  </ul>;
}
