import {ChevronDown} from "lucide-react";

const preguntas=[
  {p:"¿Quién puede registrarse?",r:"Jóvenes de 16 a 30 años que vivan en cualquiera de los 7 cantones de Cotopaxi: Latacunga, Pujilí, Salcedo, Saquisilí, Sigchos, La Maná y Pangua. Si tienes 16 o 17 años, puedes registrarte tú mismo con una autorización adicional, conforme al art. 21 de la Ley Orgánica de Protección de Datos Personales."},
  {p:"¿Cuesta algo?",r:"No. El registro es gratuito y voluntario."},
  {p:"¿Qué pasa después de registrarme?",r:"Recibes un correo con tu código. El equipo de NODO revisa los registros por cantón para conformar el piloto y te contacta por correo o WhatsApp sobre el programa."},
  {p:"¿Qué hacen con mis datos?",r:"Se usan únicamente para conformar el piloto NODO y contactarte sobre el programa. No se publican, no se comparten con terceros y no se mezclan con otras bases de datos. Puedes pedir que se borren cuando quieras desde la página Mis datos."},
  {p:"¿Registrarme me asegura un cupo?",r:"No. El registro sirve para conocer a los jóvenes interesados y sus necesidades. No garantiza cupo, dinero ni beneficio alguno."},
];

/** Acordeón accesible con details/summary: funciona con teclado y lector de pantalla sin JavaScript. */
export function NodoFaq(){
  return <div className="divide-y divide-navy/10 overflow-hidden rounded-3xl border border-navy/10 bg-white">
    {preguntas.map(item=><details key={item.p} className="group">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-extrabold text-navy hover:bg-sand focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-ocean sm:px-6 [&::-webkit-details-marker]:hidden">
        {item.p}<ChevronDown size={20} aria-hidden="true" className="shrink-0 transition group-open:rotate-180 motion-reduce:transition-none"/>
      </summary>
      <p className="px-5 pb-5 leading-7 text-navy/80 sm:px-6">{item.r}{item.p.startsWith("¿Qué hacen")&&<> <a href="/nodo/mis-datos" className="font-bold text-oceanDark underline">Ir a Mis datos</a>.</>}</p>
    </details>)}
  </div>;
}
