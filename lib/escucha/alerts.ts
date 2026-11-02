import {getConfig} from "@/lib/escucha/config";
import {formatAlert,formatDigest,runMonitor,type MonitorItem,type Semaforo} from "@/lib/escucha/monitor";
import {markOnce,pushLog,readLog} from "@/lib/escucha/store";
import {sendTelegram} from "@/lib/escucha/telegram";

export type AlertRun={at:string;tipo:"rojo"|"mediodia"|"noche"|"prueba";items:number;sent:number;skipped:boolean;error?:string;by:string};
const LOG_KEY="escucha:alert-log";
const DAYS=4*24*60*60;

async function fresh(items:MonitorItem[],bucket:string){
  const out:MonitorItem[]=[];
  for(const item of items)if(await markOnce(`escucha:sent:${bucket}:${item.id}`,DAYS))out.push(item);
  return out;
}

async function deliver(tipo:AlertRun["tipo"],items:MonitorItem[],text:string,by:string){
  const entry:AlertRun={at:new Date().toISOString(),tipo,items:items.length,sent:0,skipped:false,by};
  try{const result=await sendTelegram(text);entry.sent=result.sent;entry.skipped=result.skipped;}
  catch(error){entry.error=error instanceof Error?error.message:"Error de envío";}
  await pushLog(LOG_KEY,entry);
  return entry;
}

/** 🔴 Inmediata: notas rojas nuevas de las últimas 6 horas. */
export async function runRedAlerts(by="automático"){
  const config=await getConfig();
  const {items}=await runMonitor(config,{sinceHours:6});
  const nuevas=await fresh(items.filter(item=>item.level==="rojo"),"rojo");
  if(!nuevas.length)return {tipo:"rojo",items:0};
  return deliver("rojo",nuevas,formatAlert(nuevas.slice(0,8)),by);
}

/** 🟠 Mediodía y 🟢 noche: resumen de lo no enviado en las últimas 24 horas. */
export async function runDigest(tipo:"mediodia"|"noche",by="automático"){
  const config=await getConfig();
  const {items}=await runMonitor(config,{sinceHours:24});
  const level:Semaforo=tipo==="mediodia"?"naranja":"verde";
  const nuevas=await fresh(items.filter(item=>item.level===level),level);
  const title=tipo==="mediodia"?"🟠 RESUMEN DEL MEDIODÍA · ESCUCHA DIGITAL":"🟢 RESUMEN DE LA NOCHE · ESCUCHA DIGITAL";
  return deliver(tipo,nuevas,formatDigest(nuevas,title),by);
}

export async function sendTest(by:string){
  return deliver("prueba",[],"✅ Prueba de Escucha Digital · De POLO a POLO\nEl grupo quedó conectado. Aquí llegarán:\n🔴 alertas inmediatas\n🟠 resumen del mediodía\n🟢 resumen de la noche",by);
}

export const alertLog=()=>readLog<AlertRun>(LOG_KEY,30);
