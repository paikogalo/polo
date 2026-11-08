import type {Metadata} from "next";
import {ArrowLeft} from "lucide-react";
import {MisDatosForm} from "@/components/nodo/mis-datos-form";

export const metadata:Metadata={title:{absolute:"Mis datos · NODO Jóvenes Cotopaxi"},description:"Pide el borrado de tu registro en NODO con tu correo y tu código.",robots:{index:false,follow:false},alternates:{canonical:"/nodo/mis-datos"}};

export default async function MisDatosPage({searchParams}:{searchParams:Promise<{token?:string}>}){
  const {token}=await searchParams;
  return <main className="min-h-screen bg-sand px-4 py-10 text-navy sm:py-16">
    <div className="mx-auto max-w-xl">
      <a href="/nodo" className="inline-flex min-h-11 items-center gap-2 font-bold text-oceanDark"><ArrowLeft size={18} aria-hidden="true"/>Volver a NODO</a>
      <h1 className="mt-4 text-3xl font-extrabold">Mis datos en NODO</h1>
      <p className="mt-3 leading-7 text-navy/80">Puedes pedir que borremos tu registro cuando quieras. Escribe el correo con el que te registraste y tu código NODO. Te enviaremos un enlace para confirmar.</p>
      <div className="mt-6"><MisDatosForm token={typeof token==="string"&&/^[a-f0-9]{64}$/.test(token)?token:null}/></div>
    </div>
  </main>;
}
