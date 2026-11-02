"use client";

import {useState} from "react";
import Image from "next/image";
import {ArrowRight,BriefcaseBusiness,Heart,Landmark} from "lucide-react";
import {CANDIDATE_SRC} from "@/lib/image-src";

const stories=[
  {title:"El lado humano",short:"Humano",text:"Nació en La Maná y nunca se alejó de su gente. Ama profundamente a su familia, el motor de su vida.",icon:Heart,href:"/candidato/humano",active:"bg-coral text-white"},
  {title:"El político",short:"Político",text:"Alcalde de La Maná en dos períodos: experiencia de gobierno local para servir a toda la provincia.",icon:Landmark,href:"/candidato/politico",active:"bg-ocean text-deep"},
  {title:"El empresario",short:"Empresario",text:"Más de 20 años en el sector agropecuario: sabe lo que cuesta producir, porque lo ha hecho.",icon:BriefcaseBusiness,href:"/candidato/empresario",active:"bg-yellow text-deep"},
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
        {stories.map(({short,icon:StoryIcon,active:on},index)=><button key={short} type="button" role="tab" aria-selected={active===index} onClick={()=>setActive(index)} className={`rounded-2xl px-2 py-3 text-xs font-bold transition ${active===index?`${on} shadow-lg`:"bg-mist text-deep hover:bg-ocean/15"}`}><StoryIcon className="mx-auto mb-1 h-5 w-5"/>{short}</button>)}
      </div>
      <div className="mt-4 rounded-2xl bg-ocean/10 p-4" role="tabpanel"><Icon className="mb-2 h-6 w-6 text-oceanDark"/><b className="text-deep">{story.title}</b><p className="mt-1 text-sm leading-6 text-navy/70">{story.text}</p><a href={story.href} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-deep px-4 py-2 text-sm font-extrabold text-white">Conocer más<ArrowRight size={16} aria-hidden="true"/></a></div>
    </div>
  </div>;
}
