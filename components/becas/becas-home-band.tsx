import {ArrowRight,GraduationCap} from "lucide-react";

/** Franja grande de Becas De Polo a Polo en la portada, justo debajo del hero. */
export function BecasHomeBand(){
  return <section id="becas" aria-labelledby="becas-home-title" className="becas-band relative overflow-clip text-white">
    <div className="becas-ring h-1.5" aria-hidden="true"/>
    <div className="becas-glow absolute inset-0" aria-hidden="true"/>
    <div className="section relative grid grid-cols-1 items-center gap-6 py-12 sm:py-14 lg:grid-cols-[1.2fr_.8fr] lg:py-16 [&>*]:min-w-0">
      <div className="text-center lg:text-left">
        <span className="chip bg-yellow text-navy"><GraduationCap className="mr-1.5 h-4 w-4" aria-hidden="true"/>Nuevo · Polo Carrera y Esther Veloz</span>
        <h2 id="becas-home-title" className="mt-4">
          <span className="block text-xl font-extrabold sm:text-2xl">¿Quieres ser uno de los beneficiarios de las</span>
          <span className="becas-mil mt-1 block font-black leading-[.85] tracking-tight" aria-hidden="true">1000</span>
          <span className="mt-2 flex flex-wrap items-center justify-center gap-3 lg:justify-start"><span className="becas-tag inline-block rounded-2xl bg-yellow px-4 pb-1 text-4xl font-black text-navy sm:text-5xl">becas</span><span className="text-2xl font-extrabold sm:text-3xl">de tercer nivel?</span></span>
          <span className="sr-only">1000 becas de tercer nivel</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg lg:mx-0">Sin límite de edad, virtual o híbrida. 100 becas del 100 % y 900 del 70 %. Regístrate con tu cédula.</p>
        <div className="mt-8 flex justify-center lg:justify-start">
          <a href="/becas" className="becas-cta group relative inline-flex min-h-16 items-center gap-3 rounded-full bg-yellow px-8 py-4 text-xl font-black text-navy shadow-[0_16px_40px_rgba(247,167,19,.45)] transition hover:-translate-y-1 hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[4.5rem] sm:px-10 sm:text-2xl">
            ¡Quiero mi beca!<ArrowRight className="h-7 w-7 transition group-hover:translate-x-1" aria-hidden="true"/>
          </a>
        </div>
      </div>
      <a href="/becas" tabIndex={-1} aria-hidden="true" className="relative mx-auto grid w-full max-w-[420px] place-items-end">
        <span className="becas-disc absolute bottom-[6%] left-1/2 aspect-square w-[88%] -translate-x-1/2 rounded-full p-2.5"><span className="block h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_35%,#2a62b8,#183247_75%)]"/></span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/becas/pair.webp" alt="" width={600} height={600} loading="lazy" className="relative w-[92%] drop-shadow-[0_22px_26px_rgba(0,0,0,.4)]"/>
        <span className="becas-stk absolute left-0 top-[14%] rotate-6 rounded-2xl bg-yellow px-3 py-2 text-sm font-extrabold text-navy shadow-lg">100 al 100 %</span>
        <span className="becas-stk absolute right-0 top-[36%] -rotate-6 rounded-2xl bg-pink px-3 py-2 text-sm font-extrabold text-navy shadow-lg [animation-delay:-1.5s]">900 al 70 %</span>
        <span className="becas-stk absolute bottom-[14%] left-[4%] -rotate-3 rounded-2xl bg-ocean px-3 py-2 text-sm font-extrabold text-navy shadow-lg [animation-delay:-3s]">Sin límite de edad</span>
      </a>
    </div>
  </section>;
}
