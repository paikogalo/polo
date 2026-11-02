"use client";
import {CheckCircle2,XCircle} from "lucide-react";
import {useEffect,useState} from "react";

export function RegistrationStatus(){
  const [status,setStatus]=useState<"confirmado"|"error"|"configuracion"|"cancelada"|null>(null);
  useEffect(()=>{const params=new URLSearchParams(window.location.search);const registration=params.get("registro");const subscription=params.get("suscripcion");if(subscription==="cancelada")setStatus("cancelada");else if(registration==="confirmado"||registration==="error"||registration==="configuracion")setStatus(registration);else if(subscription==="error")setStatus("error");},[]);
  if(!status)return null;
  const ok=status==="confirmado"||status==="cancelada";
  const title=status==="confirmado"?"Correo confirmado":status==="cancelada"?"Suscripción cancelada":"No pudimos completar la solicitud";
  const detail=status==="confirmado"?"Ya puedes recibir las novedades que autorizaste.":status==="cancelada"?"Tu solicitud fue cancelada y no recibirás nuevas comunicaciones.":status==="configuracion"?"El canal todavía está siendo configurado.":"El enlace no es válido, ya fue utilizado o venció.";
  return <div className={`fixed left-1/2 top-24 z-[90] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-start gap-3 rounded-2xl p-4 shadow-2xl ${ok?"bg-deep text-white":"bg-white text-deep"}`}>{ok?<CheckCircle2 className="shrink-0 text-ocean"/>:<XCircle className="shrink-0 text-coral"/>}<div className="flex-1"><b className="block text-sm">{title}</b><span className={`mt-1 block text-xs ${ok?"text-white/65":"text-navy/55"}`}>{detail}</span></div><button onClick={()=>setStatus(null)} className="text-xs font-black">Cerrar</button></div>;
}
