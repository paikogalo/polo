import type {Metadata} from "next";
import Image from "next/image";
import {ArrowLeft,BookOpenCheck,CalendarRange,Cpu,Eye,Globe2,PlayCircle,Sparkles,Sprout,Store,UsersRound} from "lucide-react";
import {NodoDownloads} from "@/components/nodo/nodo-downloads";
import {NodoFaq} from "@/components/nodo/nodo-faq";
import {NodoRegistro} from "@/components/nodo/nodo-registro";
import {NodoSocial} from "@/components/nodo/nodo-social";
import {NodoStats} from "@/components/nodo/nodo-stats";
import {NodoTelefono} from "@/components/nodo/nodo-telefono";
import {NodoVideoModal,NodoVideoTrigger} from "@/components/nodo/nodo-video-modal";
import {LOGO_SRC} from "@/lib/image-src";
import {formatoTamano,nodoAssets} from "@/lib/nodo/assets";
import {NODO_ICON_SRC,NODO_SITE_URL,cantones} from "@/lib/nodo/constants";

const titulo="NODO · Jóvenes Cotopaxi | Aprende - Emprende y Crece aquí";
const descripcion="Plataforma de emprendimiento y tecnología para jóvenes de 16 a 30 años de los 7 cantones de Cotopaxi.";

export function generateMetadata():Metadata{
  const {poster}=nodoAssets();
  return {
    metadataBase:new URL(NODO_SITE_URL),
    title:{absolute:titulo},
    description:descripcion,
    alternates:{canonical:"/nodo"},
    icons:{icon:NODO_ICON_SRC},
    openGraph:{title:titulo,description:descripcion,url:"/nodo",type:"website",locale:"es_EC",...(poster.href?{images:[{url:poster.href,width:1080,height:1920,alt:"NODO · Jóvenes Cotopaxi"}]}:{})},
    twitter:{card:poster.href?"summary_large_image":"summary",title:titulo,description:descripcion},
  };
}

const pilares=[
  {icon:BookOpenCheck,titulo:"Escuela de emprendimiento por producto",texto:"Aprendes a emprender con tu propio producto: costos, marca, ventas y gestión.",color:"bg-yellow text-navy"},
  {icon:Cpu,titulo:"Laboratorio agro-digital y coworking",texto:"Computadoras, impresión 3D, sensores y drones para crear, probar y trabajar en red.",color:"bg-ocean text-navy"},
  {icon:Sprout,titulo:"Fondo semilla concursable",texto:"Capital inicial por concurso para empresas rurales juveniles.",color:"bg-pink text-navy"},
  {icon:Store,titulo:"Tienda NODO",texto:"Una vitrina para vender lo que se produce en cada nodo.",color:"bg-blue text-white"},
];

const emprendimientos=[
  ["Flores y claveles","bg-pink/25 border-pink"],
  ["Artesanías de Pujilí, Salcedo y Latacunga","bg-yellow/25 border-yellow"],
  ["Caretas y figuras de la Mama Negra","bg-coral/10 border-coral"],
  ["Ponchos y tejidos","bg-purple/10 border-purple"],
  ["Vino de mortiño","bg-purple/15 border-purple"],
  ["Cerámica y regalos","bg-ocean/15 border-ocean"],
  ["Leche, papa, maíz y agroturismo","bg-yellow/25 border-yellow"],
  ["Apps y tecnología","bg-blue/10 border-blue"],
];

function Titulo({kicker,children,id,kickerColor="text-purple"}:{kicker:string;children:React.ReactNode;id?:string;kickerColor?:string}){
  return <div className="max-w-3xl"><span className={`text-sm font-extrabold uppercase tracking-[.16em] ${kickerColor}`}>{kicker}</span><h2 id={id} className="mt-3 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{children}</h2></div>;
}

