"use client";
import {X} from "lucide-react";
import {useEffect,useState} from "react";
import {VIDEO_SRC} from "@/lib/video-src";

export function WelcomeVideo(){
  const [open,setOpen]=useState(true);
  const videoUrl=process.env.NEXT_PUBLIC_CAMPAIGN_VIDEO_URL;
  useEffect(()=>{const close=(event:KeyboardEvent)=>event.key==="Escape"&&setOpen(false);window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[]);
  if(!open)return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-deep/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="welcome-title" onMouseDown={event=>event.target===event.currentTarget&&setOpen(false)}>
    <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
      <button onClick={()=>setOpen(false)} className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-deep text-white shadow-lg" aria-label="Cerrar video"><X/></button>
      <div className="bg-black"><video className="mx-auto max-h-[82vh] w-full" controls autoPlay playsInline preload="metadata"><source src={videoUrl||VIDEO_SRC} type="video/mp4"/>Tu navegador no puede reproducir este video.</video></div>
    </div>
  </div>
}
