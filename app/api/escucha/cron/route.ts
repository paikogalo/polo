import {runDigest,runRedAlerts} from "@/lib/escucha/alerts";
import {authorizeCronRequest,denied,privateHeaders} from "@/lib/escucha/auth";

export const dynamic="force-dynamic";
export const maxDuration=30;

/**
 * Tareas automáticas protegidas con CRON_SECRET (Authorization: Bearer ...).
 *   ?tipo=rojo     → alertas inmediatas (cada 10 minutos)
 *   ?tipo=mediodia → resumen naranja (12:00 Ecuador)
 *   ?tipo=noche    → resumen verde (20:00 Ecuador)
 * Las tres las dispara GitHub Actions con un token OIDC firmado: no hay claves que cargar a mano.
 */
export async function GET(request:Request){
  if(!await authorizeCronRequest(request))return denied();
  const tipo=new URL(request.url).searchParams.get("tipo");
  if(tipo==="rojo")return Response.json(await runRedAlerts(),{headers:privateHeaders});
  if(tipo==="mediodia"||tipo==="noche")return Response.json(await runDigest(tipo),{headers:privateHeaders});
  return Response.json({error:"Tipo no válido."},{status:400,headers:privateHeaders});
}
