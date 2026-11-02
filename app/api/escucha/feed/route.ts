import {authorizeEscuchaRequest,denied,privateHeaders} from "@/lib/escucha/auth";
import {getConfig} from "@/lib/escucha/config";
import {runMonitor} from "@/lib/escucha/monitor";

export const dynamic="force-dynamic";
export const maxDuration=30;

export async function GET(request:Request){
  if(!await authorizeEscuchaRequest(request))return denied();
  const hours=Math.min(Math.max(Number(new URL(request.url).searchParams.get("horas"))||48,6),168);
  return Response.json(await runMonitor(await getConfig(),{sinceHours:hours}),{headers:privateHeaders});
}
