"use client";
import Image from "next/image";
import {BookOpenText,BriefcaseBusiness,ChevronDown,GraduationCap,Heart,Landmark,LayoutDashboard,Menu,PlayCircle,Target,X} from "lucide-react";
import {useEffect,useRef,useState} from "react";
import {LOGO_SRC} from "@/lib/image-src";
import {NodoButton} from "@/components/nodo/nodo-button";

const antes=[["Inicio","#inicio"],["Participa","#participa"]];
const despues=[["Trabaja","/trabaja"]];
const propuestas=[
  {label:"Ejes de trabajo",desc:"Las prioridades para Cotopaxi",href:"/#ejes",icon:Target,color:"bg-ocean text-deep"},
  {label:"Plan de trabajo",desc:"El plan completo, por ejes",href:"/plan-de-trabajo",icon:BookOpenText,color:"bg-purple text-white"},
  {label:"Redes y videos",desc:"Publicaciones y videoteca",href:"/redes",icon:PlayCircle,color:"bg-pink text-deep"},
];
const candidato=[
  {label:"El lado humano",desc:"Familia, raíces y cercanía",href:"/candidato/humano",icon:Heart,color:"bg-coral text-white"},
  {label:"El político",desc:"Experiencia de gobierno local",href:"/candidato/politico",icon:Landmark,color:"bg-ocean text-deep"},
  {label:"El empresario",desc:"Más de 20 años en el campo",href:"/candidato/empresario",icon:BriefcaseBusiness,color:"bg-yellow text-deep"},
];
/** Botón «Accede a 1000 becas»: morado con texto blanco (contraste AA); hover invierte a amarillo. */
function BecasButton({size="md",onNavigate,className=""}:{size?:"md"|"lg"|"compact";onNavigate?:()=>void;className?:string}){
  const sz={compact:"min-h-11 gap-1.5 px-3 py-2 text-sm",md:"min-h-12 gap-2 px-3 py-3 text-[14px] min-[1366px]:px-4",lg:"min-h-14 gap-2.5 px-6 py-3.5 text-base"}[size];
  return <a href="/becas" onClick={onNavigate} aria-label="Accede a 1000 becas" className={`inline-flex items-center justify-center whitespace-nowrap rounded-full bg-purple font-extrabold text-white shadow-[0_10px_28px_rgba(115,67,154,.35)] ring-2 ring-purple/30 transition duration-200 hover:-translate-y-0.5 hover:bg-yellow hover:text-navy focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy motion-reduce:transform-none ${sz} ${className}`}>
    <GraduationCap size={size==="compact"?17:19} aria-hidden="true"/>
    {size==="md"?<><span className="min-[1500px]:hidden">1000 becas</span><span className="hidden min-[1500px]:inline">Accede a 1000 becas</span></>:size==="compact"?<span>Becas</span>:<span>Accede a 1000 becas</span>}
  </a>;
}

const linkCls="whitespace-nowrap text-[13px] font-bold hover:text-ocean 2xl:text-sm";

