"use client";

import {FormEvent,useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {Bot,BriefcaseBusiness,ExternalLink,Headphones,MapPin,MessageCircle,RotateCcw,Send,X} from "lucide-react";
import {notifyChatPrefill,saveChatPrefill} from "@/lib/chat-prefill";

type RouteChoice="need"|"work";
type Message={id:number;from:"assistant"|"visitor";text:string;href?:string;action?:string};
type ContactDetails={fullName:string;email:string;phone:string;message:string;consent:boolean};

const emptyContact:ContactDetails={fullName:"",email:"",phone:"",message:"",consent:false};
const whatsappChannels=[
  {number:process.env.NEXT_PUBLIC_WHATSAPP_1,label:process.env.NEXT_PUBLIC_WHATSAPP_LABEL_1||"Necesidades territoriales"},
  {number:process.env.NEXT_PUBLIC_WHATSAPP_2,label:process.env.NEXT_PUBLIC_WHATSAPP_LABEL_2||"Trabaja con nosotros"},
  {number:process.env.NEXT_PUBLIC_WHATSAPP_3,label:process.env.NEXT_PUBLIC_WHATSAPP_LABEL_3||"Atención general"},
].map((channel,index)=>{
  const number=(channel.number||"").replace(/\D/g,"");
  return {...channel,id:index+1,number:number.length>=7&&number.length<=15?number:""};
});

const initialMessage:Message={id:1,from:"assistant",text:"¡Hola! Soy el asistente de Hipólito. ¿Quieres contar una necesidad de tu territorio o trabajar con nosotros?"};
const formHref=(route:RouteChoice)=>route==="work"?"/trabaja#formulario-trabajo":"/#participa";

function normalize(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}

function answerQuestion(question:string,route:RouteChoice):Omit<Message,"id"|"from"> & {human?:boolean}{
  const text=normalize(question);
  if(/humano|persona|asesor|whatsapp|hablar|contacto/.test(text))return {text:"Claro. Puedes elegir manualmente uno de los canales de atención humana disponibles. WhatsApp no se abrirá hasta que tú lo decidas.",human:true};
  if(/privacidad|privado|datos|segur|confiden/.test(text))return {text:"Tu información es privada y solo será utilizada por el equipo autorizado para responder tu solicitud. No se publica y este chat no crea perfiles sobre tus intereses.",href:formHref(route),action:"Revisar el formulario"};
  if(/garantiza|contrat|seleccion|selección/.test(text))return {text:"Registrar un perfil no garantiza un puesto. Cualquier selección debe cumplir los requisitos, el mérito, la normativa y la transparencia.",href:"/trabaja#formulario-trabajo",action:"Ver formulario de perfiles"};
  if(/trabaj|empleo|puesto|vacante|postul|curriculum|currículum|\bcv\b|certificado|documento|hoja de vida|experiencia|peso|pesar|\bmb\b|tamano|tamaño/.test(text))return {text:"En “Trabaja con nosotros” puedes registrar tu perfil y adjuntar el CV, certificados de experiencia y carta de presentación. Se aceptan PDF, DOC o DOCX, con máximo 4 MB entre todos los archivos.",href:"/trabaja#formulario-trabajo",action:"Abrir Trabaja con nosotros"};
  if(/foto|imagen|archivo/.test(text)&&route==="need")return {text:"En el formulario territorial puedes adjuntar hasta 3 fotografías JPG, PNG o WEBP, de máximo 5 MB cada una. Las fotos son opcionales y privadas.",href:"/#participa",action:"Adjuntar en el formulario"};
  if(/ubicacion|canton|parroquia|barrio|comunidad|recinto|direccion/.test(text))return {text:"Puedes indicar cantón, parroquia, barrio, comunidad o recinto. También puedes autorizar la ubicación del teléfono; es opcional y se usa únicamente para ubicar la necesidad.",href:"/#participa",action:"Ir a ubicación"};
  if(/necesidad|problema|propuesta|territorio|vialidad|agua|riego|ambiente|produccion|seguridad/.test(text))return {text:"Describe la necesidad con el mayor detalle posible, selecciona su categoría y urgencia, e indica dónde ocurre. También puedes agregar fotografías.",href:"/#participa",action:"Contar mi necesidad"};
  if(/nombre|correo|email|telefono|teléfono|mensaje/.test(text))return {text:"Puedes dejar nombre completo, correo, teléfono y mensaje para prellenar el formulario. Antes debes aceptar el tratamiento confidencial de esos datos."};
  return route==="need"
    ?{text:"Puedo orientarte sobre ubicación, fotografías, privacidad o cómo hablar con una persona. Para registrar el caso completo, continúa en el formulario territorial.",href:"/#participa",action:"Abrir formulario territorial"}
    :{text:"Puedo orientarte sobre CV, certificados, privacidad o atención humana. Para enviar documentos, continúa en el formulario completo.",href:"/trabaja#formulario-trabajo",action:"Abrir formulario de trabajo"};
}

function whatsappHref(number:string){
  const message="Hola, deseo hablar con una persona desde la plataforma de Hipólito Carrera.";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function InstantChatbot(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const [route,setRoute]=useState<RouteChoice|null>(null);
  const [messages,setMessages]=useState<Message[]>([initialMessage]);
  const [question,setQuestion]=useState("");
  const [showContact,setShowContact]=useState(false);
  const [showHuman,setShowHuman]=useState(false);
  const [contact,setContact]=useState<ContactDetails>(emptyContact);
  const [contactError,setContactError]=useState("");
  const [contactReady,setContactReady]=useState(false);
  const nextId=useRef(2);
  const closeButton=useRef<HTMLButtonElement>(null);
  const launcher=useRef<HTMLButtonElement>(null);

  useEffect(()=>{
    if(!open)return;
    closeButton.current?.focus();
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);launcher.current?.focus()}};
    window.addEventListener("keydown",escape);
    return()=>window.removeEventListener("keydown",escape);
  },[open]);

  if(pathname.startsWith("/admin"))return null;

  const append=(...items:Array<Omit<Message,"id">>)=>setMessages(current=>[...current,...items.map(item=>({...item,id:nextId.current++}))]);
  const chooseRoute=(choice:RouteChoice)=>{
    setRoute(choice);setShowContact(false);setShowHuman(false);setContactReady(false);
    if(choice==="need")append(
      {from:"visitor",text:"Quiero contar una necesidad"},
      {from:"assistant",text:"Te ayudaré a registrar el problema, su ubicación, categoría, urgencia y fotografías. Puedes hacerme una pregunta o abrir el formulario completo.",href:"/#participa",action:"Abrir formulario de necesidades"},
    );
    else append(
      {from:"visitor",text:"Quiero trabajar con nosotros"},
      {from:"assistant",text:"Te orientaré para registrar tu perfil. El envío del CV, certificados y carta de presentación se realiza en el formulario completo.",href:"/trabaja#formulario-trabajo",action:"Abrir formulario de trabajo"},
    );
  };
  const reset=()=>{setRoute(null);setMessages([initialMessage]);setQuestion("");setShowContact(false);setShowHuman(false);setContact(emptyContact);setContactError("");setContactReady(false);nextId.current=2};
  const ask=(event:FormEvent)=>{
    event.preventDefault();
    const value=question.trim();if(!value||!route)return;
    const answer=answerQuestion(value,route);
    append({from:"visitor",text:value},{from:"assistant",text:answer.text,href:answer.href,action:answer.action});
    setQuestion("");if(answer.human)setShowHuman(true);
  };
  const submitContact=(event:FormEvent)=>{
    event.preventDefault();setContactError("");
    if(contact.fullName.trim().length<3)return setContactError("Escribe tu nombre completo.");
    if(!/^\S+@\S+\.\S+$/.test(contact.email))return setContactError("Escribe un correo electrónico válido.");
    if(contact.phone.replace(/\D/g,"").length<7)return setContactError("Escribe un teléfono válido.");
    if(contact.message.trim().length<5)return setContactError("Cuéntanos brevemente cómo podemos ayudarte.");
    if(!contact.consent)return setContactError("Necesitamos tu autorización para preparar el formulario.");
    saveChatPrefill({fullName:contact.fullName.trim(),email:contact.email.trim(),phone:contact.phone.trim(),message:contact.message.trim()});
    if((route==="need"&&pathname==="/")||(route==="work"&&pathname==="/trabaja"))notifyChatPrefill();
    setContactReady(true);setShowContact(false);
    append({from:"assistant",text:"Tus datos están listos para prellenar el formulario. No se enviaron a WhatsApp ni se guardaron como un perfil de intereses."});
  };

  return <div className="fixed bottom-[5.4rem] right-4 z-[70] flex flex-col items-end gap-3 lg:bottom-6 lg:right-6">
    {open&&<section id="chatbot-panel" role="dialog" aria-modal="false" aria-labelledby="chatbot-title" className="flex max-h-[calc(100vh-10rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-white/30 bg-white shadow-2xl">
      <header className="brand-gradient flex items-center justify-between gap-3 px-5 py-4 text-white">
        <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/15"><Bot aria-hidden="true"/></span><div className="min-w-0"><h2 id="chatbot-title" className="truncate text-sm font-black">Asistente inmediato</h2><p className="text-xs text-white/75">Orientación automática · atención humana</p></div></div>
        <button ref={closeButton} type="button" onClick={()=>{setOpen(false);launcher.current?.focus()}} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-label="Cerrar asistente"><X size={19}/></button>
      </header>
      <div className="overflow-y-auto p-4">
        <div className="space-y-3" aria-live="polite" aria-label="Conversación con el asistente">
          {messages.map(message=><div key={message.id} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.from==="assistant"?"bg-mist text-deep":"ml-auto bg-deep text-white"}`}><p>{message.text}</p>{message.href&&<a href={message.href} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-ocean shadow-sm">{message.action}<ExternalLink size={13}/></a>}</div>)}
        </div>

        {!route&&<div className="mt-4 grid gap-2"><button type="button" onClick={()=>chooseRoute("need")} className="flex items-center gap-3 rounded-2xl border border-ocean/25 bg-mist/50 p-4 text-left text-sm font-extrabold text-deep transition hover:border-ocean"><MapPin className="text-ocean"/>Contar una necesidad</button><button type="button" onClick={()=>chooseRoute("work")} className="flex items-center gap-3 rounded-2xl border border-purple/20 bg-purple/5 p-4 text-left text-sm font-extrabold text-deep transition hover:border-purple"><BriefcaseBusiness className="text-purple"/>Trabaja con nosotros</button></div>}

        {route&&<>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Preguntas frecuentes">
            {(route==="need"?["¿Cómo agrego la ubicación?","¿Puedo enviar fotos?","¿Mis datos son privados?"]:["¿Qué documentos necesito?","¿Cuánto pueden pesar?","¿El registro garantiza trabajo?"]).map(item=><button key={item} type="button" onClick={()=>{const answer=answerQuestion(item,route);append({from:"visitor",text:item},{from:"assistant",text:answer.text,href:answer.href,action:answer.action})}} className="rounded-full border border-navy/10 px-3 py-2 text-xs font-bold text-navy hover:border-ocean hover:text-ocean">{item}</button>)}
          </div>
          <form onSubmit={ask} className="mt-4 flex gap-2"><label className="sr-only" htmlFor="chat-question">Escribe tu pregunta</label><input id="chat-question" value={question} onChange={event=>setQuestion(event.target.value)} className="field min-w-0 flex-1 py-2.5" maxLength={300} placeholder="Escribe tu pregunta…"/><button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ocean text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean" aria-label="Enviar pregunta"><Send size={18}/></button></form>
          <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={()=>{setShowContact(value=>!value);setShowHuman(false)}} className="rounded-2xl bg-yellow px-3 py-3 text-xs font-extrabold text-deep">Dejar mis datos</button><button type="button" onClick={()=>{setShowHuman(value=>!value);setShowContact(false)}} className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-coral px-3 py-3 text-xs font-extrabold text-white"><Headphones size={15}/>Hablar con humano</button></div>
        </>}

        {showContact&&<form onSubmit={submitContact} className="mt-4 rounded-2xl border border-navy/10 bg-sand p-4"><h3 className="text-sm font-black text-deep">Datos para seguimiento</h3><p className="mt-1 text-xs leading-5 text-navy/55">Se guardan temporalmente solo en esta pestaña para prellenar el formulario.</p><div className="mt-3 grid gap-3"><label><span className="label">Nombre completo</span><input className="field py-2.5" autoComplete="name" value={contact.fullName} onChange={event=>setContact(current=>({...current,fullName:event.target.value}))}/></label><label><span className="label">Correo electrónico</span><input className="field py-2.5" type="email" autoComplete="email" value={contact.email} onChange={event=>setContact(current=>({...current,email:event.target.value}))}/></label><label><span className="label">Teléfono</span><input className="field py-2.5" type="tel" inputMode="tel" autoComplete="tel" value={contact.phone} onChange={event=>setContact(current=>({...current,phone:event.target.value}))}/></label><label><span className="label">Mensaje</span><textarea className="field min-h-24 resize-y py-2.5" maxLength={600} value={contact.message} onChange={event=>setContact(current=>({...current,message:event.target.value}))}/></label><label className="flex items-start gap-2 text-xs leading-5 text-navy/70"><input type="checkbox" className="mt-1 h-4 w-4 accent-ocean" checked={contact.consent} onChange={event=>setContact(current=>({...current,consent:event.target.checked}))}/><span>Autorizo usar temporalmente estos datos para prellenar el formulario que yo decida enviar.</span></label>{contactError&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{contactError}</p>}<button className="rounded-xl bg-deep px-4 py-3 text-xs font-extrabold text-white">Preparar formulario</button></div></form>}

        {contactReady&&route&&<a href={formHref(route)} className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-ocean px-4 py-3 text-sm font-extrabold text-white">Continuar al formulario completo<ExternalLink size={15}/></a>}

        {showHuman&&<div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4"><h3 className="flex items-center gap-2 text-sm font-black text-green-800"><MessageCircle size={18}/>Atención por WhatsApp</h3><p className="mt-2 text-xs leading-5 text-green-800">El enlace abre WhatsApp, un servicio de Meta. Solo precarga una frase genérica revisable; no incluye tu nombre, correo, teléfono, mensaje ni documentos.</p><div className="mt-3 grid gap-2">{whatsappChannels.map(channel=>channel.number?<a key={channel.id} href={whatsappHref(channel.number)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-green-600 px-4 py-3 text-xs font-extrabold text-white"><span>{channel.label}</span><ExternalLink size={14}/></a>:<span key={channel.id} aria-disabled="true" className="flex items-center justify-between rounded-xl border border-dashed border-green-300 bg-white/70 px-4 py-3 text-xs font-extrabold text-green-900"><span>{channel.label}</span><span className="font-bold text-green-700">Número pendiente</span></span>)}</div>{whatsappChannels.every(channel=>!channel.number)&&<p className="mt-2 text-xs leading-5 text-green-800">Los tres canales están listos para configurar. Mientras se agregan los números oficiales, continúa en el formulario correspondiente.</p>}</div>}

        {route&&<button type="button" onClick={reset} className="mx-auto mt-4 flex items-center gap-1.5 text-xs font-bold text-navy/55 hover:text-ocean"><RotateCcw size={14}/>Empezar de nuevo</button>}
      </div>
    </section>}
    <button ref={launcher} type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-controls="chatbot-panel" aria-label="Ayuda inmediata" className="inline-flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-coralDark p-0 font-extrabold text-white shadow-2xl transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-coral/30 sm:h-auto sm:w-auto sm:px-5 sm:py-3.5"><MessageCircle aria-hidden="true"/><span className="sr-only sm:not-sr-only">Ayuda inmediata</span></button>
  </div>;
}
