import type {Metadata} from "next";
import Image from "next/image";
import {ArrowLeft,CheckCircle2,ClipboardList,Droplets,FileDown,HeartHandshake,Leaf,Mountain,Radio,Route,ScrollText,ShieldCheck,Sprout} from "lucide-react";
import {PlanInfografia} from "@/components/plan-infografia";
import {LOGO_SRC} from "@/lib/image-src";
import {descargas,diagnostico,ejes,infografias,nota,planIntro,ruta} from "@/lib/plan-trabajo";

export const metadata:Metadata={
  title:"Plan de Trabajo 2027-2031",
  description:"Resumen del Plan de Trabajo de Hipólito Carrera para la Prefectura de Cotopaxi: vías, riego, producción, ambiente, familias y gestión transparente.",
};

const iconos:Record<string,typeof Route>={vialidad:Route,produccion:Sprout,turismo:Mountain,ambiente:Leaf,familias:HeartHandshake,gestion:ShieldCheck};
const plan=descargas.plan.href;

export default function PlanPage(){
  return <main className="min-h-screen bg-sand">
    <header className="border-b border-navy/10 bg-white">
      <div className="section flex min-h-20 items-center justify-between gap-3 py-3">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <Image src={LOGO_SRC} alt="El Polo Carrera" width={54} height={54} unoptimized className="h-12 w-12 shrink-0 object-contain"/>
          <span className="min-w-0"><b className="block text-sm text-deep">Hipólito Carrera</b><span className="hidden truncate text-xs text-ocean sm:block">De POLO a POLO recorremos tu territorio</span></span>
        </a>
        <nav className="flex shrink-0 items-center gap-2" aria-label="Accesos principales">
          <a href={plan} download className="inline-flex items-center gap-2 rounded-full bg-coral px-3 py-2 text-sm font-bold text-white"><FileDown size={17} aria-hidden="true"/><span className="hidden sm:inline">Descargar PDF</span></a>
          <a href="/redes" className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-sm font-bold text-deep"><Radio size={17}/><span className="hidden sm:inline">Redes</span></a>
          <a href="/" className="inline-flex items-center gap-2 rounded-full border border-navy/10 px-3 py-2 text-sm font-bold text-deep"><ArrowLeft size={17}/><span className="hidden lg:inline">Inicio</span></a>
        </nav>
      </div>
    </header>

    <section className="relative overflow-hidden bg-deep py-12 text-white sm:py-16">
      <div className="absolute inset-0 grid-territory opacity-15"/>
      <div className="section relative grid items-center gap-10 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-14">
        <PlanInfografia slug={infografias.portada.slug} titulo={infografias.portada.titulo} planHref={plan} className="mx-auto w-full max-w-md lg:max-w-none"/>
        <div>
          <span className="chip bg-white/10 text-yellow"><ScrollText className="mr-1 h-4 w-4"/>Prefectura de Cotopaxi</span>
          <h1 className="mt-5 font-serif text-4xl font-black sm:text-6xl">{planIntro.titulo}</h1>
          <p className="mt-4 text-xl font-bold text-yellow">{planIntro.bajada}</p>
          <p className="mt-5 text-lg leading-8 text-white/75">{planIntro.texto}</p>
          <a href="#ejes-plan" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-yellow px-6 py-3 font-extrabold text-deep">Ver los 6 ejes de trabajo</a>
        </div>
      </div>
    </section>

    <section className="section grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-14">
      <PlanInfografia slug={infografias.diagnostico.slug} titulo={infografias.diagnostico.titulo} planHref={plan} className="mx-auto w-full max-w-md lg:max-w-none"/>
      <div>
        <span className="chip bg-coral/10 text-coralDark"><ClipboardList className="mr-1 h-4 w-4"/>Nuestra visión</span>
        <h2 className="mt-4 font-serif text-3xl font-black text-deep">La Cotopaxi que queremos al 2031</h2>
        <p className="mt-4 text-lg leading-8 text-navy/70">{planIntro.vision}</p>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <h3 className="font-serif text-2xl font-black text-deep">Lo que encontramos en territorio</h3>
          <ul className="mt-5 space-y-4">
            {diagnostico.map(d=><li key={d} className="flex gap-3 text-navy/75"><Droplets className="mt-1 h-5 w-5 shrink-0 text-ocean" aria-hidden="true"/><span className="leading-7">{d}</span></li>)}
          </ul>
        </div>
      </div>
    </section>

    <section className="bg-white py-16" id="ejes-plan">
      <div className="section">
        <span className="chip bg-ocean/10 text-oceanDark">6 ejes de trabajo</span>
        <h2 className="mt-4 font-serif text-3xl font-black text-deep sm:text-4xl">Compromisos con metas claras</h2>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Ejes del plan">
          {ejes.map(e=><a key={e.id} href={`#${e.id}`} className="rounded-full border border-navy/10 bg-mist px-4 py-2 text-sm font-bold text-deep hover:bg-ocean hover:text-white">{e.titulo}</a>)}
        </nav>
        <div className="mt-12 space-y-16 lg:space-y-20">
          {ejes.map((e,i)=>{const Icon=iconos[e.id]??CheckCircle2;return <article key={e.id} id={e.id} className="grid scroll-mt-8 items-center gap-8 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-14">
            <PlanInfografia slug={e.infografia} titulo={e.titulo} planHref={plan} className="mx-auto w-full max-w-md lg:max-w-none"/>
            <div className="rounded-3xl border border-navy/10 bg-sand p-6 sm:p-8">
              <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-deep text-yellow"><Icon aria-hidden="true"/></span><div><span className="block text-xs font-extrabold uppercase tracking-wider text-navy/55">Eje {i+1} de {ejes.length}</span><h3 className="font-serif text-2xl font-black text-deep">{e.titulo}</h3></div></div>
              <p className="mt-4 text-lg font-bold text-coralDark">{e.frase}</p>
              <p className="mt-2 text-sm leading-6 text-navy/65"><b className="text-navy/85">El problema: </b>{e.problema}</p>
              <ul className="mt-5 space-y-3">
                {e.compromisos.map(c=><li key={c.detalle} className="flex gap-3 rounded-2xl bg-white p-4"><b className="min-w-[5.5rem] shrink-0 text-oceanDark">{c.meta}</b><span className="text-sm leading-6 text-navy/75">{c.detalle}</span></li>)}
              </ul>
            </div>
          </article>})}
        </div>
      </div>
    </section>

    <section className="section grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-14">
      <PlanInfografia slug={infografias.ruta.slug} titulo={infografias.ruta.titulo} planHref={plan} className="mx-auto w-full max-w-md lg:max-w-none"/>
      <div>
        <span className="chip bg-yellow/20 text-deep">Hoja de ruta</span>
        <h2 className="mt-4 font-serif text-3xl font-black text-deep">Cómo lo vamos a cumplir</h2>
        <ol className="mt-8 space-y-4">
          {ruta.map((r,i)=><li key={r.etapa} className="flex gap-4 rounded-3xl bg-white p-6 shadow-sm"><span className="font-serif text-4xl font-black text-coralDark">{i+1}</span><div><h3 className="text-lg font-black text-deep">{r.etapa}</h3><p className="mt-1 text-sm leading-6 text-navy/70">{r.texto}</p></div></li>)}
        </ol>
      </div>
    </section>

    <section className="section pb-16">
      <div className="grid gap-6 rounded-3xl bg-deep p-6 text-white sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h2 className="font-serif text-3xl font-black">Lleva el plan contigo</h2>
          <p className="mt-3 max-w-xl leading-7 text-white/75">Descarga el documento completo inscrito para la Prefectura de Cotopaxi o el resumen en infografías para compartirlo con tu comunidad.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a href={plan} download className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 font-extrabold text-white"><FileDown size={19} aria-hidden="true"/>Descarga el plan de trabajo <span className="font-semibold text-white/80">({descargas.plan.peso})</span></a>
          <a href={descargas.resumen.href} download className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-deep"><FileDown size={19} aria-hidden="true"/>Resumen en infografías <span className="font-semibold text-navy/60">({descargas.resumen.peso})</span></a>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-start gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <p className="max-w-2xl text-lg font-bold text-deep">¿Qué necesita tu comunidad? Tu aporte ayuda a priorizar este plan.</p>
        <a href="/#participa" className="rounded-full bg-deep px-6 py-3 font-extrabold text-white">Cuéntanos qué necesitas</a>
      </div>
      <p className="mt-8 text-xs leading-5 text-navy/55">{nota} En la versión descargable se protegieron los números de cédula del binomio.</p>
    </section>
  </main>
}