export default function NodoPage(){
  const a=nodoAssets();
  const descargas=[
    {archivo:"pdf" as const,titulo:"Propuesta NODO (PDF)",detalle:"El documento completo de la propuesta, 9 páginas.",href:a.pdf.href,nombreDescarga:"NODO-Jovenes-Cotopaxi-propuesta.pdf",tamano:formatoTamano(a.pdf.bytes)},
    {archivo:"mp4" as const,titulo:"Video en alta calidad",detalle:"Formato vertical 1080 × 1920, listo para compartir.",href:a.video1080.href,nombreDescarga:"NODO-Jovenes-Cotopaxi-video.mp4",tamano:formatoTamano(a.video1080.bytes)},
    {archivo:"logo" as const,titulo:"Logotipo NODO",detalle:"Logotipo oficial en PNG transparente para fondo claro.",href:a.logo.href,nombreDescarga:"NODO-logo.png",tamano:formatoTamano(a.logo.bytes)},
  ];

  return <div className="min-h-screen bg-[#F4F7FB] text-navy">
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="nodo-gradient-ring h-1" aria-hidden="true"/>
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <a href="/" className="flex min-h-11 min-w-0 items-center gap-2.5" aria-label="Volver a la portada de Hipólito Carrera">
          <Image src={LOGO_SRC} alt="" width={44} height={44} unoptimized className="h-10 w-10 shrink-0 object-contain"/>
          <span className="hidden min-w-0 sm:block"><b className="block text-sm leading-tight">Hipólito Carrera</b><span className="text-xs font-semibold text-oceanDark">De POLO a POLO</span></span>
        </a>
        <nav aria-label="Secciones de NODO" className="flex items-center gap-1 sm:gap-2">
          <a href="#que-es" className="hidden min-h-11 items-center rounded-full px-3 text-sm font-bold hover:bg-sand md:inline-flex">Qué es</a>
          <NodoVideoTrigger className="hidden min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold hover:bg-sand md:inline-flex"><PlayCircle size={17} aria-hidden="true"/>Video</NodoVideoTrigger>
          <a href="#descargas" className="hidden min-h-11 items-center rounded-full px-3 text-sm font-bold hover:bg-sand md:inline-flex">Descargas</a>
          <a href="#registro" className="inline-flex min-h-11 items-center rounded-full bg-yellow px-4 text-sm font-extrabold text-navy hover:bg-navy hover:text-white lg:hidden">Regístrate</a>
          <a href="/" aria-label="Volver a la portada" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-navy/15 px-3 text-sm font-bold"><ArrowLeft size={16} aria-hidden="true"/><span className="hidden sm:inline">Inicio</span></a>
        </nav>
      </div>
    </header>

    <main className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-x-10 lg:px-8 lg:pt-8">
        {/* 1. Hero */}
        <section className="nodo-hero lg:col-start-2 lg:row-start-1 relative overflow-clip rounded-[2.5rem] px-6 py-12 text-white sm:px-10 sm:py-16">
          <span className="absolute right-6 top-6 hidden rotate-6 rounded-2xl bg-yellow px-3 py-2 text-sm font-extrabold text-navy shadow-lg sm:block">16–30 años</span>
          <span className="absolute bottom-8 right-10 hidden -rotate-6 rounded-2xl bg-pink px-3 py-2 text-sm font-extrabold text-navy shadow-lg md:block">7 cantones</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.logoBlancoSrc} alt="nodo" width={349} height={100} className="h-16 w-auto sm:h-20" fetchPriority="high"/>
          <h1 className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-extrabold uppercase tracking-[.25em] text-white"><Sparkles size={16} aria-hidden="true"/>Jóvenes Cotopaxi</h1>
          <p className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">Aprende - Emprende y <span className="text-yellow">Crece aquí</span></p>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/85">Plataforma de emprendimiento y tecnología para jóvenes de 16 a 30 años de los 7 cantones de Cotopaxi.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#registro" className="inline-flex min-h-14 items-center justify-center rounded-full bg-yellow px-7 py-4 text-lg font-extrabold text-navy shadow-[0_12px_30px_rgba(247,167,19,.4)] transition hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden">Regístrate para el piloto</a>
            <NodoVideoTrigger className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-lg font-extrabold text-navy transition hover:bg-yellow focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"/>
          </div>
          <div className="mt-8"><p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-white/80">Síguenos</p><NodoSocial/></div>
          <p className="mt-6 hidden items-center gap-2 text-sm font-bold text-white/85 lg:flex"><span aria-hidden="true">←</span>Regístrate en el teléfono de la izquierda</p>
        </section>

      {/* Formulario: pantalla de teléfono, fija a la izquierda en escritorio */}
      <aside id="registro" aria-label="Registro para el piloto NODO" className="scroll-mt-24 lg:sticky lg:top-[5.5rem] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
        <p className="mb-4 text-center text-sm font-extrabold text-purple lg:hidden">Regístrate aquí · desliza dentro del teléfono</p>
        <NodoTelefono><NodoRegistro/></NodoTelefono>
        <p className="mt-3 text-center text-xs font-semibold text-navy/70">Gratis · De 16 a 30 años · Unos 3 minutos</p>
      </aside>

      <div className="min-w-0 space-y-6 lg:col-start-2 lg:row-start-2">
        {/* 2. Qué es */}
        <section id="que-es" className="scroll-mt-24 rounded-[2.5rem] bg-white p-6 sm:p-10" aria-labelledby="que-es-titulo">
          <Titulo kicker="Qué es NODO" id="que-es-titulo">Centro de emprendimiento y tecnología para jóvenes, uno en cada cantón de Cotopaxi.</Titulo>
          <div className="mt-6 rounded-[2rem] bg-gradient-to-r from-yellow to-[#FFC94D] p-6 sm:p-7">
            <span className="text-sm font-extrabold uppercase tracking-wider text-navy">Propósito</span>
            <p className="mt-1 text-2xl font-extrabold leading-snug text-navy sm:text-3xl">Que emprender en Cotopaxi no signifique irse.</p>
          </div>
        </section>

        {/* 3. Datos */}
        <section className="nodo-gradient rounded-[2.5rem] p-6 text-white sm:p-10" aria-labelledby="datos-titulo">
          <h2 id="datos-titulo" className="text-sm font-extrabold uppercase tracking-[.2em] text-white">NODO en cifras</h2>
          <div className="mt-5"><NodoStats/></div>
          <p className="mt-5 text-sm font-semibold text-white/85">Propuesta del plan de trabajo 2027-2031</p>
        </section>

        {/* 4. Así arranca */}
        <section className="rounded-[2.5rem] bg-white p-6 sm:p-10" aria-labelledby="arranca-titulo">
          <Titulo kicker="Así arranca" id="arranca-titulo">Empezamos escuchando, crecemos por cantón y rendimos cuentas</Titulo>
          <ol className="mt-8 grid gap-4 xl:grid-cols-3">
            <li className="rounded-3xl border-2 border-yellow bg-yellow/10 p-6"><span className="inline-flex items-center gap-2 rounded-full bg-yellow px-3 py-1 text-sm font-extrabold text-navy"><CalendarRange size={16} aria-hidden="true"/>Año 1</span><h3 className="mt-4 text-xl font-extrabold">Piloto en 2 nodos</h3><p className="mt-2 leading-7 text-navy/80">Los primeros 100 días, escuchando a los jóvenes para diseñar el programa con ellos.</p></li>
            <li className="rounded-3xl border-2 border-ocean bg-ocean/10 p-6"><span className="inline-flex items-center gap-2 rounded-full bg-ocean px-3 py-1 text-sm font-extrabold text-navy"><UsersRound size={16} aria-hidden="true"/>Años 2 a 4</span><h3 className="mt-4 text-xl font-extrabold">Los 7 cantones</h3><p className="mt-2 leading-7 text-navy/80">{cantones.join(", ").replace(/, (?=[^,]*$)/," y ")}.</p></li>
            <li className="rounded-3xl border-2 border-purple bg-purple/10 p-6"><span className="inline-flex items-center gap-2 rounded-full bg-purple px-3 py-1 text-sm font-extrabold text-white"><Eye size={16} aria-hidden="true"/>Cada trimestre</span><h3 className="mt-4 text-xl font-extrabold">Tablero público de avances</h3><p className="mt-2 leading-7 text-navy/80">Metas, avances y resultados a la vista de todos.</p></li>
          </ol>
        </section>

        {/* 5. Cómo funciona */}
        <section className="rounded-[2.5rem] bg-white p-6 sm:p-10" aria-labelledby="funciona-titulo">
          <Titulo kicker="Cómo funciona" id="funciona-titulo">Cuatro piezas que trabajan juntas</Titulo>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2">
            {pilares.map((p,i)=>{const Icon=p.icon;return <li key={p.titulo} className="relative rounded-3xl border border-navy/10 bg-[#F4F7FB] p-6">
              <span className="absolute right-5 top-3 text-5xl font-extrabold text-navy/10" aria-hidden="true">{i+1}</span>
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${p.color}`}><Icon aria-hidden="true"/></span>
              <h3 className="mt-4 text-lg font-extrabold leading-snug"><span className="sr-only">{i+1}. </span>{p.titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-navy/80">{p.texto}</p>
            </li>})}
          </ol>
        </section>

        {/* 6. Qué puedes emprender */}
        <section className="rounded-[2.5rem] bg-white p-6 sm:p-10" aria-labelledby="emprender-titulo">
          <Titulo kicker="Qué puedes emprender" id="emprender-titulo">Lo que ya sabemos hacer en Cotopaxi, con valor agregado</Titulo>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {emprendimientos.map(([e,c])=><li key={e} className={`rounded-full border-2 px-4 py-2.5 text-base font-bold ${c}`}>{e}</li>)}
          </ul>
        </section>

        {/* 7. Video (ventana emergente) */}
        <section id="video" className="nodo-hero scroll-mt-24 overflow-clip rounded-[2.5rem] p-6 text-white sm:p-10" aria-labelledby="video-titulo">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div><span className="text-sm font-extrabold uppercase tracking-[.16em] text-white">Video</span><h2 id="video-titulo" className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">NODO en menos de un minuto</h2><p className="mt-3 text-lg text-white/85">Míralo y compártelo con tus amigos.</p></div>
            <NodoVideoTrigger className="group grid h-28 w-28 shrink-0 place-items-center rounded-full bg-yellow text-navy shadow-[0_0_0_10px_rgba(247,167,19,.25)] transition hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transform-none"><PlayCircle size={56} aria-hidden="true"/><span className="sr-only">Ver el video de NODO</span></NodoVideoTrigger>
          </div>
        </section>

        {/* 8. Descargas */}
        <section id="descargas" className="scroll-mt-24 rounded-[2.5rem] bg-white p-6 sm:p-10" aria-labelledby="descargas-titulo">
          <Titulo kicker="Descargas" id="descargas-titulo">Llévate la propuesta</Titulo>
          <div className="mt-7"><NodoDownloads items={descargas}/></div>
        </section>

        {/* 9. Visión */}
        <section className="rounded-[2.5rem] bg-gradient-to-br from-yellow via-[#FFB238] to-pink p-8 text-center sm:p-12" aria-labelledby="vision-titulo">
          <Globe2 className="mx-auto h-12 w-12 text-navy" aria-hidden="true"/>
          <span className="mt-3 block text-sm font-extrabold uppercase tracking-[.16em] text-navy">Visión</span>
          <h2 id="vision-titulo" className="mx-auto mt-3 max-w-3xl text-2xl font-extrabold leading-snug text-navy sm:text-3xl">Imaginamos lo hecho por jóvenes de Cotopaxi en vitrinas de Ecuador y del mundo, empezando donde vive la comunidad ecuatoriana.</h2>
        </section>

        {/* 11. Preguntas frecuentes */}
        <section className="rounded-[2.5rem] bg-white p-6 sm:p-10" aria-labelledby="faq-titulo">
          <Titulo kicker="Preguntas frecuentes" id="faq-titulo">Lo que más nos preguntan</Titulo>
          <div className="mt-7"><NodoFaq/></div>
        </section>

        <section className="rounded-[2.5rem] bg-white p-6 text-center sm:p-8" aria-labelledby="redes-titulo">
          <h2 id="redes-titulo" className="text-xl font-extrabold">Sigue a NODO en redes</h2>
          <div className="mt-4 flex justify-center"><NodoSocial/></div>
        </section>
      </div>
    </main>

    {/* Aviso legal fijo, al pie */}
    <footer className="nodo-gradient py-8 text-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-4xl text-center text-sm leading-6 text-white/90">NODO es una propuesta del plan de trabajo 2027-2031 para la provincia de Cotopaxi. El registro es gratuito y voluntario, sirve para conformar el piloto y conocer las necesidades de los jóvenes. No garantiza cupo, dinero ni beneficio alguno.</p>
        <p className="mt-4 text-center text-xs text-white/85"><a href="/nodo/mis-datos" className="font-bold underline">Mis datos: consultar o borrar mi registro</a> · <a href="/" className="font-bold underline">Volver a la portada</a></p>
      </div>
    </footer>

    <NodoVideoModal src={a.video720.href} descarga={a.video1080.href} poster={a.poster.href} subtitulos={a.subtitulos.href} tamanoDescarga={formatoTamano(a.video1080.bytes)}/>
  </div>;
}
