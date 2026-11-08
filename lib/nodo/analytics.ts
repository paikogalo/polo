"use client";

export type NodoEvento=
  |"nodo_boton_click"
  |"nodo_video_play"|"nodo_video_50"|"nodo_video_100"
  |"nodo_descarga"
  |"nodo_registro_inicio"|"nodo_registro_enviado"|"nodo_registro_rechazado_edad"
  |"nodo_compartir";

type Datos=Record<string,string|number|boolean>;
type VercelAnalytics=(accion:"event",payload:{name:string;data?:Datos})=>void;

/**
 * Envía un evento agregado a Vercel Web Analytics (sin datos personales).
 * Si el script de analítica todavía no cargó, el evento se encola en window.vaq como hace el SDK oficial.
 */
export function trackNodo(evento:NodoEvento,datos?:Datos){
  if(typeof window==="undefined")return;
  const w=window as unknown as {va?:VercelAnalytics;vaq?:unknown[]};
  const payload={name:evento,...(datos?{data:datos}:{})};
  try{
    if(typeof w.va==="function")w.va("event",payload);
    else (w.vaq=w.vaq||[]).push(["event",payload]);
  }catch{/* La analítica nunca debe romper la página. */}
}
