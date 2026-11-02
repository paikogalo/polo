import {authorizeEscuchaRequest,privateHeaders} from "@/lib/escucha/auth";
import {runMonitor} from "@/lib/escucha/monitor";
import {telegramIsConfigured} from "@/lib/escucha/telegram";

export const dynamic="force-dynamic";
export const maxDuration=30;

export async function GET(request:Request){
  if(!authorizeEscuchaRequest(request))return Response.json({error:"No autorizado."},{status:401,headers:privateHeaders});
  const hours=Math.min(Math.max(Number(new URL(request.url).searchParams.get("horas"))||48,6),168);
  const result=await runMonitor({sinceHours:hours});
  return Response.json({...result,telegram:telegramIsConfigured()},{headers:privateHeaders});
}
