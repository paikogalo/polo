"use client";
import Image from "next/image";
import {LayoutDashboard,Menu,X} from "lucide-react";
import {useState} from "react";
import {LOGO_SRC} from "@/lib/image-src";
const links=[["Inicio","#inicio"],["Participa","#participa"],["TU CANDIDATO","#candidato"],["Ejes de trabajo","#ejes"],["Plan de trabajo","/plan-de-trabajo"],["Redes y videos","/redes"],["Trabaja","/trabaja"]];
export function Header(){
  const [open,setOpen]=useState(false);
  return <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/95 backdrop-blur">
    <div className="section flex h-20 items-center justify-between">
      <a href="#inicio" className="flex items-center gap-3" aria-label="Ir al inicio"><Image src={LOGO_SRC} alt="El Polo Carrera" width={54} height={54} unoptimized className="h-12 w-12 object-contain"/><span><b className="block text-sm leading-tight text-deep">Hipólito Carrera</b><span className="text-xs text-ocean">De POLO a POLO recorremos tu territorio</span></span></a>
      <nav className="hidden items-center gap-3 xl:flex" aria-label="Navegación principal">{links.map(([name,href])=><a key={href} href={href} className="text-sm font-bold hover:text-ocean">{name}</a>)}<a href="/admin" className="inline-flex items-center gap-2 rounded-full border border-ocean/30 bg-mist px-4 py-3 text-sm font-extrabold text-deep transition hover:border-ocean hover:bg-ocean hover:text-white"><LayoutDashboard size={17} aria-hidden="true"/>Dashboard</a><a href="#participa" className="rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-sm">Cuéntanos qué necesitas</a></nav>
      <button onClick={()=>setOpen(!open)} className="rounded-xl p-2 xl:hidden" aria-label={open?"Cerrar menú":"Abrir menú"} aria-expanded={open} aria-controls="menu-movil">{open?<X aria-hidden="true"/>:<Menu aria-hidden="true"/>}</button>
    </div>
    {open&&<nav id="menu-movil" className="section grid gap-2 border-t py-4 xl:hidden" aria-label="Navegación móvil">{links.map(([name,href])=><a key={href} href={href} onClick={()=>setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-mist">{name}</a>)}<a href="/admin" onClick={()=>setOpen(false)} className="inline-flex items-center gap-2 rounded-xl bg-mist px-3 py-3 font-extrabold text-deep"><LayoutDashboard size={18} aria-hidden="true"/>Dashboard</a><a href="#participa" onClick={()=>setOpen(false)} className="rounded-xl bg-coral px-3 py-3 text-center font-extrabold text-white">Cuéntanos qué necesitas</a></nav>}
  </header>
}