export function Header(){
  const [open,setOpen]=useState(false);
  const [menu,setMenu]=useState(false);
  const [movilCand,setMovilCand]=useState(false);
  const [prop,setProp]=useState(false);
  const [movilProp,setMovilProp]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const refProp=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(!prop)return;
    const onDown=(e:MouseEvent)=>{if(refProp.current&&!refProp.current.contains(e.target as Node))setProp(false);};
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setProp(false);};
    document.addEventListener("mousedown",onDown);document.addEventListener("keydown",onKey);
    return ()=>{document.removeEventListener("mousedown",onDown);document.removeEventListener("keydown",onKey);};
  },[prop]);

  useEffect(()=>{
    if(!menu)return;
    const onDown=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setMenu(false);};
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setMenu(false);};
    document.addEventListener("mousedown",onDown);document.addEventListener("keydown",onKey);
    return ()=>{document.removeEventListener("mousedown",onDown);document.removeEventListener("keydown",onKey);};
  },[menu]);

  return <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/95 backdrop-blur">
    <div className="section flex h-20 items-center justify-between gap-4 xl:max-w-[1600px] min-[1760px]:max-w-[1760px]">
      <a href="#inicio" className="flex min-w-0 items-center gap-3 xl:shrink-0" aria-label="Ir al inicio"><Image src={LOGO_SRC} alt="El Polo Carrera" width={54} height={54} unoptimized className="h-12 w-12 shrink-0 object-contain"/><span className="hidden min-w-0 sm:block"><b className="block text-sm leading-tight text-deep">Hipólito Carrera</b><span className="block text-[11px] leading-tight text-ocean sm:text-xs xl:hidden min-[1760px]:block">De POLO a POLO recorremos tu territorio</span></span></a>
      <nav className="hidden items-center gap-2 xl:flex min-[1366px]:gap-2.5 2xl:gap-3" aria-label="Navegación principal">
        {antes.map(([name,href])=><a key={href} href={href} className={linkCls}>{name}</a>)}
        <div className="relative" ref={ref}>
          <button type="button" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-haspopup="true" aria-controls="menu-candidato" className={`${linkCls} inline-flex items-center gap-1`}>TU CANDIDATO<ChevronDown size={16} aria-hidden="true" className={`transition ${menu?"rotate-180":""}`}/></button>
          {menu&&<div id="menu-candidato" className="absolute left-1/2 top-full z-50 mt-4 w-80 -translate-x-1/2 rounded-3xl border border-navy/10 bg-white p-3 shadow-soft">
            <a href="#candidato" onClick={()=>setMenu(false)} className="mb-1 block rounded-2xl px-3 py-2 text-xs font-extrabold uppercase tracking-[.16em] text-navy/55 hover:text-ocean">Conoce a Polo</a>
            {candidato.map(({label,desc,href,icon:Icon,color})=><a key={href} href={href} onClick={()=>setMenu(false)} className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-mist"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${color}`}><Icon size={20} aria-hidden="true"/></span><span><b className="block text-sm text-deep">{label}</b><span className="block text-xs text-navy/60">{desc}</span></span></a>)}
          </div>}
        </div>
        <div className="relative" ref={refProp}>
          <button type="button" onClick={()=>setProp(!prop)} aria-expanded={prop} aria-haspopup="true" aria-controls="menu-propuestas" className={`${linkCls} inline-flex items-center gap-1`}>PROPUESTAS<ChevronDown size={16} aria-hidden="true" className={`transition ${prop?"rotate-180":""}`}/></button>
          {prop&&<div id="menu-propuestas" className="absolute left-1/2 top-full z-50 mt-4 w-80 -translate-x-1/2 rounded-3xl border border-navy/10 bg-white p-3 shadow-soft">
            {propuestas.map(({label,desc,href,icon:Icon,color})=><a key={href} href={href} onClick={()=>setProp(false)} className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-mist"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${color}`}><Icon size={20} aria-hidden="true"/></span><span><b className="block text-sm text-deep">{label}</b><span className="block text-xs text-navy/60">{desc}</span></span></a>)}
          </div>}
        </div>
        {despues.map(([name,href])=><a key={href} href={href} className={linkCls}>{name}</a>)}
        <BecasButton size="md"/>
        <NodoButton ubicacion="menu" size="md" escalonado className="!px-3 min-[1366px]:!px-4"/>
        <a href="/admin" aria-label="Dashboard" className="inline-flex items-center gap-2 rounded-full border border-ocean/30 bg-mist px-3 py-3 text-sm font-extrabold text-deep transition hover:border-ocean hover:bg-ocean hover:text-white 2xl:px-4"><LayoutDashboard size={17} aria-hidden="true"/><span className="hidden 2xl:inline">Dashboard</span></a>
        <a href="#participa" className="whitespace-nowrap rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-sm">Cuéntanos qué necesitas</a>
      </nav>
      <div className="flex shrink-0 items-center gap-1.5 xl:hidden"><BecasButton size="compact"/><NodoButton ubicacion="menu" size="compact" label="NODO · Jóvenes" shortLabel="NODO"/>
        <button onClick={()=>setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-xl" aria-label={open?"Cerrar menú":"Abrir menú"} aria-expanded={open} aria-controls="menu-movil">{open?<X aria-hidden="true"/>:<Menu aria-hidden="true"/>}</button></div>
    </div>
    {open&&<nav id="menu-movil" className="section grid max-h-[calc(100vh-5rem)] gap-2 overflow-y-auto border-t py-4 xl:hidden" aria-label="Navegación móvil">
      <BecasButton size="lg" className="w-full" onNavigate={()=>setOpen(false)}/>
      <NodoButton ubicacion="menu" size="lg" className="mb-2 w-full" onNavigate={()=>setOpen(false)}/>
      {antes.map(([name,href])=><a key={href} href={href} onClick={()=>setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-mist">{name}</a>)}
      <button type="button" onClick={()=>setMovilCand(!movilCand)} aria-expanded={movilCand} className="flex items-center justify-between rounded-xl px-3 py-3 text-left font-bold hover:bg-mist">TU CANDIDATO<ChevronDown size={18} aria-hidden="true" className={`transition ${movilCand?"rotate-180":""}`}/></button>
      {movilCand&&<div className="grid gap-2 pl-2">{candidato.map(({label,href,icon:Icon,color})=><a key={href} href={href} onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 font-bold hover:bg-mist"><span className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}><Icon size={17} aria-hidden="true"/></span>{label}</a>)}</div>}
      <button type="button" onClick={()=>setMovilProp(!movilProp)} aria-expanded={movilProp} className="flex items-center justify-between rounded-xl px-3 py-3 text-left font-bold hover:bg-mist">PROPUESTAS<ChevronDown size={18} aria-hidden="true" className={`transition ${movilProp?"rotate-180":""}`}/></button>
      {movilProp&&<div className="grid gap-2 pl-2">{propuestas.map(({label,href,icon:Icon,color})=><a key={href} href={href} onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 font-bold hover:bg-mist"><span className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}><Icon size={17} aria-hidden="true"/></span>{label}</a>)}</div>}
      {despues.map(([name,href])=><a key={href} href={href} onClick={()=>setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-mist">{name}</a>)}
      <a href="/admin" onClick={()=>setOpen(false)} className="inline-flex items-center gap-2 rounded-xl bg-mist px-3 py-3 font-extrabold text-deep"><LayoutDashboard size={18} aria-hidden="true"/>Dashboard</a>
      <a href="#participa" onClick={()=>setOpen(false)} className="rounded-xl bg-coral px-3 py-3 text-center font-extrabold text-white">Cuéntanos qué necesitas</a>
    </nav>}
  </header>
}
