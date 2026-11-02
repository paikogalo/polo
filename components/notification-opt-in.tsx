"use client";
import {Bell,BellRing} from "lucide-react";
import {useEffect,useState} from "react";

export function NotificationOptIn(){
  const [permission,setPermission]=useState<NotificationPermission|"unsupported">("default");
  useEffect(()=>setPermission("Notification" in window?Notification.permission:"unsupported"),[]);
  const activate=async()=>{
    if(!("Notification" in window))return;
    const next=await Notification.requestPermission();
    setPermission(next);
    if(next==="granted")new Notification("Alertas activadas",{body:"Te avisaremos cuando aparezca una nueva publicación mientras uses la plataforma."});
  };
  if(permission==="unsupported")return null;
  return <button type="button" onClick={activate} disabled={permission==="granted"} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-white/20 disabled:cursor-default disabled:bg-ocean"><BellRing size={16}/>{permission==="granted"?"Alertas activadas":"Activar alertas"}</button>;
}
