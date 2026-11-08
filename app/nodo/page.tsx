import type {Metadata} from "next";
import Image from "next/image";
import {ArrowLeft,BookOpenCheck,CalendarRange,Cpu,Eye,Globe2,Handshake,PlayCircle,Sprout,Store,UsersRound} from "lucide-react";
import {NodoDownloads} from "@/components/nodo/nodo-downloads";
import {NodoFaq} from "@/components/nodo/nodo-faq";
import {NodoRegistro} from "@/components/nodo/nodo-registro";
import {NodoStats} from "@/components/nodo/nodo-stats";
import {NodoVideo} from "@/components/nodo/nodo-video";
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
  {icon:BookOpenCheck,titulo:"Escuela de emprendimiento por producto",texto:"Aprendes a emprender con tu propio producto: costos, marca, ventas y gestión."},
  {icon:Cpu,titulo:"Laboratorio agro-digital y coworking",texto:"Computadoras, impresión 3D, sensores y drones para crear, probar y trabajar en red."},
  {icon:Sprout,titulo:"Fondo semilla concursable",texto:"Capital inicial por concurso para empresas rurales juveniles."},
  {icon:Store,titulo:"Tienda NODO",texto:"Una vitrina para vender lo que se produce en cada nodo."},
];

const emprendimientos=["Flores y claveles","Artesanías de Pujilí, Salcedo y Latacunga","Caretas y figuras de la Mama Negra","Ponchos y tejidos","Vino de mortiño","Cerámica y regalos","Leche, papa, maíz y agroturismo","Apps y tecnología"];

function Titulo({kicker,children,id}:{kicker:string;children:React.ReactNode;id?:string}){
  return <div className="max-w-3xl"><span className="text-sm font-extrabold uppercase tracking-[.16em] text-oceanDark">{kicker}</span><h2 id={id} className="mt-3 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{children}</h2></div>;
}

