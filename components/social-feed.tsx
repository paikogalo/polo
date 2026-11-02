"use client";
import {ArrowUpRight,Bell,Radio,Sparkles} from "lucide-react";
import {useEffect,useState} from "react";
import type {SocialUpdate} from "@/lib/social-feed";
import {fallbackSocialUpdates} from "@/lib/social-feed";
import {NotificationOptIn} from "./notification-opt-in";

const LAST_UPDATE_KEY="hc-last-social-update-v1";

export function SocialFeed(){
  const [updates,setUpdates]=useState<SocialUpdate[]>(fallbackSocialUpdates);
  const [latest,setLatest]=useState<SocialUpdate|null>(null);
  useEffect(()=>{
    let active=true;
    const load=async()=>{
      try{
        const response=await fetch("/api/social-feed",{cache:"no-store"});
        if(!response.ok)return;
        const result=await response.json() as {updates:SocialUpdate[]};
        if(!active||!result.updates?.length)return;
        setUpdates(result.updates);
        const newest=result.updates[0];
        const previous=localStorage.getItem(LAST_UPDATE_KEY);
        if(previous&&previous!==newest.id){
          setLatest(newest);
          if("Notification" in window&&Notification.permission==="granted"){
            const notification=new Notification(`Nueva publicación en ${newest.platform}`,{body:newest.title});
            notification.onclick=()=>{window.focus();window.open(newest.url,"_blank","noopener,noreferrer");notification.close();};
          }
        }
        localStorage.setItem(LAST_UPDATE_KEY,newest.id);
      }catch{/* Conserva las novedades de ejemplo si el servicio aún no está conectado. */}
    };
    void load();
    const timer=window.setInterval(load,5*60*1000);
    return()=>{active=false;window.clearInterval(timer);};
  },[]);
  return <section id="novedades" className="relative overflow-hidden bg-deep py-20 text-white">
    <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-purple/35 blur-3xl"/><div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-coral/25 blur-3xl"/>
    <div className="section relative"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span className="chip bg-white/10 text-yellow"><Radio className="mr-1 h-4 w-4"/>En movimiento</span><h2 className="mt-4 font-serif text-4xl font-black sm:text-5xl">Lo nuevo, directo a ti</h2><p className="mt-3 max-w-2xl text-white/65">Publicaciones, videos y actividades oficiales reunidas en una sola pantalla.</p></div><NotificationOptIn/></div>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">{updates.slice(0,6).map((update,index)=><a key={update.id} href={update.url} target={update.url.startsWith("http")?"_blank":undefined} rel={update.url.startsWith("http")?"noreferrer":undefined} className={`group relative overflow-hidden rounded-3xl border border-white/10 transition hover:-translate-y-1 ${index%3===0?"bg-ocean":index%3===1?"bg-purple":"bg-coral"}`}>{update.imageUrl?<div className="h-44 overflow-hidden bg-deep/20"><img src={update.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/></div>:null}<div className="p-6"><div className="flex items-center justify-between"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{update.platform}</span><ArrowUpRight className="transition group-hover:-translate-y-1 group-hover:translate-x-1"/></div><h3 className={`${update.imageUrl?"mt-5":"mt-8"} font-serif text-2xl font-black leading-tight`}>{update.title}</h3><p className="mt-3 text-sm leading-6 text-white/75">{update.excerpt}</p><span className="mt-6 block text-xs font-extrabold text-white">Ver publicación</span></div></a>)}</div>
      <div className="mt-8 text-center"><a href="/redes" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-deep"><Sparkles size={17}/>Ver todas las redes y videos</a></div>
    </div>
    {latest?<div className="fixed bottom-24 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-3 rounded-2xl bg-white p-4 text-deep shadow-2xl"><a href={latest.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral text-white"><Bell/></span><span className="min-w-0 flex-1"><b className="block truncate text-sm">Nueva publicación en {latest.platform}</b><span className="block truncate text-xs text-navy/55">{latest.title}</span></span><ArrowUpRight size={18}/></a><button type="button" onClick={()=>setLatest(null)} className="rounded-full px-2 py-1 text-xs font-black text-navy/45" aria-label="Cerrar aviso">×</button></div>:null}
  </section>;
}
