"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CheckCircle2,Loader2,MailCheck,Trash2} from "lucide-react";
import {nodoBorradoSchema} from "@/lib/nodo/schema";
import type {z} from "zod";

type Datos=z.input<typeof nodoBorradoSchema>;

export function MisDatosForm({token}:{token:string|null}){
  const [mensaje,setMensaje]=useState("");
  const [error,setError]=useState("");
  const [estado,setEstado]=useState<"inicial"|"borrando"|"eliminado"|"invalido"|"error">("inicial");
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<Datos>({resolver:zodResolver(nodoBorradoSchema),defaultValues:{correo:"",codigo:"",website:""}});

  if(token){
    if(estado==="eliminado")return <div role="status" className="rounded-3xl bg-white p-7 text-center shadow-soft"><CheckCircle2 className="mx-auto h-12 w-12 text-ocean" aria-hidden="true"/><p className="mt-3 text-xl font-extrabold">Tus datos fueron borrados.</p><p className="mt-2 text-navy/75">Ya no queda ningún registro tuyo en NODO.</p></div>;
    return <div className="rounded-3xl bg-white p-7 shadow-soft">
      <p className="text-lg font-extrabold">Confirma el borrado</p>
      <p className="mt-2 leading-7 text-navy/80">Al confirmar, eliminaremos todos los datos de tu registro en NODO. Esta acción no se puede deshacer.</p>
      {estado==="invalido"&&<p role="alert" className="mt-4 rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coralDark">El enlace venció o ya se usó. Vuelve a pedir el borrado con tu correo y tu código.</p>}
      {estado==="error"&&<p role="alert" className="mt-4 rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coralDark">No pudimos borrar los datos en este momento. Inténtalo nuevamente en unos minutos.</p>}
      <button type="button" disabled={estado==="borrando"} onClick={async()=>{setEstado("borrando");const r=await fetch("/api/nodo/mis-datos/confirmar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})}).catch(()=>null);const j=await r?.json().catch(()=>null) as {estado?:string}|null;setEstado(j?.estado==="eliminado"?"eliminado":j?.estado==="invalido"?"invalido":"error");}} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-coralDark px-6 py-3 font-extrabold text-white disabled:opacity-60">
        {estado==="borrando"?<Loader2 className="animate-spin" size={18} aria-hidden="true"/>:<Trash2 size={18} aria-hidden="true"/>}Borrar mis datos
      </button>
    </div>;
  }

  if(mensaje)return <div role="status" className="rounded-3xl bg-white p-7 text-center shadow-soft"><MailCheck className="mx-auto h-12 w-12 text-ocean" aria-hidden="true"/><p className="mt-3 leading-7">{mensaje}</p></div>;

  return <form noValidate onSubmit={handleSubmit(async datos=>{setError("");const r=await fetch("/api/nodo/mis-datos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(datos)}).catch(()=>null);const j=await r?.json().catch(()=>null) as {message?:string;error?:string}|null;if(r?.ok&&j?.message)setMensaje(j.message);else setError(j?.error||"No pudimos procesar la solicitud. Revisa tu conexión.");})} className="space-y-4 rounded-3xl bg-white p-7 shadow-soft">
    <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" {...register("website")}/>
    <label className="block"><span className="label">Correo con el que te registraste</span><input type="email" autoComplete="email" className="field" {...register("correo")} aria-invalid={Boolean(errors.correo)}/>{errors.correo&&<p className="mt-1.5 text-sm font-semibold text-coralDark">{errors.correo.message}</p>}</label>
    <label className="block"><span className="label">Código NODO</span><input className="field uppercase" placeholder="NODO-XXXXXX" autoCapitalize="characters" {...register("codigo")} aria-invalid={Boolean(errors.codigo)}/>{errors.codigo&&<p className="mt-1.5 text-sm font-semibold text-coralDark">{errors.codigo.message}</p>}</label>
    {error&&<p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coralDark">{error}</p>}
    <button disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 font-extrabold text-white disabled:opacity-60">{isSubmitting&&<Loader2 className="animate-spin" size={18} aria-hidden="true"/>}Pedir el borrado</button>
  </form>;
}
