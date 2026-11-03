import type {Metadata} from "next";
import Image from "next/image";
import {ArrowLeft,BadgeCheck,Droplets,ExternalLink,Landmark,MapPinned,Plane,Radio,ScrollText,Sprout} from "lucide-react";
import {LOGO_SRC} from "@/lib/image-src";
import {compromisos,cotopaxi,fuentes,intro,nota,type Dato} from "@/lib/compromisos";

export const metadata:Metadata={
  title:"Lo que vamos a hacer",
  description:"Compromisos de Hipólito Carrera para Cotopaxi: agua, riego y reactivación del aeropuerto de Latacunga, con datos verificados y fuentes.",
};

const iconos={agua:Droplets,riego:Sprout,aeropuerto:Plane} as const;
const temas={
  agua:{icono:"bg-ocean text-deep",acento:"text-oceanDark",dato:"bg-mist"},
  riego:{icono:"bg-yellow text-deep",acento:"text-coralDark",dato:"bg-yellow/15"},
  aeropuerto:{icono:"bg-coral text-white",acento:"text-coralDark",dato:"bg-coral/10"},
} as const;

function Fuente({n}:{n:number}){
  return <a href={`#fuente-${n+1}`} className="ml-0.5 align-super text-[10px] font-bold text-navy/50 hover:text-ocean" aria-label={`Fuente ${n+1}`}>[{n+1}]</a>;
}

function Cifra({d,fondo}:{d:Dato;fondo:string}){
  return <div className={`rounded-2xl ${fondo} p-4`}>
    <b className="block font-serif text-2xl font-black leading-tight text-deep sm:text-3xl">{d.valor}</b>
    <span className="mt-1 block text-sm leading-5 text-navy/70">{d.texto}<Fuente n={d.fuente}/></span>
  </div>;
}

