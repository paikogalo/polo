"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import {useForm,type FieldErrors} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CheckCircle2,Copy,Facebook,Loader2,MessageCircle,ShieldCheck,Twitter} from "lucide-react";
import {cantones,comoNosConociste,estudiosOpciones,etapas,generos,intereses,MENSAJE_FUERA_DE_EDAD,NODO_SITE_URL,ocupaciones} from "@/lib/nodo/constants";
import {calcularEdad,edadEnRango,nodoRegistroSchema,type NodoRegistroInput} from "@/lib/nodo/schema";
import {trackNodo} from "@/lib/nodo/analytics";

const UTM_KEY="nodo_utm";
type Utm={utm_source?:string;utm_medium?:string;utm_campaign?:string};

function leerUtm():Utm{
  const params=new URLSearchParams(window.location.search);
  const desdeUrl:Utm={
    utm_source:params.get("utm_source")?.slice(0,60)||undefined,
    utm_medium:params.get("utm_medium")?.slice(0,60)||undefined,
    utm_campaign:params.get("utm_campaign")?.slice(0,80)||undefined,
  };
  try{
    if(desdeUrl.utm_source){sessionStorage.setItem(UTM_KEY,JSON.stringify(desdeUrl));return desdeUrl;}
    const guardado=sessionStorage.getItem(UTM_KEY);
    return guardado?JSON.parse(guardado) as Utm:{};
  }catch{return desdeUrl;}
}

const valoresIniciales:Partial<NodoRegistroInput>={
  nombres:"",fecha_nacimiento:"",genero:"",parroquia:"",comunidad_barrio:"",correo:"",whatsapp:"",
  intereses:[],idea:"",necesidad:"",como_nos_conociste:"",
  consentimiento_datos:false,consentimiento_sin_garantia:false,consentimiento_adolescente:false,acepta_novedades:false,website:"",
};

const shareText="Conoce NODO · Jóvenes Cotopaxi: plataforma de emprendimiento y tecnología para jóvenes de 16 a 30 años. Aprende - Emprende y Crece aquí.";