export default function NodoPage(){
  const a=nodoAssets();
  const descargas=[
    {archivo:"pdf" as const,titulo:"Propuesta NODO (PDF)",detalle:"El documento completo de la propuesta, 9 páginas.",href:a.pdf.href,nombreDescarga:"NODO-Jovenes-Cotopaxi-propuesta.pdf",tamano:formatoTamano(a.pdf.bytes)},
    {archivo:"mp4" as const,titulo:"Video en alta calidad",detalle:"Formato vertical 1080 × 1920, listo para compartir.",href:a.video1080.href,nombreDescarga:"NODO-Jovenes-Cotopaxi-video.mp4",tamano:formatoTamano(a.video1080.bytes)},
    {archivo:"logo" as const,titulo:"Logotipo NODO",detalle:"Versión vectorial (SVG) para fondo claro.",href:a.logo.href,nombreDescarga:"NODO-logo.svg",tamano:formatoTamano(a.logo.bytes)},
  ];

  return <div className="min-h-screen bg-sand text-navy">
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="section flex min-h-16 items-center justify-between gap-3 py-2">
        <a href="/" className="flex min-h-11 min-w-0 items-center gap-2.5" aria-label="Volver a la portada de Hipólito Carrera">
          <Image src={LOGO_SRC} alt="" width={44} height={44} unoptimized className="h-10 w-10 shrink-0 object-contain"/>
          <span className="hidden min-w-0 sm:block"><b className="block text-sm leading-tight">Hipólito Carrera</b><span className="text-xs font-semibold text-oceanDark">De POLO a POLO</span></span>
        </a>
        <nav aria-label="Secciones de NODO" className="flex items-center gap-1 sm:gap-2">
          <a href="#que-es" className="hidden min-h-11 items-center rounded-full px-3 text-sm font-bold hover:bg-sand md:inline-flex">Qué es</a>
          <a href="#video" className="hidden min-h-11 items-center rounded-full px-3 text-sm font-bold hover:bg-sand md:inline-flex">Video</a>
          <a href="#descargas" className="hidden min-h-11 items-center rounded-full px-3 text-sm font-bold hover:bg-sand md:inline-flex">Descargas</a>
          <a href="#registro" className="inline-flex min-h-11 items-center rounded-full bg-yellow px-4 text-sm font-extrabold text-navy hover:bg-navy hover:text-white">Regístrate</a>
          <a href="/" aria-label="Volver a la portada" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-navy/15 px-3 text-sm font-bold"><ArrowLeft size={16} aria-hidden="true"/><span className="hidden sm:inline">Inicio</span></a>
        </nav>
      </div>
    </header>

    <main>
      {/* 1. Hero */}
      <section className="relative overflow-clip bg-navy text-white">
        <div className="flex h-1.5" aria-hidden="true"><span className="flex-1 bg-coral"/><span className="flex-1 bg-blue"/><span className="flex-[3] bg-ocean"/><span className="flex-1 bg-yellow"/></div>
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-ocean/20 blur-3xl" aria-hidden="true"/>
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-yellow/10 blur-3xl" aria-hidden="true"/>
        <div className="section relative py-14 text-center sm:py-20 lg:py-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.logoBlancoSrc} alt="nodo" width={240} height={80} className="mx-auto h-20 w-auto sm:h-28" fetchPriority="high"/>
          <h1 className="mt-6 text-sm font-extrabold uppercase tracking-[.3em] text-yellow sm:text-base">Jóvenes Cotopaxi</h1>
          <p className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">Aprende - Emprende y Crece aquí</p>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">Plataforma de emprendimiento y tecnología para jóvenes de 16 a 30 años de los 7 cantones de Cotopaxi.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#registro" className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-yellow px-7 py-4 text-lg font-extrabold text-navy shadow-[0_12px_30px_rgba(247,167,19,.35)] transition hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto">Regístrate para el piloto</a>
            <a href="#video" className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-white/40 px-7 py-4 text-lg font-extrabold text-white transition hover:bg-white hover:text-navy focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"><PlayCircle size={22} aria-hidden="true"/>Ver el video</a>
          </div>
        </div>
      </section>

      {/* 2. Qué es */}
      <section id="que-es" className="section py-16 sm:py-20" aria-labelledby="que-es-titulo">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Titulo kicker="Qué es NODO" id="que-es-titulo">Centro de emprendimiento y tecnología para jóvenes, uno en cada cantón de Cotopaxi.</Titulo>
          <div className="rounded-[2rem] border-l-8 border-yellow bg-white p-7 shadow-soft">
            <span className="text-sm font-extrabold uppercase tracking-wider text-oceanDark">Propósito</span>
            <p className="mt-2 text-2xl font-extrabold leading-snug">Que emprender en Cotopaxi no signifique irse.</p>
          </div>
        </div>
      </section>

      {/* 3. Datos */}
      <section className="bg-navy py-16 text-white sm:py-20" aria-labelledby="datos-titulo">
        <div className="section">
          <h2 id="datos-titulo" className="sr-only">NODO en cifras</h2>
          <NodoStats/>
          <p className="mt-5 text-center text-sm font-semibold text-white/75">Propuesta del plan de trabajo 2027-2031</p>
        </div>
      </section>

      {/* 4. Así arranca */}
      <section className="section py-16 sm:py-20" aria-labelledby="arranca-titulo">
        <Titulo kicker="Así arranca" id="arranca-titulo">Empezamos escuchando, crecemos por cantón y rendimos cuentas</Titulo>
        <ol className="mt-10 grid gap-5 lg:grid-cols-3">
          <li className="rounded-3xl bg-white p-6 shadow-sm"><span className="inline-flex items-center gap-2 rounded-full bg-yellow px-3 py-1 text-sm font-extrabold text-navy"><CalendarRange size={16} aria-hidden="true"/>Año 1</span><h3 className="mt-4 text-xl font-extrabold">Piloto en 2 nodos</h3><p className="mt-2 leading-7 text-navy/80">Los primeros 100 días, escuchando a los jóvenes para diseñar el programa con ellos.</p></li>
          <li className="rounded-3xl bg-white p-6 shadow-sm"><span className="inline-flex items-center gap-2 rounded-full bg-ocean/15 px-3 py-1 text-sm font-extrabold text-oceanDark"><UsersRound size={16} aria-hidden="true"/>Años 2 a 4</span><h3 className="mt-4 text-xl font-extrabold">Los 7 cantones</h3><p className="mt-2 leading-7 text-navy/80">{cantones.join(", ").replace(/, (?=[^,]*$)/," y ")}.</p></li>
          <li className="rounded-3xl bg-white p-6 shadow-sm"><span className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1 text-sm font-extrabold text-white"><Eye size={16} aria-hidden="true"/>Cada trimestre</span><h3 className="mt-4 text-xl font-extrabold">Tablero público de avances</h3><p className="mt-2 leading-7 text-navy/80">Metas, avances y resultados a la vista de todos.</p></li>
        </ol>
      </section>

      {/* 5. Cómo funciona */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="funciona-titulo">
        <div className="section">
          <Titulo kicker="Cómo funciona" id="funciona-titulo">Cuatro piezas que trabajan juntas</Titulo>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pilares.map((p,i)=>{const Icon=p.icon;return <li key={p.titulo} className="relative rounded-3xl border border-navy/10 bg-sand p-6">
              <span className="absolute right-5 top-4 text-5xl font-extrabold text-navy/10" aria-hidden="true">{i+1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-yellow"><Icon aria-hidden="true"/></span>
              <h3 className="mt-4 text-lg font-extrabold leading-snug"><span className="sr-only">{i+1}. </span>{p.titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-navy/80">{p.texto}</p>
            </li>})}
          </ol>
        </div>
      </section>

      {/* 6. Qué puedes emprender */}
      <section className="section py-16 sm:py-20" aria-labelledby="emprender-titulo">
        <Titulo kicker="Qué puedes emprender" id="emprender-titulo">Lo que ya sabemos hacer en Cotopaxi, con valor agregado</Titulo>
        <ul className="mt-8 flex flex-wrap gap-3">
          {emprendimientos.map(e=><li key={e} className="rounded-full border-2 border-navy/10 bg-white px-5 py-3 text-base font-bold">{e}</li>)}
        </ul>
      </section>

      {/* 7. Video */}
      <section id="video" className="bg-navy py-16 text-white sm:py-20" aria-labelledby="video-titulo">
        <div className="section grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="text-center lg:text-left">
            <span className="text-sm font-extrabold uppercase tracking-[.16em] text-yellow">Video</span>
            <h2 id="video-titulo" className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">NODO en menos de dos minutos</h2>
            <p className="mt-4 text-lg leading-8 text-white/80">Mira cómo funciona y compártelo con tus amigos.</p>
          </div>
          <NodoVideo src={a.video720.href} descarga={a.video1080.href} poster={a.poster.href} subtitulos={a.subtitulos.href} tamanoDescarga={formatoTamano(a.video1080.bytes)}/>
        </div>
      </section>

      {/* 8. Descargas */}
      <section id="descargas" className="section py-16 sm:py-20" aria-labelledby="descargas-titulo">
        <Titulo kicker="Descargas" id="descargas-titulo">Llévate la propuesta</Titulo>
        <div className="mt-8"><NodoDownloads items={descargas}/></div>
      </section>

      {/* 9. Visión */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="vision-titulo">
        <div className="section">
          <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-sand p-8 text-center sm:p-12">
            <Globe2 className="mx-auto h-12 w-12 text-oceanDark" aria-hidden="true"/>
            <span className="mt-4 block text-sm font-extrabold uppercase tracking-[.16em] text-oceanDark">Visión</span>
            <h2 id="vision-titulo" className="mx-auto mt-3 max-w-3xl text-2xl font-extrabold leading-snug sm:text-3xl">Imaginamos lo hecho por jóvenes de Cotopaxi en vitrinas de Ecuador y del mundo, empezando donde vive la comunidad ecuatoriana.</h2>
          </div>
        </div>
      </section>

      {/* 10. Registro */}
      <section id="registro" className="relative overflow-clip bg-navy py-16 sm:py-20" aria-labelledby="registro-titulo">
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-ocean/20 blur-3xl" aria-hidden="true"/>
        <div className="section relative">
          <div className="mx-auto max-w-3xl text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow px-3 py-1 text-xs font-extrabold text-navy"><Handshake size={14} aria-hidden="true"/>Gratis · De 16 a 30 años</span>
            <h2 id="registro-titulo" className="mt-4 text-3xl font-extrabold sm:text-4xl">Registro para el piloto NODO</h2>
            <p className="mt-3 text-lg leading-8 text-white/80">Cuéntanos quién eres y qué quieres emprender. Te tomará unos 3 minutos.</p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl"><NodoRegistro/></div>
        </div>
      </section>

      {/* 11. Preguntas frecuentes */}
      <section className="section py-16 sm:py-20" aria-labelledby="faq-titulo">
        <Titulo kicker="Preguntas frecuentes" id="faq-titulo">Lo que más nos preguntan</Titulo>
        <div className="mt-8 max-w-3xl"><NodoFaq/></div>
      </section>
    </main>

    {/* Aviso legal fijo, al pie */}
    <footer className="border-t-4 border-yellow bg-navy py-8 text-white">
      <div className="section">
        <p className="mx-auto max-w-4xl text-center text-sm leading-6 text-white/85">NODO es una propuesta del plan de trabajo 2027-2031 para la provincia de Cotopaxi. El registro es gratuito y voluntario, sirve para conformar el piloto y conocer las necesidades de los jóvenes. No garantiza cupo, dinero ni beneficio alguno.</p>
        <p className="mt-4 text-center text-xs text-white/70"><a href="/nodo/mis-datos" className="font-bold underline">Mis datos: consultar o borrar mi registro</a> · <a href="/" className="font-bold underline">Volver a la portada</a></p>
      </div>
    </footer>
  </div>;
}
