"use client";

import {useState} from "react";
import Image from "next/image";
import {Check,MapPin,Users,X} from "lucide-react";

const actions=[
  {label:"Escuchar",title:"Escuchar a nuestra gente",text:"Cada propuesta comienza escuchando las historias, necesidades y sueños de quienes viven en el territorio.",icon:Users,gradient:"from-ocean to-blue-600",image:"/campaign-escucha.webp",imageAlt:"Hipólito Carrera escucha a dos mujeres durante un encuentro ciudadano",position:"52% 42%"},
  {label:"Recorrer",title:"Recorrer cada territorio",text:"Estar presentes en cantones, parroquias y comunidades permite conocer de primera mano sus prioridades.",icon:MapPin,gradient:"from-coral to-orange-500",image:"/campaign-cercania.webp",imageAlt:"Hipólito Carrera recorre una comunidad junto a un adulto mayor",position:"54% 48%"},
  {label:"Gestionar",title:"Gestionar con resultados",text:"Transformar lo escuchado en acciones concretas, planificación responsable y soluciones para Cotopaxi.",icon:Check,gradient:"from-purple to-pink",image:"/campaign-gestion.webp",imageAlt:"Hipólito Carrera conversa con una persona durante una reunión de trabajo",position:"64% 44%"},
];

export function CandidateActions(){
  const [active,setActive]=useState<number|null>(null);
  const selected=active===null?null:actions[active];

  return <>
    <div className="grid gap-3 pt-3 sm:grid-cols-3">
      {actions.map(({label,icon:Icon,image,position},index)=><button key={label} type="button" onClick={()=>setActive(index)} className="group overflow-hidden rounded-2xl bg-mist text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg" aria-label={`Ver imagen: ${label}`}><span className="relative block h-28 overflow-hidden bg-deep"><Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" style={{objectPosition:position}}/><span className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-transparent"/><Icon className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white drop-shadow"/></span><span className="block px-3 py-3"><b className="block text-sm text-deep">{label}</b><span className="mt-1 block text-[11px] font-bold text-oceanDark">Ver imagen</span></span></button>)}
    </div>
    {selected&&<div className="fixed inset-0 z-[70] grid place-items-center bg-deep/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={selected.title} onClick={()=>setActive(null)}>
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl" onClick={event=>event.stopPropagation()}>
        <button type="button" onClick={()=>setActive(null)} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-deep text-white shadow-lg" aria-label="Cerrar imagen"><X/></button>
        <div className={`relative h-[430px] bg-gradient-to-br ${selected.gradient}`}><Image src={selected.image} alt={selected.imageAlt} fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" style={{objectPosition:selected.position}}/><div className="absolute inset-0 bg-gradient-to-t from-deep/35 via-transparent to-transparent"/></div>
        <div className="p-6 sm:p-8"><h3 className="font-serif text-2xl font-black text-deep sm:text-3xl">{selected.title}</h3><p className="mt-3 leading-7 text-navy/70">{selected.text}</p></div>
      </div>
    </div>}
  </>;
}
