"use client";
import {zodResolver} from "@hookform/resolvers/zod";
import {BellRing,CheckCircle2,Loader2,Mail,UsersRound} from "lucide-react";
import {useEffect,useState} from "react";
import {useForm} from "react-hook-form";
import {ageRanges,communityInterests,communityRegistrationSchema,genderOptions,type CommunityRegistration} from "@/lib/community-schema";

export function CommunityRegister(){
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const {register,handleSubmit,reset,setValue,formState:{errors,isSubmitting}}=useForm<CommunityRegistration>({resolver:zodResolver(communityRegistrationSchema),defaultValues:{fullName:"",email:"",phone:"",canton:"",parish:"",neighborhood:"",ageRange:"",gender:"",interests:[],consentCommunications:false,website:"",source:"web"}});
  useEffect(()=>{const source=new URLSearchParams(window.location.search).get("source");if(source==="ios"||source==="android")setValue("source",source);},[setValue]);
  const submit=async(data:CommunityRegistration)=>{
    setError("");setMessage("");
    try{
      const response=await fetch("/api/community/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"No se pudo completar el registro.");
      setMessage(result.message||"Revisa tu correo para confirmar el registro.");
      if(data.source!=="web"){
        const bridge=(window as unknown as {ReactNativeWebView?:{postMessage:(value:string)=>void}}).ReactNativeWebView;
        bridge?.postMessage(JSON.stringify({type:"community-registration",email:data.email}));
      }
      reset({fullName:"",email:"",phone:"",canton:"",parish:"",neighborhood:"",ageRange:"",gender:"",interests:[],consentCommunications:false,website:"",source:data.source});
    }catch(reason){setError(reason instanceof Error?reason.message:"No se pudo completar el registro.");}
  };
  if(message)return <div className="rounded-[2rem] bg-white p-8 text-center shadow-2xl"><CheckCircle2 className="mx-auto h-14 w-14 text-ocean"/><h3 className="mt-4 font-serif text-2xl font-black text-deep">Revisa tu correo</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-navy/65">{message} Tus datos pasarán a la comunidad únicamente cuando confirmes el enlace.</p><button onClick={()=>setMessage("")} className="mt-6 rounded-full bg-deep px-6 py-3 text-sm font-extrabold text-white">Registrar otra persona</button></div>;
  return <form onSubmit={handleSubmit(submit)} className="rounded-[2rem] bg-white p-6 text-deep shadow-2xl sm:p-8">
    <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist text-ocean"><UsersRound/></span><div><h3 className="font-serif text-2xl font-black">Únete a la comunidad</h3><p className="mt-1 text-sm leading-6 text-navy/55">Registro voluntario exclusivo para personas mayores de 18 años. Primero confirmaremos tu correo.</p></div></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="label">Nombre completo</span><input className="field" autoComplete="name" {...register("fullName")}/>{errors.fullName?<span className="mt-1 block text-xs text-red-700">{errors.fullName.message}</span>:null}</label><label><span className="label">Correo electrónico</span><input className="field" type="email" autoComplete="email" {...register("email")}/>{errors.email?<span className="mt-1 block text-xs text-red-700">{errors.email.message}</span>:null}</label><label><span className="label">Teléfono (opcional)</span><input className="field" type="tel" autoComplete="tel" {...register("phone")}/></label><label><span className="label">Cantón (opcional)</span><input className="field" autoComplete="address-level2" {...register("canton")}/></label><label><span className="label">Parroquia (opcional)</span><input className="field" {...register("parish")}/></label><label><span className="label">Barrio o comunidad (opcional)</span><input className="field" {...register("neighborhood")}/></label><label><span className="label">Rango de edad (opcional y agregado)</span><select className="field" {...register("ageRange")}><option value="">No responder</option>{ageRanges.map(range=><option key={range}>{range}</option>)}</select></label><label><span className="label">Género (opcional y agregado)</span><select className="field" {...register("gender")}><option value="">No responder</option>{genderOptions.map(option=><option key={option}>{option}</option>)}</select></label></div>
    <fieldset className="mt-5"><legend className="label">¿Qué contenidos te interesan? (opcional)</legend><div className="flex flex-wrap gap-2">{communityInterests.map(interest=><label key={interest} className="cursor-pointer"><input type="checkbox" value={interest} className="peer sr-only" {...register("interests")}/><span className="block rounded-full border border-navy/15 px-3 py-2 text-xs font-bold text-navy/65 transition peer-checked:border-ocean peer-checked:bg-mist peer-checked:text-ocean">{interest}</span></label>)}</div></fieldset>
    <input className="hidden" tabIndex={-1} autoComplete="off" {...register("website")}/>
    <div className="mt-5 rounded-2xl border border-ocean/20 bg-mist/60 p-4 text-xs leading-5 text-navy/65"><strong className="text-deep">Tu privacidad importa.</strong> Edad, género y territorio son opcionales y se utilizan únicamente en estadísticas agrupadas. No inferimos estos datos ni creamos perfiles de visitantes anónimos. La lista privada del equipo autorizado muestra solo nombre, correo y origen del registro.</div>
    <label className="mt-4 flex items-start gap-3 rounded-2xl bg-sand p-4 text-sm leading-6"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-ocean" {...register("consentCommunications")}/><span>Confirmo que soy mayor de 18 años. Deseo recibir novedades y autorizo el tratamiento confidencial de los datos que decidí compartir para comunicaciones oficiales y métricas agregadas. Puedo retirar mi autorización cuando quiera.</span></label>{errors.consentCommunications?<p className="mt-2 text-xs font-bold text-red-700">{errors.consentCommunications.message}</p>:null}
    {error?<p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>:null}
    <button disabled={isSubmitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-coral px-5 py-4 font-extrabold text-white shadow-lg disabled:opacity-60">{isSubmitting?<Loader2 className="animate-spin"/>:<Mail/>}{isSubmitting?"Enviando confirmación…":"Registrarme y confirmar mi correo"}</button>
    <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-navy/45"><BellRing size={14}/>Las alertas del teléfono siempre requieren autorización adicional.</p>
  </form>;
}
