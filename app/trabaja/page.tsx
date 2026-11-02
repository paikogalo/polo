import type {Metadata} from "next";
import Image from "next/image";
import {ArrowLeft,BriefcaseBusiness,FileHeart,LayoutDashboard,Radio,Scale,ShieldCheck,UsersRound} from "lucide-react";
import {SocialLinks} from "@/components/social-links";
import {WorkWithUsForm} from "@/components/work-with-us-form";
import {CANDIDATE_SRC,LOGO_SRC} from "@/lib/image-src";

export const metadata:Metadata={
  title:"Trabaja con nosotros",
  description:"Registra tu perfil profesional para futuros procesos de selección y oportunidades de servicio a Cotopaxi.",
};

const qualities=[
  {icon:UsersRound,label:"Perfiles diversos"},
  {icon:ShieldCheck,label:"Datos confidenciales"},
  {icon:Scale,label:"Selección transparente"},
];

export default function WorkPage(){
  return <main className="min-h-screen bg-sand">
    <header className="border-b border-navy/10 bg-white">
      <div className="section flex min-h-20 items-center justify-between gap-3 py-3">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <Image src={LOGO_SRC} alt="El Polo Carrera" width={54} height={54} unoptimized className="h-12 w-12 shrink-0 object-contain"/>
          <span className="min-w-0"><b className="block text-sm text-deep">Hipólito Carrera</b><span className="hidden truncate text-xs text-ocean sm:block">De POLO a POLO recorremos tu territorio</span></span>
        </a>
        <nav className="flex shrink-0 items-center gap-2" aria-label="Accesos principales">
          <a href="/redes" className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-sm font-bold text-deep"><Radio size={17}/><span className="hidden sm:inline">Redes</span></a>
          <a href="/admin" className="inline-flex items-center gap-2 rounded-full bg-deep px-3 py-2 text-sm font-bold text-white"><LayoutDashboard size={17}/><span className="hidden sm:inline">Dashboard</span></a>
          <a href="/" className="inline-flex items-center gap-2 rounded-full border border-navy/10 px-3 py-2 text-sm font-bold text-deep"><ArrowLeft size={17}/><span className="hidden lg:inline">Inicio</span></a>
        </nav>
      </div>
    </header>

    <section className="relative overflow-hidden bg-deep py-14 text-white sm:py-16">
      <div className="absolute inset-0 grid-territory opacity-15"/>
      <div className="section relative grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
        <div>
          <span className="chip bg-white/10 text-yellow"><BriefcaseBusiness className="mr-1 h-4 w-4"/>De POLO a POLO recorremos tu territorio</span>
          <h1 className="mt-5 font-serif text-4xl font-black sm:text-6xl">Trabaja con nosotros</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">Queremos conocer a profesionales, técnicos, trabajadores y ciudadanos comprometidos que deseen aportar con su experiencia al desarrollo de Cotopaxi.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {qualities.map(({icon:Icon,label})=><div key={label} className="rounded-2xl bg-white/10 p-4 text-center"><Icon className="mx-auto text-yellow"/><b className="mt-2 block text-xs">{label}</b></div>)}
          </div>
        </div>
        <div className="relative mx-auto h-[440px] w-full max-w-md sm:h-[520px]">
          <div className="absolute inset-0 overflow-hidden rounded-[2.4rem] border border-white/20 bg-gradient-to-br from-ocean via-purple to-coral shadow-2xl"><div className="brand-orbit absolute -right-24 -top-24 h-64 w-64 opacity-80"/></div>
          <Image src={CANDIDATE_SRC} alt="Hipólito Carrera" fill priority unoptimized sizes="(max-width: 1024px) 100vw, 448px" className="candidate-portrait z-[1] object-contain object-bottom"/>
        </div>
      </div>
    </section>

    <section id="formulario-trabajo" className="section grid scroll-mt-8 gap-10 py-16 lg:grid-cols-[.65fr_1.35fr]">
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <span className="chip bg-coral/10 text-coral"><FileHeart className="mr-1 h-4 w-4"/>Banco de perfiles</span>
        <h2 className="mt-4 font-serif text-3xl font-black text-deep">Tu experiencia puede aportar a la provincia</h2>
        <div className="mt-6 space-y-4 text-sm leading-7 text-navy/65">
          <p>Completa tu información personal, formación y experiencia. El equipo podrá valorar tu perfil para futuros procesos que correspondan a tus capacidades.</p>
          <p>Los documentos serán tratados de forma confidencial y únicamente por personal autorizado.</p>
          <div className="rounded-2xl border border-yellow/40 bg-yellow/10 p-5 text-deep"><b>Importante</b><p className="mt-1 text-sm leading-6">Registrar el perfil no garantiza un puesto de trabajo. Cualquier selección deberá cumplir la normativa aplicable, los requisitos del cargo, el mérito y la transparencia.</p></div>
        </div>
      </aside>
      <WorkWithUsForm/>
    </section>

    <footer className="bg-deep py-8 text-white">
      <div className="section flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div><b className="block">Hipólito Carrera</b><span className="text-xs text-white/55">De POLO a POLO recorremos tu territorio</span></div>
        <SocialLinks light/>
        <a href="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-extrabold"><LayoutDashboard size={17}/>Dashboard</a>
      </div>
    </footer>
  </main>;
}
