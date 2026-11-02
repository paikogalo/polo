"use client";
import {AlertTriangle,Check,Copy,ExternalLink,LogOut,Radio,RefreshCw,Share2} from "lucide-react";
import {useCallback,useEffect,useMemo,useState} from "react";
import type {Impact,MonitorItem,MonitorResult} from "@/lib/escucha/monitor";
import {MEDIOS_COTOPAXI,TOPIC_LABELS,type Topic} from "@/lib/escucha/sources";

type FeedResponse=MonitorResult&{telegram:boolean};

const IMPACT_STYLE:Record<Impact,string>={
  alto:"bg-coral text-white",
  medio:"bg-yellow/20 text-navy",
  bajo:"bg-mist text-oceanDark",
};

const RANGES=[{hours:12,label:"12 h"},{hours:24,label:"24 h"},{hours:48,label:"48 h"},{hours:168,label:"7 días"}];

const time=(iso:string|null)=>iso?new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(iso)):"Sin fecha";

function digest(items:MonitorItem[]){
  const lines=["ESCUCHA DIGITAL · Resumen",new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",dateStyle:"full",timeStyle:"short"}).format(new Date()),""];
  items.slice(0,15).forEach(item=>lines.push(`• [${item.impact}] ${item.title} — ${item.outlet}`,`  ${item.url}`));
  if(!items.length)lines.push("Sin novedades en el filtro seleccionado.");
  lines.push("","Verificar cada nota antes de reaccionar o difundir.");
  return lines.join("\n");
}

export function EscuchaDashboard({email,onLogout}:{email:string;onLogout:()=>void}){
  const [data,setData]=useState<FeedResponse|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [hours,setHours]=useState(48);
  const [topic,setTopic]=useState<Topic|"todos">("todos");
  const [impact,setImpact]=useState<Impact|"todos">("todos");
  const [copied,setCopied]=useState(false);
  const [canton,setCanton]=useState("Todos");
  const cantones=useMemo(()=>["Todos",...[...new Set(MEDIOS_COTOPAXI.map(medio=>medio.canton))].sort()],[]);
  const medios=MEDIOS_COTOPAXI.filter(medio=>canton==="Todos"||medio.canton===canton);

  const load=useCallback(async(range:number)=>{
    setLoading(true);setError("");
    try{
      const response=await fetch(`/api/escucha/feed?horas=${range}`,{cache:"no-store"});
      if(response.status===401){onLogout();return;}
      if(!response.ok)throw new Error();
      setData(await response.json());
    }catch{setError("No se pudo actualizar el monitor. Intenta nuevamente.");}
    finally{setLoading(false);}
  },[onLogout]);

  useEffect(()=>{load(hours);},[hours,load]);
  useEffect(()=>{const timer=setInterval(()=>load(hours),10*60*1000);return()=>clearInterval(timer);},[hours,load]);

  const items=useMemo(()=>(data?.items||[]).filter(item=>(topic==="todos"||item.topics.includes(topic))&&(impact==="todos"||item.impact===impact)),[data,topic,impact]);
  const counts=useMemo(()=>{
    const all=data?.items||[];
    return {
      alto:all.filter(item=>item.impact==="alto").length,
      tiban:all.filter(item=>item.topics.includes("tiban")).length,
      polo:all.filter(item=>item.topics.includes("polo")).length,
      total:all.length,
    };
  },[data]);

  const copy=async()=>{await navigator.clipboard.writeText(digest(items));setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const whatsapp=`https://wa.me/?text=${encodeURIComponent(digest(items))}`;
  const failing=data?.sources.filter(source=>!source.ok)||[];

  return <main className="min-h-screen bg-sand pb-16">
    <header className="bg-deep text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ocean"><Radio aria-hidden="true"/></span>
          <div><h1 className="text-xl font-black">Escucha digital</h1><p className="text-xs text-white/60">Monitor privado · {email}</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>load(hours)} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold disabled:opacity-50"><RefreshCw size={16} className={loading?"animate-spin":""} aria-hidden="true"/>Actualizar</button>
          <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold"><LogOut size={16} aria-hidden="true"/>Salir</button>
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-6xl space-y-5 px-4 pt-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Indicadores">
        {[{label:"Alertas de impacto alto",value:counts.alto,tone:"text-coral"},{label:"Notas sobre Lourdes Tibán",value:counts.tiban,tone:"text-purple"},{label:"Menciones de la campaña",value:counts.polo,tone:"text-ocean"},{label:"Notas en el periodo",value:counts.total,tone:"text-deep"}].map(card=>
          <div key={card.label} className="rounded-2xl bg-white p-4 shadow-soft"><p className={`text-3xl font-black ${card.tone}`}>{loading&&!data?"–":card.value}</p><p className="mt-1 text-xs font-bold text-navy/60">{card.label}</p></div>)}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-soft" aria-label="Filtros">
        <div className="flex flex-wrap gap-2">{RANGES.map(range=><button key={range.hours} onClick={()=>setHours(range.hours)} aria-pressed={hours===range.hours} className={`chip ${hours===range.hours?"bg-deep text-white":"bg-sand text-navy"}`}>{range.label}</button>)}</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setTopic("todos")} aria-pressed={topic==="todos"} className={`chip ${topic==="todos"?"bg-ocean text-white":"bg-sand text-navy"}`}>Todos los temas</button>
          {(Object.keys(TOPIC_LABELS) as Topic[]).map(key=><button key={key} onClick={()=>setTopic(key)} aria-pressed={topic===key} className={`chip ${topic===key?"bg-ocean text-white":"bg-sand text-navy"}`}>{TOPIC_LABELS[key]}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["todos","alto","medio","bajo"] as const).map(level=><button key={level} onClick={()=>setImpact(level)} aria-pressed={impact===level} className={`chip ${impact===level?"bg-navy text-white":"bg-sand text-navy"}`}>{level==="todos"?"Todo impacto":`Impacto ${level}`}</button>)}
          <span className="ml-auto flex gap-2">
            <button onClick={copy} className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-2 text-xs font-bold text-navy">{copied?<Check size={14} aria-hidden="true"/>:<Copy size={14} aria-hidden="true"/>}{copied?"Copiado":"Copiar resumen"}</button>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-3 py-2 text-xs font-bold text-white"><Share2 size={14} aria-hidden="true"/>Compartir por WhatsApp</a>
          </span>
        </div>
      </section>

      {error?<p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>:null}
      {data&&!data.telegram?<p className="rounded-2xl bg-yellow/15 p-4 text-sm text-navy">Las alertas automáticas al grupo de Telegram aún no están configuradas. El monitor funciona; el reenvío por WhatsApp es manual.</p>:null}

      <section aria-label="Notas" aria-busy={loading} className="space-y-3">
        {loading&&!data?Array.from({length:4}).map((_,index)=><div key={index} className="h-24 animate-pulse rounded-2xl bg-white"/>):null}
        {data&&!items.length?<p className="rounded-2xl bg-white p-6 text-center text-sm text-navy/60 shadow-soft">Sin novedades verificables con este filtro.</p>:null}
        {items.map(item=><article key={item.id} className="rounded-2xl bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`chip ${IMPACT_STYLE[item.impact]}`}>{item.impact==="alto"?<AlertTriangle size={12} className="mr-1" aria-hidden="true"/>:null}Impacto {item.impact}</span>
            {item.topics.map(key=><span key={key} className="chip bg-sand text-navy/70">{TOPIC_LABELS[key]}</span>)}
            <span className="ml-auto text-navy/50">{time(item.publishedAt)}</span>
          </div>
          <h2 className="mt-2 font-extrabold leading-snug text-deep">{item.title}</h2>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-navy/60">{item.outlet}</span>
            <span className="flex gap-3">
              <a href={`https://wa.me/?text=${encodeURIComponent(`${item.title} — ${item.outlet}\n${item.url}`)}`} target="_blank" rel="noreferrer" className="font-bold text-[#128C7E]">WhatsApp</a>
              <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-ocean">Abrir nota<ExternalLink size={12} aria-hidden="true"/></a>
            </span>
          </div>
        </article>)}
      </section>

      <details className="rounded-2xl bg-white p-4 text-sm shadow-soft">
        <summary className="cursor-pointer font-bold text-navy">Directorio de medios de Cotopaxi ({MEDIOS_COTOPAXI.length})</summary>
        <p className="mt-2 text-xs text-navy/60">Los sitios web se leen automáticamente por RSS. Facebook, Instagram, TikTok y X no permiten lectura gratuita de cuentas ajenas: ábrelas desde aquí para revisión manual.</p>
        <div className="mt-3 flex flex-wrap gap-2">{cantones.map(item=><button key={item} onClick={()=>setCanton(item)} aria-pressed={canton===item} className={`chip ${canton===item?"bg-deep text-white":"bg-sand text-navy"}`}>{item}</button>)}</div>
        <ul className="mt-3 divide-y divide-navy/10">{medios.map(medio=><li key={medio.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
          <span><span className="font-bold text-deep">{medio.name}</span> <span className="text-xs text-navy/50">· {medio.category} · {medio.canton}</span></span>
          <span className="flex flex-wrap gap-2">{medio.profiles.length?medio.profiles.map(profile=><a key={profile.url} href={profile.url} target="_blank" rel="noreferrer" className="chip bg-mist text-oceanDark">{profile.platform==="WEB"?"Web":profile.platform.charAt(0)+profile.platform.slice(1).toLowerCase()}</a>):<span className="text-xs text-navy/40">Sin enlace verificado</span>}</span>
        </li>)}</ul>
      </details>

      {data?<details className="rounded-2xl bg-white p-4 text-sm shadow-soft">
        <summary className="cursor-pointer font-bold text-navy">Fuentes monitoreadas ({data.sources.length}){failing.length?` · ${failing.length} con error`:""}</summary>
        <ul className="mt-3 space-y-1 text-xs text-navy/70">{data.sources.map(source=><li key={source.id}>{source.ok?"✓":"✗"} {source.name} — {source.ok?`${source.count} entradas`:source.error}</li>)}</ul>
        <p className="mt-3 text-xs text-navy/50">Actualizado: {time(data.generatedAt)}. La clasificación es automática por palabras clave; verifica cada nota antes de reaccionar. Solo se monitorea información pública de medios, figuras públicas e instituciones.</p>
      </details>:null}
    </div>
  </main>;
}
