import medios from "@/lib/escucha/medios-cotopaxi.json";

/**
 * Fuentes del monitor de Escucha Digital. Todas son gratuitas y públicas.
 *
 * - Búsquedas de Google News (RSS por consulta, edición Ecuador).
 * - Fuentes adicionales por variable de entorno ESCUCHA_EXTRA_FEEDS, con el formato
 *   "Nombre|https://url-del-feed-rss,Nombre 2|https://..." — aquí se cargan los RSS
 *   de medios de Cotopaxi, alertas de Google Alerts/Talkwalker (salida RSS) y canales
 *   de YouTube (https://www.youtube.com/feeds/videos.xml?channel_id=ID).
 *
 * - RSS públicos de los sitios web del directorio de medios de Cotopaxi.
 */

export type Topic="tiban"|"polo"|"prefectura"|"electoral"|"territorio";

export type Source={id:string;name:string;url:string;topic:Topic|null};

export const TOPIC_LABELS:Record<Topic,string>={
  tiban:"Lourdes Tibán",
  polo:"Campaña Polo",
  prefectura:"Prefectura de Cotopaxi",
  electoral:"CNE y elecciones",
  territorio:"Territorio Cotopaxi",
};

const googleNews=(query:string)=>{
  const params=new URLSearchParams({q:`${query} when:2d`,hl:"es-419",gl:"EC",ceid:"EC:es-419"});
  return `https://news.google.com/rss/search?${params.toString()}`;
};

const QUERIES:{id:string;name:string;query:string;topic:Topic}[]=[
  {id:"gn-tiban",name:"Google News · Lourdes Tibán",query:"\"Lourdes Tibán\" OR \"Lourdes Tiban\"",topic:"tiban"},
  {id:"gn-polo",name:"Google News · Hipólito Carrera",query:"\"Hipólito Carrera\" OR \"Polo Carrera\" OR \"De Polo a Polo\"",topic:"polo"},
  {id:"gn-prefectura",name:"Google News · Prefectura de Cotopaxi",query:"\"Prefectura de Cotopaxi\" OR \"prefecta de Cotopaxi\" OR \"GAD de Cotopaxi\"",topic:"prefectura"},
  {id:"gn-electoral",name:"Google News · Seccionales Cotopaxi",query:"Cotopaxi (seccionales OR CNE OR candidatos OR prefectura) 2027",topic:"electoral"},
  {id:"gn-territorio",name:"Google News · Cotopaxi",query:"Cotopaxi (Latacunga OR Salcedo OR Pujilí OR Saquisilí OR Sigchos OR Pangua OR \"La Maná\")",topic:"territorio"},
];

/** Directorio Cotopaxi (71 medios, sin datos de contacto). Fuente: base exportada desde Codex, 2 nov 2026. */
export type MedioCotopaxi={id:string;name:string;canton:string;category:string;profiles:{platform:string;url:string}[]};
export const MEDIOS_COTOPAXI=medios as MedioCotopaxi[];

/** Sitios sin RSS conocido (portales institucionales, Wix, páginas de un solo artículo). */
const NO_FEED=/wixsite\.com|gob\.ec|utc\.edu\.ec|radio12345\.com|\/portfolio\//i;

function localMediaFeeds():Source[]{
  const seen=new Set<string>();
  const feeds:Source[]=[];
  for(const medio of MEDIOS_COTOPAXI){
    for(const profile of medio.profiles){
      if(profile.platform!=="WEB"||NO_FEED.test(profile.url))continue;
      let origin:string;
      try{origin=new URL(profile.url.replace(/^http:/,"https:")).origin;}catch{continue;}
      if(seen.has(origin))continue;
      seen.add(origin);
      const feed=/blogspot\.com$/.test(new URL(origin).hostname)?`${origin}/feeds/posts/default?alt=rss`:`${origin}/feed/`;
      feeds.push({id:`medio-${medio.id}`,name:`${medio.name} (${medio.canton})`,url:feed,topic:null});
    }
  }
  return feeds;
}

export function escuchaSources():Source[]{
  const base=[...QUERIES.map(item=>({id:item.id,name:item.name,url:googleNews(item.query),topic:item.topic})),...localMediaFeeds()];
  const extra=(process.env.ESCUCHA_EXTRA_FEEDS||"")
    .split(",")
    .map(entry=>entry.trim())
    .filter(Boolean)
    .map((entry,index)=>{
      const [name,url]=entry.includes("|")?entry.split("|"):[`Fuente ${index+1}`,entry];
      return {id:`extra-${index+1}`,name:name.trim(),url:url.trim(),topic:null};
    })
    .filter(source=>/^https:\/\//.test(source.url));
  return [...base,...extra];
}

/** Palabras clave para clasificar cada nota por tema. */
export const TOPIC_KEYWORDS:Record<Topic,string[]>={
  tiban:["tibán","tiban"],
  polo:["hipólito carrera","hipolito carrera","polo carrera","de polo a polo","avanzamos"],
  prefectura:["prefectura de cotopaxi","prefecta","gad provincial","gobierno provincial de cotopaxi","consejo provincial"],
  electoral:["cne","seccionales","candidat","elecciones","inscripción","campaña electoral","tce"],
  territorio:["latacunga","salcedo","pujilí","pujili","saquisilí","saquisili","sigchos","pangua","la maná","la mana","cotopaxi"],
};

/** Términos que elevan el impacto de una nota (requieren atención del equipo). */
export const HIGH_IMPACT_TERMS=["denuncia","fiscalía","fiscalia","contraloría","contraloria","corrupción","corrupcion","peculado","juicio","sentencia","allanamiento","destitución","destitucion","escándalo","escandalo","violencia política","violencia politica","encuesta","sondeo","impugna","tce","renuncia","alianza","candidatura"];
export const MEDIUM_IMPACT_TERMS=["obra","vía","via","contrato","presupuesto","entrevista","declaró","declaro","critica","cuestiona","responde","protesta","paro","volcán","volcan","emergencia"];