export function NodoRegistro(){
  const [codigo,setCodigo]=useState<string|null>(null);
  const [demo,setDemo]=useState(false);
  const [errorServidor,setErrorServidor]=useState("");
  const [fueraDeEdad,setFueraDeEdad]=useState(false);
  const [copiado,setCopiado]=useState(false);
  const iniciado=useRef(false);
  const exito=useRef<HTMLDivElement>(null);
  const {register,handleSubmit,watch,setValue,formState:{errors,isSubmitting}}=useForm<NodoRegistroInput>({
    resolver:zodResolver(nodoRegistroSchema),
    defaultValues:valoresIniciales,
    mode:"onTouched",
  });

  useEffect(()=>{
    const utm=leerUtm();
    if(utm.utm_source)setValue("utm_source",utm.utm_source);
    if(utm.utm_medium)setValue("utm_medium",utm.utm_medium);
    if(utm.utm_campaign)setValue("utm_campaign",utm.utm_campaign);
    if(utm.utm_source==="afiche")setValue("como_nos_conociste","Afiche/QR");
  },[setValue]);

  const rechazo=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(codigo){exito.current?.scrollIntoView({block:"center"});exito.current?.focus({preventScroll:true});}},[codigo]);
  useEffect(()=>{if(fueraDeEdad){rechazo.current?.scrollIntoView({block:"center"});rechazo.current?.focus({preventScroll:true});}},[fueraDeEdad]);

  const fecha=watch("fecha_nacimiento");
  const edad=useMemo(()=>fecha?calcularEdad(fecha):null,[fecha]);
  const esAdolescente=edad!==null&&edad>=16&&edad<=17;
  const edadInvalida=edad!==null&&!edadEnRango(edad);
  const idea=watch("idea")||"";
  const necesidad=watch("necesidad")||"";

  const marcarInicio=()=>{if(!iniciado.current){iniciado.current=true;trackNodo("nodo_registro_inicio");}};

  const enviar=async(data:NodoRegistroInput)=>{
    setErrorServidor("");
    try{
      const respuesta=await fetch("/api/nodo/registro",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...data,consentimiento_adolescente:esAdolescente?data.consentimiento_adolescente:false})});
      const resultado=await respuesta.json().catch(()=>({})) as {codigo?:string;error?:string;fueraDeEdad?:boolean;demo?:boolean};
      if(respuesta.ok&&resultado.codigo){setCodigo(resultado.codigo);setDemo(Boolean(resultado.demo));trackNodo("nodo_registro_enviado");return;}
      if(resultado.fueraDeEdad){setFueraDeEdad(true);trackNodo("nodo_registro_rechazado_edad");return;}
      setErrorServidor(resultado.error||"No pudimos completar tu registro. Inténtalo nuevamente en unos minutos.");
    }catch{setErrorServidor("No hay conexión en este momento. Revisa tu internet e inténtalo nuevamente.");}
  };

  const alFallar=(fallos:FieldErrors<NodoRegistroInput>)=>{
    if(fallos.fecha_nacimiento?.message===MENSAJE_FUERA_DE_EDAD){setFueraDeEdad(true);trackNodo("nodo_registro_rechazado_edad");return;}
    const primero=Object.keys(fallos)[0];
    if(primero)document.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
  };

  if(fueraDeEdad)return <div ref={rechazo} tabIndex={-1} role="status" className="rounded-[2rem] bg-white p-8 text-center shadow-soft outline-none sm:p-10">
    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-yellow text-2xl" aria-hidden="true">👋</span>
    <p className="mt-5 text-xl font-extrabold text-navy">{MENSAJE_FUERA_DE_EDAD}</p>
    <p className="mt-3 text-sm leading-6 text-navy/75">No guardamos ningún dato de este intento.</p>
    <button type="button" onClick={()=>{setFueraDeEdad(false);setValue("fecha_nacimiento","");}} className="mt-6 inline-flex min-h-11 items-center rounded-full border-2 border-navy px-5 py-2 font-extrabold text-navy hover:bg-navy hover:text-white">Corregir mi fecha de nacimiento</button>
  </div>;

  if(codigo){
    const url=`${NODO_SITE_URL}/nodo`;
    const redes=[
      {red:"whatsapp",label:"WhatsApp",icon:MessageCircle,href:`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`,cls:"bg-[#1E8E4E] text-white"},
      {red:"facebook",label:"Facebook",icon:Facebook,href:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,cls:"bg-[#1D5FC9] text-white"},
      {red:"x",label:"X",icon:Twitter,href:`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,cls:"bg-navy text-white"},
    ];
    return <div ref={exito} tabIndex={-1} role="status" className="rounded-[2rem] bg-white p-7 text-center shadow-soft outline-none sm:p-10">
      <CheckCircle2 className="mx-auto h-14 w-14 text-ocean" aria-hidden="true"/>
      <h3 className="mt-4 text-2xl font-extrabold text-navy">¡Tu registro está listo!</h3>
      <p className="mt-2 text-navy/75">Guarda tu código. Lo necesitarás si quieres consultar o borrar tus datos.</p>
      <div className="mx-auto mt-5 flex max-w-sm items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-ocean bg-sand px-5 py-4">
        <b className="whitespace-nowrap text-xl tracking-wider text-navy sm:text-2xl">{codigo}</b>
        <button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(codigo);setCopiado(true);}catch{/* sin portapapeles */}}} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-navy px-3 text-xs font-extrabold text-white" aria-label="Copiar código"><Copy size={15} aria-hidden="true"/>{copiado?"Copiado":"Copiar"}</button>
      </div>
      {demo?<p className="mx-auto mt-4 max-w-md rounded-xl bg-yellow/25 p-3 text-xs font-bold text-navy">Modo de prueba local: este registro no se guardó.</p>:<p className="mx-auto mt-4 max-w-md text-sm leading-6 text-navy/75">Te enviamos un correo con tu código y los próximos pasos. El equipo de NODO te contactará cuando se conforme el piloto en tu cantón.</p>}
      <p className="mt-7 text-sm font-extrabold uppercase tracking-wider text-oceanDark">Invita a otros jóvenes</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {redes.map(r=>{const Icon=r.icon;return <a key={r.red} href={r.href} target="_blank" rel="noopener noreferrer" onClick={()=>trackNodo("nodo_compartir",{red:r.red})} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold ${r.cls}`}><Icon size={17} aria-hidden="true"/>{r.label}</a>})}
      </div>
    </div>;
  }

  const err=(campo:keyof NodoRegistroInput)=>errors[campo]?.message as string|undefined;
  const FieldError=({campo}:{campo:keyof NodoRegistroInput})=>err(campo)?<p id={`${campo}-error`} className="mt-1.5 text-sm font-semibold text-coralDark">{err(campo)}</p>:null;
  const aria=(campo:keyof NodoRegistroInput)=>({"aria-invalid":Boolean(err(campo)),"aria-describedby":err(campo)?`${campo}-error`:undefined});
  const hoy=new Date().toISOString().slice(0,10);

  return <form onSubmit={event=>{if(edadInvalida){event.preventDefault();setFueraDeEdad(true);trackNodo("nodo_registro_rechazado_edad");return;}handleSubmit(enviar,alFallar)(event);}} onFocusCapture={marcarInicio} noValidate className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-8">
    <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" {...register("website")}/>

    <fieldset className="grid gap-5 sm:grid-cols-2">
      <legend className="mb-4 text-lg font-extrabold text-navy">1 · Sobre ti</legend>
      <label className="sm:col-span-2"><span className="label">Nombres y apellidos *</span><input className="field" autoComplete="name" {...register("nombres")} {...aria("nombres")}/><FieldError campo="nombres"/></label>
      <label><span className="label">Fecha de nacimiento *</span><input type="date" max={hoy} className="field" {...register("fecha_nacimiento")} {...aria("fecha_nacimiento")}/><FieldError campo="fecha_nacimiento"/>{edadInvalida&&!err("fecha_nacimiento")&&<p className="mt-1.5 text-sm font-semibold text-coralDark">{MENSAJE_FUERA_DE_EDAD}</p>}</label>
      <label><span className="label">Género (opcional)</span><select className="field" {...register("genero")}><option value="">Prefiero no responder</option>{generos.map(g=><option key={g}>{g}</option>)}</select></label>
      <label><span className="label">Cantón *</span><select className="field" {...register("canton")} {...aria("canton")} defaultValue=""><option value="" disabled>Elige tu cantón</option>{cantones.map(c=><option key={c}>{c}</option>)}</select><FieldError campo="canton"/></label>
      <label><span className="label">Parroquia *</span><input className="field" {...register("parroquia")} {...aria("parroquia")}/><FieldError campo="parroquia"/></label>
      <label className="sm:col-span-2"><span className="label">Comunidad o barrio (opcional)</span><input className="field" {...register("comunidad_barrio")}/></label>
    </fieldset>

    <fieldset className="mt-8 grid gap-5 sm:grid-cols-2">
      <legend className="mb-4 text-lg font-extrabold text-navy">2 · Contacto</legend>
      <label><span className="label">Correo electrónico *</span><input type="email" inputMode="email" autoComplete="email" className="field" {...register("correo")} {...aria("correo")}/><FieldError campo="correo"/></label>
      <label><span className="label">WhatsApp *</span><input type="tel" inputMode="tel" autoComplete="tel" placeholder="09XXXXXXXX" className="field" {...register("whatsapp")} {...aria("whatsapp")}/><FieldError campo="whatsapp"/></label>
    </fieldset>

    <fieldset className="mt-8 grid gap-5 sm:grid-cols-2">
      <legend className="mb-4 text-lg font-extrabold text-navy">3 · Tu camino</legend>
      <label><span className="label">Estudios *</span><select className="field" defaultValue="" {...register("estudios")} {...aria("estudios")}><option value="" disabled>Elige una opción</option>{estudiosOpciones.map(o=><option key={o}>{o}</option>)}</select><FieldError campo="estudios"/></label>
      <label><span className="label">Ocupación *</span><select className="field" defaultValue="" {...register("ocupacion")} {...aria("ocupacion")}><option value="" disabled>Elige una opción</option>{ocupaciones.map(o=><option key={o}>{o}</option>)}</select><FieldError campo="ocupacion"/></label>
      <div className="sm:col-span-2" role="group" aria-labelledby="intereses-label" aria-describedby={err("intereses")?"intereses-error":undefined}>
        <span id="intereses-label" className="label">¿Qué te gustaría emprender? * <span className="font-semibold text-navy/70">(elige uno o varios)</span></span>
        <div className="grid gap-2 sm:grid-cols-2">{intereses.map(i=><label key={i} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy has-[:checked]:border-ocean has-[:checked]:bg-mist/60"><input type="checkbox" value={i} className="h-5 w-5 accent-[#0F6E73]" {...register("intereses")}/>{i}</label>)}</div>
        <FieldError campo="intereses"/>
      </div>
      <div className="sm:col-span-2" role="radiogroup" aria-labelledby="etapa-label">
        <span id="etapa-label" className="label">¿En qué etapa estás? *</span>
        <div className="grid gap-2 sm:grid-cols-3">{etapas.map(e=><label key={e} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy has-[:checked]:border-ocean has-[:checked]:bg-mist/60"><input type="radio" value={e} className="h-5 w-5 accent-[#0F6E73]" {...register("etapa")}/>{e}</label>)}</div>
        <FieldError campo="etapa"/>
      </div>
      <label className="sm:col-span-2"><span className="label">Tu idea (opcional)</span><textarea rows={3} maxLength={500} className="field resize-y" {...register("idea")} {...aria("idea")}/><span className="mt-1 block text-right text-xs text-navy/70">{idea.length}/500</span><FieldError campo="idea"/></label>
      <label className="sm:col-span-2"><span className="label">¿Qué necesitarías para emprender en tu cantón? (opcional)</span><textarea rows={2} maxLength={300} className="field resize-y" {...register("necesidad")} {...aria("necesidad")}/><span className="mt-1 block text-right text-xs text-navy/70">{necesidad.length}/300</span><FieldError campo="necesidad"/></label>
      <div role="radiogroup" aria-labelledby="piloto-label">
        <span id="piloto-label" className="label">¿Te gustaría participar en el piloto? *</span>
        <div className="flex gap-2">{[["si","Sí"],["no","No por ahora"]].map(([v,l])=><label key={v} className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-navy/15 px-4 py-2.5 text-sm font-bold text-navy has-[:checked]:border-ocean has-[:checked]:bg-mist/60"><input type="radio" value={v} className="h-5 w-5 accent-[#0F6E73]" {...register("participaria_piloto")}/>{l}</label>)}</div>
        <FieldError campo="participaria_piloto"/>
      </div>
      <label><span className="label">¿Cómo nos conociste?</span><select className="field" {...register("como_nos_conociste")}><option value="">Elige una opción</option>{comoNosConociste.map(o=><option key={o}>{o}</option>)}</select></label>
    </fieldset>

    <fieldset className="mt-8 space-y-3 rounded-3xl bg-sand p-5">
      <legend className="sr-only">Autorizaciones</legend>
      <p className="flex items-center gap-2 text-sm font-extrabold text-navy"><ShieldCheck size={18} className="text-oceanDark" aria-hidden="true"/>Autorizaciones</p>
      {esAdolescente&&<label className="flex items-start gap-3 rounded-2xl border-2 border-yellow bg-white p-4 text-sm leading-6 text-navy"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#0F6E73]" {...register("consentimiento_adolescente")} {...aria("consentimiento_adolescente")}/><span><b>Tengo 16 o 17 años, entiendo para qué se usarán mis datos y autorizo su tratamiento.</b> Tus datos solo sirven para conformar el piloto NODO y contactarte sobre el programa (art. 21 de la Ley Orgánica de Protección de Datos Personales).<FieldError campo="consentimiento_adolescente"/></span></label>}
      <label className="flex items-start gap-3 text-sm leading-6 text-navy"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#0F6E73]" {...register("consentimiento_datos")} {...aria("consentimiento_datos")}/><span>Autorizo el tratamiento de mis datos personales, conforme a la Ley Orgánica de Protección de Datos Personales, únicamente para conformar el piloto NODO y contactarme sobre el programa. *<FieldError campo="consentimiento_datos"/></span></label>
      <label className="flex items-start gap-3 text-sm leading-6 text-navy"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#0F6E73]" {...register("consentimiento_sin_garantia")} {...aria("consentimiento_sin_garantia")}/><span>Entiendo que registrarme no garantiza cupo, dinero ni beneficio alguno. *<FieldError campo="consentimiento_sin_garantia"/></span></label>
      <label className="flex items-start gap-3 text-sm leading-6 text-navy"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#0F6E73]" {...register("acepta_novedades")}/><span>Quiero recibir novedades de NODO por correo o WhatsApp. (Opcional)</span></label>
      <p className="text-xs leading-5 text-navy/75">No pedimos cédula, dirección exacta, afiliación política ni datos de salud. Puedes pedir el borrado de tus datos cuando quieras en <a className="font-bold text-oceanDark underline" href="/nodo/mis-datos">/nodo/mis-datos</a>.</p>
    </fieldset>

    {errorServidor&&<p role="alert" className="mt-5 rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coralDark">{errorServidor}</p>}
    <button type="submit" disabled={isSubmitting} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-yellow px-6 py-4 text-lg font-extrabold text-navy transition hover:bg-navy hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60">
      {isSubmitting?<><Loader2 className="animate-spin" size={20} aria-hidden="true"/>Enviando…</>:"Enviar mi registro"}
    </button>
    <p className="mt-3 text-center text-xs text-navy/70">Los campos con * son obligatorios. El registro es gratuito.</p>
  </form>;
}
