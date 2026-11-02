"use client";
import {BellRing,Clock3,ExternalLink,MailCheck} from "lucide-react";
import {useEffect,useState} from "react";

type Metric={name:string;value:number};
type Member={full_name:string;email:string;source:string};
type Audience={total:number;pending:number;pushSubscribers:number;byGender:Metric[];byAge:Metric[];byCanton:Metric[];byParish:Metric[];byNeighborhood:Metric[];bySource:Metric[];members:Member[]};

export function AudienceOverview({accessToken}:{accessToken?:string}){
  const [data,setData]=useState<Audience|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    const headers:HeadersInit|undefined=accessToken?{Authorization:`Bearer ${accessToken}`}:undefined;
    fetch("/api/admin/audience",{headers,signal:controller.signal})
      .then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.error);setData(result);})
      .catch(reason=>{if(reason.name!=="AbortError")setError(reason.message||"No se pudieron cargar las métricas.");});
    return()=>controller.abort();
  },[accessToken]);

  return <section className="mt-7 rounded-3xl bg-deep p-6 text-white shadow-xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="chip bg-white/10 text-yellow">Datos voluntarios</span><h2 className="mt-3 font-serif text-2xl font-black">Comunidad y alcance</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-white/55">El target se calcula exclusivamente con personas adultas que confirmaron su correo y mantienen su autorización. Género, edad, cantón, parroquia y barrio se presentan solo como estadísticas agrupadas. No se infieren ni guardan estos datos para visitantes anónimos.</p></div><a href="https://vercel.com/polo14/hipolito-territorio/analytics" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-deep">Visitas agregadas<ExternalLink size={14}/></a></div>
    {error?<div className="mt-6 rounded-2xl bg-coral/20 p-4 text-sm">{error}</div>:!data?<div className="mt-6 text-sm text-white/55">Cargando métricas…</div>:<>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><MetricCard icon={MailCheck} label="Correos confirmados" value={data.total}/><MetricCard icon={Clock3} label="Pendientes de confirmar" value={data.pending}/><MetricCard icon={BellRing} label="Alertas activas" value={data.pushSubscribers}/></div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><MetricList title="Género" values={data.byGender}/><MetricList title="Rangos de edad" values={data.byAge}/><MetricList title="Cantones" values={data.byCanton}/><MetricList title="Parroquias" values={data.byParish}/><MetricList title="Barrios o comunidades" values={data.byNeighborhood}/><MetricList title="Origen: web o aplicativo" values={data.bySource}/></div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white text-deep"><table className="w-full min-w-[520px] text-left text-xs"><caption className="sr-only">Lista privada de personas adultas con correo confirmado</caption><thead className="bg-sand"><tr>{["Nombre","Correo","Origen"].map(header=><th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody>{data.members.map(member=><tr key={member.email} className="border-t border-navy/10"><td className="px-4 py-3 font-bold">{member.full_name}</td><td className="px-4 py-3">{member.email}</td><td className="px-4 py-3 font-bold text-ocean">{member.source==="web"?"Web":"Aplicativo"}</td></tr>)}</tbody></table></div>
    </>}
  </section>;
}

function MetricCard({icon:Icon,label,value}:{icon:typeof MailCheck;label:string;value:number}){return <div className="rounded-2xl bg-white/10 p-4"><Icon className="text-yellow"/><span className="mt-3 block text-xs text-white/55">{label}</span><b className="mt-1 block text-3xl">{value}</b></div>}
function MetricList({title,values}:{title:string;values:Metric[]}){const max=Math.max(1,...values.map(value=>value.value));return <div className="rounded-2xl bg-white/5 p-5"><h3 className="text-sm font-extrabold">{title}</h3><div className="mt-4 space-y-3">{values.length?values.slice(0,6).map(value=><div key={value.name}><div className="flex justify-between text-xs"><span>{value.name}</span><b>{value.value}</b></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-ocean" style={{width:`${Math.max(6,value.value/max*100)}%`}}/></div></div>):<p className="text-xs text-white/45">Todavía no hay registros.</p>}</div></div>}