export default function CompromisosPage(){
  return <main className="min-h-screen bg-sand">
    <header className="border-b border-navy/10 bg-white">
      <div className="section flex min-h-20 items-center justify-between gap-3 py-3">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <Image src={LOGO_SRC} alt="El Polo Carrera" width={54} height={54} unoptimized className="h-12 w-12 shrink-0 object-contain"/>
          <span className="min-w-0"><b className="block text-sm text-deep">Hipólito Carrera</b><span className="hidden truncate text-xs text-ocean sm:block">De POLO a POLO recorremos tu territorio</span></span>
        </a>
        <nav className="flex shrink-0 items-center gap-2" aria-label="Accesos principales">
          <a href="/plan-de-trabajo" className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-sm font-bold text-deep"><ScrollText size={17} aria-hidden="true"/><span className="hidden sm:inline">Plan de trabajo</span></a>
          <a href="/redes" className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-sm font-bold text-deep"><Radio size={17} aria-hidden="true"/><span className="hidden sm:inline">Redes</span></a>
          <a href="/" className="inline-flex items-center gap-2 rounded-full border border-navy/10 px-3 py-2 text-sm font-bold text-deep"><ArrowLeft size={17} aria-hidden="true"/><span className="hidden lg:inline">Inicio</span></a>
        </nav>
      </div>
    </header>

    <section className="relative overflow-hidden bg-deep py-12 text-white sm:py-16">
      <div className="absolute inset-0 grid-territory opacity-15" aria-hidden="true"/>
      <div className="section relative">
        <span className="chip bg-white/10 text-yellow"><MapPinned className="mr-1 h-4 w-4" aria-hidden="true"/>Compromisos con Cotopaxi</span>
        <h1 className="mt-5 max-w-4xl font-serif text-4xl font-black leading-[1.02] sm:text-6xl">{intro.titulo}</h1>
        <p className="mt-5 max-w-3xl text-xl font-bold leading-snug text-yellow sm:text-2xl">{intro.bajada}</p>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">{intro.texto}</p>
        <nav className="mt-8 flex flex-wrap gap-3" aria-label="Compromisos">
          {compromisos.map(c=>{const Icon=iconos[c.id as keyof typeof iconos];return <a key={c.id} href={`#${c.id}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 py-3 font-extrabold text-deep transition hover:bg-yellow"><Icon size={19} aria-hidden="true"/>{c.etiqueta}</a>})}
          <a href="#cotopaxi" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-5 py-3 font-extrabold text-white transition hover:bg-white/10"><MapPinned size={19} aria-hidden="true"/>Cotopaxi en datos</a>
        </nav>
      </div>
    </section>

    <section id="cotopaxi" className="section scroll-mt-6 py-14">
      <span className="chip bg-ocean/10 text-oceanDark">Conocer para decidir</span>
      <h2 className="mt-4 font-serif text-3xl font-black text-deep sm:text-4xl">Cotopaxi en datos</h2>
      <p className="mt-3 max-w-2xl leading-7 text-navy/70">Las cifras que explican por qué el agua, el riego y la conectividad son urgentes.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cotopaxi.map(d=><Cifra key={d.texto} d={d} fondo="bg-white shadow-sm"/>)}
      </div>
    </section>

    <div className="space-y-6 pb-6">
      {compromisos.map((c,i)=>{
        const Icon=iconos[c.id as keyof typeof iconos];
        const t=temas[c.id as keyof typeof temas];
        return <section key={c.id} id={c.id} className={`scroll-mt-6 py-14 ${i%2===0?"bg-white":""}`}>
          <div className="section">
            <div className="flex items-center gap-4">
              <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${t.icono}`}><Icon size={26} aria-hidden="true"/></span>
              <div><span className="block text-xs font-extrabold uppercase tracking-[.16em] text-navy/55">Compromiso {i+1} de {compromisos.length}</span><h2 className="font-serif text-3xl font-black text-deep sm:text-4xl">{c.titulo}</h2></div>
            </div>
            <p className={`mt-4 text-xl font-extrabold ${t.acento}`}>{c.frase}</p>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:gap-12">
              <div>
                {c.foto?<div className="overflow-hidden rounded-[1.75rem] shadow-soft ring-1 ring-navy/10"><Image src={c.foto.src} alt={c.foto.alt} width={900} height={700} className="aspect-[4/3] h-auto w-full object-cover"/></div>
                :<div className="relative overflow-hidden rounded-[1.75rem] bg-deep p-6 text-white shadow-soft sm:p-8">
                  <div className="absolute inset-0 grid-territory opacity-20" aria-hidden="true"/>
                  <Plane className="relative h-12 w-12 text-yellow" aria-hidden="true"/>
                  <p className="relative mt-4 text-sm font-extrabold uppercase tracking-[.16em] text-white/60">Aeropuerto Internacional Cotopaxi · Latacunga</p>
                  <p className="relative mt-2 font-serif text-5xl font-black sm:text-6xl">LTX</p>
                  <p className="relative mt-3 max-w-sm leading-7 text-white/75">Infraestructura lista para carga y pasajeros que hoy espera rutas, permisos y un plan productivo.</p>
                </div>}
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {c.datos.map(d=><Cifra key={d.texto} d={d} fondo={t.dato}/>)}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-[.16em] text-navy/55">Lo que pasa hoy</h3>
                <ul className="mt-3 space-y-3">
                  {c.problema.map(p=><li key={p} className="flex gap-3 leading-7 text-navy/75"><span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-coral" aria-hidden="true"/>{p}</li>)}
                </ul>

                <h3 className="mt-8 text-sm font-extrabold uppercase tracking-[.16em] text-navy/55">Lo que vamos a hacer</h3>
                <ol className="mt-3 space-y-3">
                  {c.acciones.map((a,k)=><li key={a.titulo} className="flex gap-4 rounded-2xl border border-navy/10 bg-sand p-4">
                    <span className="font-serif text-2xl font-black text-coralDark">{k+1}</span>
                    <div>
                      <b className="text-deep">{a.titulo}</b>
                      {a.enPlan&&<span className="ml-2 inline-flex items-center gap-1 rounded-full bg-ocean/15 px-2 py-0.5 align-middle text-[11px] font-extrabold text-oceanDark"><BadgeCheck size={12} aria-hidden="true"/>En el plan</span>}
                      <p className="mt-1 text-sm leading-6 text-navy/70">{a.texto}</p>
                    </div>
                  </li>)}
                </ol>

                <div className="mt-6 flex gap-3 rounded-2xl bg-deep/5 p-4">
                  <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-oceanDark" aria-hidden="true"/>
                  <p className="text-sm leading-6 text-navy/75"><b className="text-deep">Qué le toca a la Prefectura: </b>{c.competencia}<Fuente n={0}/></p>
                </div>
              </div>
            </div>
          </div>
        </section>;
      })}
    </div>

    <section className="section pb-16">
      <div className="flex flex-col items-start gap-4 rounded-3xl bg-deep p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div>
          <h2 className="font-serif text-3xl font-black">¿Falta agua o riego en tu comunidad?</h2>
          <p className="mt-2 max-w-xl leading-7 text-white/75">Cuéntanos dónde y qué pasa. Tu aporte ayuda a priorizar estos compromisos.</p>
        </div>
        <a href="/#participa" className="shrink-0 rounded-full bg-coral px-6 py-3 font-extrabold text-white">Cuéntanos qué necesitas</a>
      </div>

      <p className="mt-8 max-w-4xl text-sm leading-6 text-navy/65">{nota}</p>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-black text-deep">Fuentes</h2>
        <ol className="mt-4 grid gap-2 text-sm leading-6 text-navy/70 md:grid-cols-2">
          {fuentes.map((f,i)=><li key={f.url+i} id={`fuente-${i+1}`} className="scroll-mt-6">
            <span className="font-bold text-navy/50">[{i+1}] </span>
            <a href={f.url} {...(f.url.startsWith("http")?{target:"_blank",rel:"noopener noreferrer"}:{})} className="font-semibold text-deep underline decoration-ocean/40 underline-offset-2 hover:text-oceanDark">{f.titulo}</a>
            {f.url.startsWith("http")&&<ExternalLink className="ml-1 inline h-3.5 w-3.5 text-navy/40" aria-hidden="true"/>}
            <span> · {f.medio}, {f.fecha}</span>
          </li>)}
        </ol>
      </div>
    </section>
  </main>;
}
