import type {Metadata} from "next";
import Image from "next/image";
import {notFound} from "next/navigation";
import {ArrowLeft,ArrowRight,BriefcaseBusiness,Heart,Landmark,Radio,ScrollText} from "lucide-react";
import {LOGO_SRC} from "@/lib/image-src";
import {facetas,getFaceta} from "@/lib/candidato";

const iconos={humano:Heart,politico:Landmark,empresario:BriefcaseBusiness};

export function generateStaticParams(){return facetas.map(f=>({faceta:f.slug}));}

export async function generateMetadata({params}:{params:Promise<{faceta:string}>}):Promise<Metadata>{
  const {faceta}=await params;
  const f=getFaceta(faceta);
  if(!f)return {};
  return {title:`${f.titulo} · Tu candidato`,description:`${f.frase} Conoce a Hipólito "Polo" Carrera.`};
}

export default async function FacetaPage({params}:{params:Promise<{faceta:string}>}){
  const {faceta}=await params;
  const f=getFaceta(faceta);
  if(!f)notFound();
  const Icon=iconos[f.slug];
  const idx=facetas.findIndex(x=>x.slug===f.slug);
  const siguiente=facetas[(idx+1)%facetas.length];
  const [principal,...galeria]=f.fotos;

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

    <div className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 backdrop-blur">
      <nav className="section flex gap-2 overflow-x-auto py-3" aria-label="Tu candidato">
        <span className="hidden shrink-0 self-center pr-2 text-xs font-extrabold uppercase tracking-[.18em] text-navy/55 sm:inline">Tu candidato</span>
        {facetas.map(x=>{const I=iconos[x.slug];const activa=x.slug===f.slug;return <a key={x.slug} href={`/candidato/${x.slug}`} aria-current={activa?"page":undefined} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${activa?`${x.tema.fondo} ${x.tema.texto} shadow-sm`:"bg-mist text-deep hover:bg-ocean/15"}`}><I size={17} aria-hidden="true"/>{x.etiqueta}</a>})}
      </nav>
    </div>

    <section className="relative overflow-hidden bg-deep text-white">
      <div className="absolute inset-0 grid-territory opacity-15" aria-hidden="true"/>
      <div className="section relative grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr] lg:py-16">
        <div>
          <span className={`chip ${f.tema.chip}`}><Icon className="mr-1 h-4 w-4" aria-hidden="true"/>Tu candidato</span>
          <h1 className="mt-5 font-serif text-5xl font-black leading-[.95] sm:text-7xl">{f.titulo}</h1>
          <p className="mt-5 max-w-xl text-2xl font-extrabold leading-snug text-yellow">{f.frase}</p>
          <div className="mt-6 space-y-4 text-lg leading-8 text-white/80">{f.intro.map(p=><p key={p}>{p}</p>)}</div>
        </div>
        <div className="relative">
          <div className={`absolute -inset-3 rounded-[2.6rem] ${f.tema.fondo} opacity-90`} aria-hidden="true"/>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] bg-navy shadow-2xl">
            <Image src={principal.src} alt={principal.alt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" style={{objectPosition:principal.posicion}}/>
          </div>
        </div>
      </div>
    </section>

    <section className="section -mt-6 relative z-10">
      <div className="grid gap-3 sm:grid-cols-3">
        {f.datos.map(d=><div key={d.texto} className="rounded-3xl bg-white p-6 shadow-soft"><b className={`block font-serif text-4xl font-black ${f.tema.acento}`}>{d.valor}</b><span className="mt-1 block text-sm font-semibold leading-6 text-navy/70">{d.texto}</span></div>)}
      </div>
    </section>

    <section className="section py-16">
      <h2 className="font-serif text-3xl font-black text-deep sm:text-4xl">Lo que lo define</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {f.claves.map((c,i)=><article key={c.titulo} className="flex gap-5 rounded-3xl bg-white p-6 shadow-sm sm:p-7">
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-serif text-2xl font-black ${f.tema.fondo} ${f.tema.texto}`}>{i+1}</span>
          <div><h3 className="text-xl font-black text-deep">{c.titulo}</h3><p className="mt-2 leading-7 text-navy/70">{c.texto}</p></div>
        </article>)}
      </div>
    </section>

    <section className="bg-white py-16">
      <div className="section">
        <h2 className="font-serif text-3xl font-black text-deep sm:text-4xl">En territorio</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {galeria.map((g,i)=><figure key={g.src} className={`relative m-0 overflow-hidden rounded-3xl bg-navy ${i===0?"col-span-2 row-span-2 aspect-square lg:col-span-1 lg:row-span-2 lg:aspect-auto":"aspect-[4/3]"}`}>
            <Image src={g.src} alt={g.alt} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-700 hover:scale-[1.04]" style={{objectPosition:g.posicion}}/>
          </figure>)}
        </div>
      </div>
    </section>

    <section className="section py-16">
      <div className={`grid gap-6 rounded-[2rem] p-8 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center ${f.tema.suave}`}>
        <p className="font-serif text-2xl font-black leading-snug text-deep sm:text-3xl">{f.cierre}</p>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
          <a href={`/candidato/${siguiente.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep px-6 py-3 font-extrabold text-white">Conoce {siguiente.etiqueta.toLowerCase()}<ArrowRight size={18} aria-hidden="true"/></a>
          <a href="/plan-de-trabajo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-deep shadow-sm"><ScrollText size={18} aria-hidden="true"/>Ver su Plan de Trabajo</a>
        </div>
      </div>
    </section>
  </main>;
}
