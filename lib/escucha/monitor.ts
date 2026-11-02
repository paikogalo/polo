import {createHash} from "node:crypto";
import type {EscuchaConfig,Keyword,Level} from "@/lib/escucha/config";
import {escuchaSources,type Source} from "@/lib/escucha/sources";

export type Semaforo=Exclude<Level,"excluir">;

export type MonitorItem={
  id:string;
  title:string;
  summary:string;
  url:string;
  outlet:string;
  publishedAt:string|null;
  level:Semaforo;
  matches:{term:string;level:Semaforo;group:string}[];
  sourceKind:Source["kind"];
  sourceName:string;
  canton?:string;
};

export type SourceStatus={id:string;name:string;kind:Source["kind"];ok:boolean;count:number;error?:string};
export type MonitorResult={generatedAt:string;items:MonitorItem[];sources:SourceStatus[]};

const decode=(value:string)=>value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1")
  .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,"\"").replace(/&#39;|&apos;/g,"'")
  .replace(/&#(\d+);/g,(_,code)=>String.fromCharCode(Number(code)))
  .replace(/&nbsp;/g," ").replace(/&amp;/g,"&")
  .replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();

const tag=(block:string,name:string)=>{const match=block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`,"i"));return match?decode(match[1]):"";};
const link=(block:string)=>tag(block,"link")||decode(block.match(/<link[^>]*href="([^"]+)"/i)?.[1]||"");

/** Lector RSS/Atom mínimo: Google News, WordPress, Blogger, YouTube y Google Alerts. */
export function parseFeed(xml:string){
  const blocks=xml.match(/<item[\s\S]*?<\/item>/gi)||xml.match(/<entry[\s\S]*?<\/entry>/gi)||[];
  return blocks.map(block=>{
    let title=tag(block,"title");
    let outlet=tag(block,"source");
    if(!outlet){const dash=title.lastIndexOf(" - ");if(dash>20&&title.length-dash<45)outlet=title.slice(dash+3);}
    if(outlet&&title.endsWith(` - ${outlet}`))title=title.slice(0,-(outlet.length+3));
    const summary=(tag(block,"description")||tag(block,"summary")||tag(block,"media:description")).slice(0,320);
    const date=tag(block,"pubDate")||tag(block,"published")||tag(block,"updated")||tag(block,"dc:date");
    const parsed=date?new Date(date):null;
    return {title,summary,url:link(block),outlet,publishedAt:parsed&&!Number.isNaN(parsed.getTime())?parsed.toISOString():null};
  }).filter(item=>item.title&&/^https?:\/\//.test(item.url));
}

export const normalize=(value:string)=>value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const escape=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const contains=(text:string,part:string)=>new RegExp(`(^|[^a-z0-9])${escape(normalize(part))}([^a-z0-9]|$)`).test(text);

export const keywordMatches=(text:string,keyword:Keyword)=>keyword.term.split("+").map(part=>part.trim()).filter(Boolean).every(part=>contains(text,part));

const ORDER:Record<Semaforo,number>={rojo:0,naranja:1,verde:2};

export function classify(title:string,summary:string,keywords:Keyword[]){
  const text=normalize(`${title} ${summary}`);
  const active=keywords.filter(keyword=>keyword.active);
  if(active.some(keyword=>keyword.level==="excluir"&&keywordMatches(text,keyword)))return null;
  const matches=active.filter(keyword=>keyword.level!=="excluir"&&keywordMatches(text,keyword)).map(keyword=>({term:keyword.term,level:keyword.level as Semaforo,group:keyword.group}));
  if(!matches.length)return null;
  matches.sort((a,b)=>ORDER[a.level]-ORDER[b.level]);
  return {level:matches[0].level,matches};
}

async function fetchSource(source:Source){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),9000);
  try{
    const response=await fetch(source.url,{signal:controller.signal,headers:{"User-Agent":"Mozilla/5.0 (compatible; EscuchaDigitalDePoloAPolo/1.0)","Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml"},next:{revalidate:600}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const text=await response.text();
    if(!/<(rss|feed|rdf)/i.test(text.slice(0,2000)))throw new Error("No publica RSS");
    return {ok:true as const,entries:parseFeed(text)};
  }catch(error){
    const message=error instanceof Error?(error.name==="AbortError"?"Tiempo agotado":error.message):"Error";
    return {ok:false as const,entries:[],error:message};
  }finally{clearTimeout(timer);}
}

const fingerprint=(title:string)=>createHash("sha1").update(normalize(title).replace(/[^a-z0-9]+/g," ").trim().slice(0,90)).digest("hex").slice(0,16);

export async function runMonitor(config:EscuchaConfig,options:{sinceHours?:number}={}):Promise<MonitorResult>{
  const cutoff=Date.now()-(options.sinceHours??48)*60*60*1000;
  const sources=escuchaSources(config);
  const results=await Promise.all(sources.map(async source=>({source,result:await fetchSource(source)})));
  const byId=new Map<string,MonitorItem>();
  for(const {source,result} of results){
    for(const entry of result.entries){
      if(entry.publishedAt&&new Date(entry.publishedAt).getTime()<cutoff)continue;
      const verdict=classify(entry.title,entry.summary,config.keywords);
      if(!verdict)continue;
      const id=fingerprint(entry.title);
      if(byId.has(id))continue;
      byId.set(id,{id,title:entry.title,summary:entry.summary.startsWith(entry.title)?"":entry.summary,url:entry.url,outlet:entry.outlet||source.name,publishedAt:entry.publishedAt,level:verdict.level,matches:verdict.matches,sourceKind:source.kind,sourceName:source.name,canton:source.canton});
    }
  }
  const items=[...byId.values()].sort((a,b)=>ORDER[a.level]-ORDER[b.level]||(b.publishedAt||"").localeCompare(a.publishedAt||""));
  return {
    generatedAt:new Date().toISOString(),
    items,
    sources:results.map(({source,result})=>({id:source.id,name:source.name,kind:source.kind,ok:result.ok,count:result.entries.length,...(result.ok?{}:{error:result.error})})),
  };
}

const hour=(iso:string|null)=>iso?new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(iso)):"sin fecha";
const DOT:Record<Semaforo,string>={rojo:"🔴",naranja:"🟠",verde:"🟢"};

export function formatAlert(items:MonitorItem[]){
  return ["🔴 ALERTA · ESCUCHA DIGITAL",...items.flatMap(item=>["",`${item.title}`,`Medio: ${item.outlet} · ${hour(item.publishedAt)}`,`Coincide: ${item.matches.map(match=>match.term).join(", ")}`,item.url])].join("\n");
}

export function formatDigest(items:MonitorItem[],title:string,max=25){
  const date=new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",dateStyle:"full"}).format(new Date());
  const lines=[`${title}`,date,""];
  if(!items.length)lines.push("Sin novedades en las fuentes monitoreadas.");
  const groups=new Map<string,MonitorItem[]>();
  items.slice(0,max).forEach(item=>{const key=item.matches[0]?.group||"Otros";groups.set(key,[...(groups.get(key)||[]),item]);});
  for(const [group,list] of groups){
    lines.push(`▪️ ${group.toUpperCase()} (${list.length})`);
    list.forEach(item=>lines.push(`${DOT[item.level]} ${item.title} — ${item.outlet}`,`   ${item.url}`));
    lines.push("");
  }
  if(items.length>max)lines.push(`… y ${items.length-max} notas más en el panel.`);
  lines.push("Clasificación automática por palabras clave. Verificar antes de reaccionar o difundir.");
  return lines.join("\n");
}
