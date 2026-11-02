import Image from "next/image";
import {Camera,MapPin,Sparkles} from "lucide-react";

const moments=[
  {
    src:"/campaign-vialidad.webp",
    alt:"Hipólito Carrera recorre una vía durante los trabajos de asfaltado",
    title:"Vialidad que conecta",
    eyebrow:"Recorridos",
    position:"54% 50%",
    card:"h-72 sm:col-span-2 sm:h-80 lg:col-span-7 lg:row-span-2 lg:h-auto",
    badge:"bg-coralDark text-white",
    sizes:"(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 3rem), 56vw",
  },
  {
    src:"/campaign-produccion.webp",
    alt:"Hipólito Carrera conversa con un productor en una plantación de banano",
    title:"Producción que avanza",
    eyebrow:"Trabajo local",
    position:"50% 52%",
    card:"h-64 lg:col-span-5 lg:h-auto",
    badge:"bg-yellow text-deep",
    sizes:"(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 42vw",
  },
  {
    src:"/campaign-ambiente.webp",
    alt:"Hipólito Carrera observa un entorno rural rodeado de vegetación",
    title:"Naturaleza que cuidamos",
    eyebrow:"Agua y ambiente",
    position:"45% 36%",
    card:"h-64 lg:col-span-5 lg:h-auto",
    badge:"bg-oceanDark text-white",
    sizes:"(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 42vw",
  },
  {
    src:"/campaign-escucha.webp",
    alt:"Hipólito Carrera escucha a dos mujeres durante un encuentro ciudadano",
    title:"Escuchar de cerca",
    eyebrow:"Diálogo",
    position:"52% 42%",
    card:"h-64 lg:col-span-4",
    badge:"bg-purple text-white",
    sizes:"(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw",
  },
  {
    src:"/campaign-cercania.webp",
    alt:"Hipólito Carrera recorre una comunidad junto a un adulto mayor",
    title:"Cercanía en cada encuentro",
    eyebrow:"Comunidad",
    position:"54% 48%",
    card:"h-64 lg:col-span-4",
    badge:"bg-pink text-deep",
    sizes:"(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw",
  },
  {
    src:"/campaign-gestion.webp",
    alt:"Hipólito Carrera conversa con una persona durante una reunión de trabajo",
    title:"Gestión en territorio",
    eyebrow:"Acción",
    position:"64% 44%",
    card:"h-64 sm:col-span-2 lg:col-span-4",
    badge:"bg-blue text-white",
    sizes:"(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 3rem), 33vw",
  },
  {
    src:"/campaign-obras.webp",
    alt:"Hipólito Carrera recorre una obra junto a una integrante del equipo técnico",
    title:"Obras con presencia",
    eyebrow:"Visita técnica",
    position:"50% 48%",
    card:"h-64 lg:col-span-6",
    badge:"bg-coralDark text-white",
    sizes:"(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 50vw",
  },
  {
    src:"/campaign-encuentro.webp",
    alt:"Hipólito Carrera participa en un encuentro público al aire libre",
    title:"Encontrarnos para avanzar",
    eyebrow:"Cotopaxi unido",
    position:"34% 48%",
    card:"h-64 sm:col-span-2 lg:col-span-6",
    badge:"bg-oceanDark text-white",
    sizes:"(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 3rem), 50vw",
  },
] as const;

export function TerritoryGallery(){
  return <section className="relative overflow-hidden bg-mist/60 py-20 sm:py-24" aria-labelledby="territory-gallery-title">
    <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-pink/25 blur-3xl" aria-hidden="true"/>
    <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-yellow/30 blur-3xl" aria-hidden="true"/>
    <div className="section relative">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <span className="chip bg-white text-purple shadow-sm"><MapPin className="mr-1 h-4 w-4" aria-hidden="true"/>De POLO a POLO</span>
          <h2 id="territory-gallery-title" className="mt-5 text-4xl font-black leading-tight text-deep sm:text-5xl">Cotopaxi se vive en <span className="text-coral">territorio</span></h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-navy/65 sm:text-lg">Imágenes de recorridos, encuentros y paisajes que muestran la diversidad de una provincia siempre en movimiento.</p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm font-bold text-deep shadow-sm backdrop-blur lg:self-auto"><Camera className="text-ocean" aria-hidden="true"/><span>Historias desde cada rincón</span><Sparkles className="text-yellow" aria-hidden="true"/></div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[13rem]" role="list" aria-label="Momentos en territorio">
        {moments.map(moment=><figure key={moment.src} role="listitem" className={`group relative overflow-hidden rounded-[2rem] bg-deep shadow-soft ${moment.card}`}>
          <Image src={moment.src} alt={moment.alt} fill sizes={moment.sizes} className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]" style={{objectPosition:moment.position}}/>
          <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/15 to-transparent" aria-hidden="true"/>
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
            <div><span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${moment.badge}`}>{moment.eyebrow}</span><h3 className="mt-3 text-xl font-black leading-tight text-white sm:text-2xl">{moment.title}</h3></div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur" aria-hidden="true"><MapPin size={17}/></span>
          </figcaption>
        </figure>)}
      </div>
    </div>
  </section>;
}
