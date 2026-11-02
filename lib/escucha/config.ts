import {randomUUID} from "node:crypto";
import {getJson,setJson} from "@/lib/escucha/store";

/**
 * Semáforo:
 *  rojo    → alerta inmediata al grupo de Telegram.
 *  naranja → resumen del mediodía.
 *  verde   → resumen de la noche (todo lo que toca Cotopaxi o la campaña).
 * "excluir" descarta notas que contengan el término (ruido).
 * Un término con "+" exige todas sus partes: "Tibán + denuncia".
 */
export type Level="rojo"|"naranja"|"verde"|"excluir";
export type Keyword={id:string;term:string;level:Level;group:string;active:boolean};
export type Platform="web"|"rss"|"youtube"|"facebook"|"instagram"|"tiktok"|"x"|"otra";
export type TrackedAccount={id:string;name:string;platform:Platform;url:string;feedUrl:string;canton:string;active:boolean};
export type EscuchaConfig={keywords:Keyword[];accounts:TrackedAccount[];updatedAt:string;updatedBy:string};

const KEY="escucha:config";

const seed=(term:string,level:Level,group:string):Keyword=>({id:randomUUID(),term,level,group,active:true});

export const DEFAULT_KEYWORDS:Keyword[]=[
  seed("Hipólito Carrera","rojo","Campaña"),
  seed("Polo Carrera","rojo","Campaña"),
  seed("De Polo a Polo + Cotopaxi","rojo","Campaña"),
  seed("Tibán + denuncia","rojo","Lourdes Tibán"),
  seed("Tibán + Contraloría","rojo","Lourdes Tibán"),
  seed("Tibán + Fiscalía","rojo","Lourdes Tibán"),
  seed("Prefectura de Cotopaxi + corrupción","rojo","Prefectura"),
  seed("Tibán","naranja","Lourdes Tibán"),
  seed("prefecta de Cotopaxi","naranja","Lourdes Tibán"),
  seed("Prefectura de Cotopaxi","naranja","Prefectura"),
  seed("seccionales + Cotopaxi","naranja","Elecciones"),
  seed("CNE + Cotopaxi","naranja","Elecciones"),
  seed("Cotopaxi","verde","Territorio"),
  seed("Latacunga","verde","Territorio"),
  seed("Salcedo","verde","Territorio"),
  seed("Pujilí","verde","Territorio"),
  seed("Saquisilí","verde","Territorio"),
  seed("Sigchos","verde","Territorio"),
  seed("Pangua","verde","Territorio"),
  seed("La Maná","verde","Territorio"),
];

export async function getConfig():Promise<EscuchaConfig>{
  const stored=await getJson<EscuchaConfig|null>(KEY,null);
  if(stored)return stored;
  return {keywords:DEFAULT_KEYWORDS,accounts:[],updatedAt:new Date(0).toISOString(),updatedBy:"inicial"};
}

export async function saveConfig(config:EscuchaConfig,by:string){
  const next={...config,updatedAt:new Date().toISOString(),updatedBy:by};
  await setJson(KEY,next);
  return next;
}

/** Feed automático a partir de la URL de una cuenta, cuando la plataforma lo permite. */
export function deriveFeed(platform:Platform,url:string){
  try{
    const parsed=new URL(url);
    if(platform==="rss")return parsed.href;
    if(platform==="youtube"){
      const channel=parsed.pathname.match(/\/channel\/(UC[\w-]{20,})/);
      return channel?`https://www.youtube.com/feeds/videos.xml?channel_id=${channel[1]}`:"";
    }
    if(platform==="web")return parsed.hostname.endsWith("blogspot.com")?`${parsed.origin}/feeds/posts/default?alt=rss`:`${parsed.origin}/feed/`;
  }catch{return "";}
  return "";
}
