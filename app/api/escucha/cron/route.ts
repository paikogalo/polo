import {authorizeCronRequest,privateHeaders} from "@/lib/escucha/auth";
import {formatDigest,runMonitor} from "@/lib/escucha/monitor";
import {sendTelegram} from "@/lib/escucha/telegram";

export const dynamic="force-dynamic";
export const maxDuration=30;

/**
 * Tareas automáticas protegidas con CRON_SECRET (Authorization: Bearer ...).
 *   ?tipo=manana  → reporte de la mañana (Vercel Cron, una vez al día)
 *   ?tipo=noche   → reporte de cierre (Vercel Cron, una vez al día)
 *   ?tipo=alertas&minutos=20 → alertas casi en tiempo real; lo llama un programador
 *     externo gratuito (cron-job.org o GitHub Actions) cada 15 minutos, porque el plan
 *     Hobby de Vercel solo admite tareas diarias.
 */
export async function GET(request:Request){
  if(!authorizeCronRequest(request))return Response.json({error:"No autorizado."},{status:401,headers:privateHeaders});
  const params=new URL(request.url).searchParams;
  const tipo=params.get("tipo")||"alertas";

  if(tipo==="manana"||tipo==="noche"){
    const result=await runMonitor({sinceHours:tipo==="manana"?12:15});
    const text=formatDigest(result.items,tipo==="manana"?"REPORTE DE LA MAÑANA":"CIERRE DEL DÍA");
    const delivery=await sendTelegram(text);
    return Response.json({ok:true,tipo,items:result.items.length,delivery},{headers:privateHeaders});
  }

  if(tipo==="alertas"){
    const minutes=Math.min(Math.max(Number(params.get("minutos"))||20,5),120);
    const cutoff=Date.now()-minutes*60*1000;
    const result=await runMonitor({sinceHours:3});
    const fresh=result.items.filter(item=>item.publishedAt&&new Date(item.publishedAt).getTime()>=cutoff&&(item.impact!=="bajo"||item.topics.includes("tiban")||item.topics.includes("polo")));
    if(!fresh.length)return Response.json({ok:true,tipo,nuevas:0},{headers:privateHeaders});
    const text=["🔔 ESCUCHA DIGITAL · ALERTA",...fresh.slice(0,8).flatMap(item=>[`• [${item.impact}] ${item.title} — ${item.outlet}`,`  ${item.url}`])].join("\n");
    const delivery=await sendTelegram(text);
    return Response.json({ok:true,tipo,nuevas:fresh.length,delivery},{headers:privateHeaders});
  }

  return Response.json({error:"Tipo no válido."},{status:400,headers:privateHeaders});
}
