import {createHash} from "node:crypto";
import {escuchaSources,HIGH_IMPACT_TERMS,MEDIUM_IMPACT_TERMS,TOPIC_KEYWORDS,type Source,type Topic} from "@/lib/escucha/sources";

export type Impact="alto"|"medio"|"bajo";

export type MonitorItem={
  id:string;
  title:string;
  url:string;
  outlet:string;
  publishedAt:string|null;
  topics:Topic[];
  impact:Impact;
  sourceId:string;
  sourceName:string;
};

export type MonitorResult={
  generatedAt:string;
  items:MonitorItem[];
  sources:{id:string;name:string;ok:boolean;count:number;error?:string}[];
};

const decodeEntities=(value:string)=>value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1")
  .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,"\"").replace(/&#39;|&apos;/g,"'")
  .replace(/&#(\d+);/g,(_,code)=>String.fromCharCode(Number(code)))
  .replace(/&amp;/g,"&")
  .replace(/<[^>]+>/g," ")
  .replace(/\s+/g," ")
  .trim();

const tagValue=(block:string,tag:string)=>{
  const match=block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,"i"));
  return match?decodeEntities(match[1]):"";
};

const linkValue=(block:string)=>{
  const rss=tagValue(block,"link");
  if(rss)return rss;
  const atom=block.match(/<link[^>]*href="([^"]+)"/i);
  return atom?decodeEntities(atom[1]):"";
};

/** Lector RSS/Atom mínimo: suficiente para Google News, Google Alerts, YouTube y la mayoría de medios. */
export function parseFeed(xml:string){
  const blocks=xml.match(/<item[\s\S]*?<\/item>/gi)||xml.match(/<entry[\s\S]*?<\/entry>/gi)||[];
  return blocks.map(block=>{
    let title=tagValue(block,"title");
    let outlet=tagValue(block,"source");
    // Google News añade " - Medio" al final del título.
    if(!outlet){const dash=title.lastIndexOf(" - ");if(dash>20){outlet=title.slice(dash+3);}}
    if(outlet&&title.endsWith(` - ${outlet}`))title=title.slice(0,-(outlet.length+3));
    const date=tagValue(block,"pubDate")||tagValue(block,"published")||tagValue(block,"updated")||tagValue(block,"dc:date");
    const parsed=date?new Date(date):null;
    return {title,url:linkValue(block),outlet,publishedAt:parsed&&!Number.isNaN(parsed.getTime())?parsed.toISOString():null};
  }).filter(item=>item.title&&/^https?:\/\//.test(item.url));
}

const normalize=(value:string)=>value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");

export function classify(title:string,sourceTopic:Topic|null){
  const text=normalize(title);
  const topics=new Set<Topic>();
  if(sourceTopic)topics.add(sourceTopic);
  (Object.keys(TOPIC_KEYWORDS) as Topic[]).forEach(topic=>{
    if(TOPIC_KEYWORDS[topic].some(keyword=>text.includes(normalize(keyword))))topics.add(topic);
  });
  const high=HIGH_IMPACT_TERMS.some(term=>text.includes(normalize(term)));
  const medium=MEDIUM_IMPACT_TERMS.some(term=>text.includes(normalize(term)));
  const sensitive=topics.has("tiban")||topics.has("polo");
  const impact:Impact=high&&(sensitive||topics.has("prefectura")||topics.has("electoral"))?"alto":(high||medium||sensitive)?"medio":"bajo";
  return {topics:[...topics],impact};
}

async function fetchSource(source:Source){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),9000);
  try{
    const response=await fetch(source.url,{signal:controller.signal,headers:{"User-Agent":"Mozilla/5.0 (compatible; EscuchaDigitalDePoloAPolo/1.0)","Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml"},next:{revalidate:600}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const entries=parseFeed(await response.text());
    return {ok:true as const,entries};
  }catch(error){
    return {ok:false as const,entries:[],error:error instanceof Error?error.message:"Error desconocido"};
  }finally{clearTimeout(timer);}
}

const fingerprint=(title:string)=>createHash("sha1").update(normalize(title).replace(/[^a-z0-9]+/g," ").trim().slice(0,90)).digest("hex").slice(0,16);

export async function runMonitor(options:{sinceHours?:number}={}):Promise<MonitorResult>{
  const sinceHours=options.sinceHours??48;
  const cutoff=Date.now()-sinceHours*60*60*1000;
  const sources=escuchaSources();
  const results=await Promise.all(sources.map(async source=>({source,result:await fetchSource(source)})));
  const byId=new Map<string,MonitorItem>();
  for(const {source,result} of results){
    for(const entry of result.entries){
      if(entry.publishedAt&&new Date(entry.publishedAt).getTime()<cutoff)continue;
      const {topics,impact}=classify(entry.title,source.topic);
      // Fuentes extra (medios locales) sin tema: solo se guardan si tocan algún tema monitoreado.
      if(!topics.length)continue;
      const id=fingerprint(entry.title);
      const existing=byId.get(id);
      if(existing){existing.topics=[...new Set([...existing.topics,...topics])];continue;}
      byId.set(id,{id,title:entry.title,url:entry.url,outlet:entry.outlet||source.name,publishedAt:entry.publishedAt,topics,impact,sourceId:source.id,sourceName:source.name});
    }
  }
  const order:Record<Impact,number>={alto:0,medio:1,bajo:2};
  const items=[...byId.values()].sort((a,b)=>order[a.impact]-order[b.impact]||(b.publishedAt||"").localeCompare(a.publishedAt||""));
  return {
    generatedAt:new Date().toISOString(),
    items,
    sources:results.map(({source,result})=>({id:source.id,name:source.name,ok:result.ok,count:result.entries.length,...(result.ok?{}:{error:result.error})})),
  };
}

const ecuadorTime=(iso:string|null)=>iso?new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(iso)):"sin fecha";

/** Texto plano listo para reenviar por WhatsApp o Telegram. */
export function formatDigest(items:MonitorItem[],title:string){
  const date=new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",dateStyle:"full"}).format(new Date());
  const lines=[`ESCUCHA DIGITAL · ${title}`,date,""];
  const alerts=items.filter(item=>item.impact==="alto");
  const rest=items.filter(item=>item.impact!=="alto").slice(0,12);
  lines.push(alerts.length?`🔴 ALERTAS (${alerts.length})`:"🔴 ALERTAS: sin alertas de impacto alto");
  alerts.slice(0,8).forEach(item=>lines.push(`• ${item.title} — ${item.outlet} (${ecuadorTime(item.publishedAt)})`,`  ${item.url}`));
  lines.push("",`OTRAS NOVEDADES (${rest.length})`);
  if(!rest.length)lines.push("Sin novedades verificables en las fuentes monitoreadas.");
  rest.forEach(item=>lines.push(`• [${item.impact}] ${item.title} — ${item.outlet}`,`  ${item.url}`));
  lines.push("","Clasificación automática por palabras clave: verificar cada nota antes de reaccionar o difundir.");
  return lines.join("\n");
}
