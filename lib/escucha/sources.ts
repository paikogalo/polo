import medios from "@/lib/escucha/medios-cotopaxi.json";
import type {EscuchaConfig} from "@/lib/escucha/config";

/**
 * Fuentes del monitor. Todas son gratuitas y públicas:
 *  - Google News RSS (edición Ecuador), con consultas armadas desde las palabras clave rojas y naranjas.
 *  - RSS de los sitios web del directorio de medios de Cotopaxi.
 *  - Feeds de las cuentas agregadas en el panel (web, RSS, canales de YouTube).
 *  - ESCUCHA_EXTRA_FEEDS: "Nombre|https://feed,Nombre 2|https://feed" (por ejemplo, Google Alerts en RSS).
 */

export type Source={id:string;name:string;url:string;kind:"buscador"|"medio"|"cuenta"|"extra";canton?:string};

export type MedioCotopaxi={id:string;name:string;canton:string;category:string;profiles:{platform:string;url:string}[]};
export const MEDIOS_COTOPAXI=medios as MedioCotopaxi[];

const googleNews=(query:string)=>{
  const params=new URLSearchParams({q:`${query} when:7d`,hl:"es-419",gl:"EC",ceid:"EC:es-419"});
  return `https://news.google.com/rss/search?${params.toString()}`;
};

const asQuery=(term:string)=>term.split("+").map(part=>part.trim()).filter(Boolean).map(part=>part.includes(" ")?`"${part}"`:part).join(" ");

/** Sitios sin RSS conocido (portales institucionales, Wix, páginas sueltas). */
const NO_FEED=/wixsite\.com|gob\.ec|utc\.edu\.ec|radio12345\.com|\/portfolio\//i;

function localMediaFeeds():Source[]{
  const seen=new Set<string>();
  const feeds:Source[]=[];
  for(const medio of MEDIOS_COTOPAXI){
    for(const profile of medio.profiles){
      if(profile.platform!=="WEB"||NO_FEED.test(profile.url))continue;
      let origin:URL;
      try{origin=new URL(new URL(profile.url.replace(/^http:/,"https:")).origin);}catch{continue;}
      if(seen.has(origin.href))continue;
      seen.add(origin.href);
      const feed=origin.hostname.endsWith("blogspot.com")?`${origin.origin}/feeds/posts/default?alt=rss`:`${origin.origin}/feed/`;
      feeds.push({id:`medio-${medio.id}`,name:medio.name,url:feed,kind:"medio",canton:medio.canton});
    }
  }
  return feeds;
}

export function escuchaSources(config:EscuchaConfig):Source[]{
  const active=config.keywords.filter(keyword=>keyword.active);
  const priority=active.filter(keyword=>keyword.level==="rojo"||keyword.level==="naranja").map(keyword=>asQuery(keyword.term));
  // Una búsqueda por palabra clave (Google News no responde bien a consultas OR largas). Máximo 25.
  const queries:Source[]=[...new Set(priority)].slice(0,25).map((term,index)=>({id:`gn-${index+1}`,name:`Google News · ${term.replace(/"/g,"")}`,url:googleNews(term),kind:"buscador" as const}));
  queries.push({id:"gn-territorio",name:"Google News · Cotopaxi",url:googleNews("Cotopaxi (Latacunga OR Salcedo OR Pujilí OR Saquisilí OR Sigchos OR Pangua OR \"La Maná\" OR prefectura)"),kind:"buscador"});

  const accounts=config.accounts.filter(account=>account.active&&account.feedUrl).map(account=>({id:`cuenta-${account.id}`,name:account.name,url:account.feedUrl,kind:"cuenta" as const,canton:account.canton}));

  const extra=(process.env.ESCUCHA_EXTRA_FEEDS||"").split(",").map(entry=>entry.trim()).filter(Boolean).map((entry,index)=>{
    const [name,url]=entry.includes("|")?entry.split("|"):[`Fuente ${index+1}`,entry];
    return {id:`extra-${index+1}`,name:name.trim(),url:url.trim(),kind:"extra" as const};
  }).filter(source=>/^https:\/\//.test(source.url));

  return [...queries,...localMediaFeeds(),...accounts,...extra];
}
