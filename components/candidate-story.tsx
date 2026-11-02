"use client";

import {useState} from "react";
import Image from "next/image";
import {BriefcaseBusiness,Heart,Landmark} from "lucide-react";
import {CANDIDATE_SRC} from "@/lib/image-src";

const stories=[
  {title:"Familia",text:"Ama profundamente a su familia y reconoce que es el motor que impulsa cada paso de su vida.",icon:Heart},
  {title:"Gestión",text:"Como alcalde de La Maná, convirtió la cercanía con la gente en experiencia para gestionar y servir.",icon:Landmark},
  {title:"Producción",text:"Desde el sector agropecuario ha generado empleo y conoce de primera mano el esfuerzo del campo.",icon:BriefcaseBusiness},
];

export function CandidateStory(){
  const [active,setActive]=useState(0);
  const story=stories[active];
  const Icon=story.icon;

  return <div className="mt-8 overflow-hidden rounded-[2rem] bg-mist shadow-sm">
    <div className="relative h-80"><Image src={CANDIDATE_SRC} alt="Hipólito Carrera" fill unoptimized sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain object-bottom"/></div>
    <div className="border-t border-ocean/10 bg-white p-5">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-[.18em] text-ocean">Haz clic y conoce su historia</p>
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Historia de Hipólito Carrera">
        {stories.map(({title,icon:StoryIcon},index)=><button key={title} type="button" role="tab" aria-selected={active===index} onClick={()=>setActive(index)} className={`rounded-2xl px-2 py-3 text-xs font-bold transition ${active===index?"bg-deep text-white shadow-lg":"bg-mist text-deep hover:bg-ocean/15"}`}><StoryIcon className="mx-auto mb-1 h-5 w-5"/>{title}</button>)}
      </div>
      <div className="mt-4 rounded-2xl bg-ocean/10 p-4" role="tabpanel"><Icon className="mb-2 h-6 w-6 text-ocean"/><b className="text-deep">{story.title}</b><p className="mt-1 text-sm leading-6 text-navy/70">{story.text}</p></div>
    </div>
  </div>;
}
