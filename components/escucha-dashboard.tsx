"use client";
import {AlertTriangle,Bell,Check,Copy,ExternalLink,KeyRound,LayoutDashboard,ListFilter,LogOut,Newspaper,Plus,Power,Radio,RefreshCw,Search,Send,Trash2,Users} from "lucide-react";
import {useCallback,useEffect,useMemo,useState} from "react";
import type {AlertRun} from "@/lib/escucha/alerts";
import type {EscuchaUser} from "@/lib/escucha/auth";
import type {EscuchaConfig,Keyword,Level,Platform} from "@/lib/escucha/config";
import type {MonitorItem,MonitorResult,Semaforo} from "@/lib/escucha/monitor";
import {MEDIOS_COTOPAXI} from "@/lib/escucha/sources";

type ConfigResponse={user:EscuchaUser;config:EscuchaConfig;log:AlertRun[];telegram:{token:boolean;chat:{id:string;title:string}|null};persistent:boolean;users:EscuchaUser[]};
type Tab="resumen"|"menciones"|"palabras"|"cuentas"|"alertas"|"usuarios";

const LEVELS:Record<Level,{label:string;dot:string;chip:string;border:string;when:string}>={
  rojo:{label:"Rojo",dot:"bg-coral",chip:"bg-coral text-white",border:"border-l-coral",when:"Alerta inmediata a Telegram"},
  naranja:{label:"Naranja",dot:"bg-yellow",chip:"bg-yellow text-deep",border:"border-l-yellow",when:"Resumen del mediodía"},
  verde:{label:"Verde",dot:"bg-ocean",chip:"bg-ocean text-white",border:"border-l-ocean",when:"Resumen de la noche"},
  excluir:{label:"Excluir",dot:"bg-navy/40",chip:"bg-navy/10 text-navy",border:"border-l-navy/30",when:"Descarta la nota (ruido)"},
};
const PLATFORMS:Record<Platform,string>={web:"Sitio web",rss:"Feed RSS",youtube:"YouTube",facebook:"Facebook",instagram:"Instagram",tiktok:"TikTok",x:"X",otra:"Otra"};
const RANGES=[{hours:12,label:"12 h"},{hours:24,label:"24 h"},{hours:48,label:"48 h"},{hours:168,label:"7 días"}];
const time=(iso:string|null|undefined)=>iso?new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(iso)):"Sin fecha";

async function post<T>(url:string,body:unknown):Promise<T>{
  const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await response.json().catch(()=>({error:"Respuesta no válida."}));
  if(!response.ok)throw new Error(data.error||"No se pudo completar.");
  return data as T;
}

function Dot({level}:{level:Level}){return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${LEVELS[level].dot}`} aria-hidden="true"/>;}
function Card({children,className=""}:{children:React.ReactNode;className?:string}){return <section className={`rounded-3xl bg-white p-4 shadow-soft sm:p-5 ${className}`}>{children}</section>;}
function Title({icon,children,hint}:{icon:React.ReactNode;children:React.ReactNode;hint?:string}){return <div className="mb-4"><h2 className="flex items-center gap-2 text-lg font-black text-deep"><span className="text-ocean">{icon}</span>{children}</h2>{hint?<p className="mt-1 text-sm text-navy/60">{hint}</p>:null}</div>;}
function Button({children,tone="primary",...props}:React.ButtonHTMLAttributes<HTMLButtonElement>&{tone?:"primary"|"soft"|"danger"|"ghost"}){
  const tones={primary:"bg-coral text-white hover:bg-coralDark",soft:"bg-mist text-deep hover:bg-ocean hover:text-white",danger:"bg-red-50 text-coralDark hover:bg-coral hover:text-white",ghost:"bg-sand text-navy hover:bg-navy/10"};
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition disabled:opacity-50 ${tones[tone]} ${props.className||""}`}>{children}</button>;
}

function MentionCard({item}:{item:MonitorItem}){
  const share=`${item.title} — ${item.outlet}\n${item.url}`;
  return <article className={`rounded-2xl border-l-[6px] bg-white p-4 shadow-soft ${LEVELS[item.level].border}`}>
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={`chip ${LEVELS[item.level].chip}`}>{item.level==="rojo"?<AlertTriangle size={12} className="mr-1" aria-hidden="true"/>:null}{LEVELS[item.level].label}</span>
      {item.matches.slice(0,4).map(match=><span key={match.term} className="chip bg-sand text-navy/80">{match.term}</span>)}
      <span className="ml-auto text-navy/50">{time(item.publishedAt)}</span>
    </div>
    <h3 className="mt-2 font-extrabold leading-snug text-deep">{item.title}</h3>
    {item.summary?<p className="mt-1 line-clamp-2 text-sm text-navy/65">{item.summary}</p>:null}
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className="font-bold text-navy/60">{item.outlet}{item.canton?` · ${item.canton}`:""} · {item.sourceKind==="medio"?"Medio de Cotopaxi":item.sourceKind==="cuenta"?"Cuenta seguida":"Buscador"}</span>
      <span className="flex gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noreferrer" className="chip bg-[#25D366] text-white">WhatsApp</a>
        <a href={item.url} target="_blank" rel="noreferrer" className="chip bg-mist text-oceanDark">Abrir nota <ExternalLink size={12} className="ml-1" aria-hidden="true"/></a>
      </span>
    </div>
  </article>;
}

export function EscuchaDashboard({onLogout}:{email:string;onLogout:()=>void}){
  const [tab,setTab]=useState<Tab>("resumen");
  const [settings,setSettings]=useState<ConfigResponse|null>(null);
  const [feed,setFeed]=useState<MonitorResult|null>(null);
  const [loading,setLoading]=useState(true);
  const [hours,setHours]=useState(48);
  const [notice,setNotice]=useState<{text:string;error?:boolean}|null>(null);

  const flash=(text:string,error=false)=>{setNotice({text,error});setTimeout(()=>setNotice(null),4000);};

  const loadSettings=useCallback(async()=>{
    const response=await fetch("/api/escucha/config",{cache:"no-store"});
    if(response.status===401){onLogout();return;}
    setSettings(await response.json());
  },[onLogout]);

  const loadFeed=useCallback(async(range:number)=>{
    setLoading(true);
    try{
      const response=await fetch(`/api/escucha/feed?horas=${range}`,{cache:"no-store"});
      if(response.status===401){onLogout();return;}
      if(!response.ok)throw new Error();
      setFeed(await response.json());
    }catch{flash("No se pudo actualizar el monitor.",true);}
    finally{setLoading(false);}
  },[onLogout]);

  useEffect(()=>{loadSettings();},[loadSettings]);
  useEffect(()=>{loadFeed(hours);},[hours,loadFeed]);
  useEffect(()=>{const timer=setInterval(()=>loadFeed(hours),10*60*1000);return()=>clearInterval(timer);},[hours,loadFeed]);

  const items=useMemo(()=>feed?.items||[],[feed]);
  const counts=useMemo(()=>({rojo:items.filter(i=>i.level==="rojo").length,naranja:items.filter(i=>i.level==="naranja").length,verde:items.filter(i=>i.level==="verde").length}),[items]);
  const isAdmin=settings?.user.role==="admin";
  const tabs:{id:Tab;label:string;icon:React.ReactNode}[]=[
    {id:"resumen",label:"Resumen",icon:<LayoutDashboard size={18}/>},
    {id:"menciones",label:"Menciones",icon:<Newspaper size={18}/>},
    {id:"palabras",label:"Palabras clave",icon:<KeyRound size={18}/>},
    {id:"cuentas",label:"Cuentas y medios",icon:<Radio size={18}/>},
    {id:"alertas",label:"Alertas Telegram",icon:<Bell size={18}/>},
    ...(isAdmin?[{id:"usuarios" as Tab,label:"Usuarios",icon:<Users size={18}/>}]:[]),
  ];
  const updateConfig=(config:EscuchaConfig)=>{setSettings(current=>current?{...current,config}:current);loadFeed(hours);};

  return <main className="min-h-screen bg-sand pb-20">
    <header className="brand-gradient text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20"><Radio aria-hidden="true"/></span>
          <div><p className="text-[11px] font-extrabold uppercase tracking-widest text-white/80">De POLO a POLO</p><h1 className="text-xl font-black leading-tight">Escucha digital</h1></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-right text-xs sm:block"><b className="block">{settings?.user.name||"…"}</b><span className="text-white/75">{settings?.user.role==="admin"?"Administrador":"Analista"}</span></span>
          <Button tone="ghost" className="!bg-white/15 !text-white" onClick={()=>loadFeed(hours)} disabled={loading} aria-label="Actualizar"><RefreshCw size={16} className={loading?"animate-spin":""} aria-hidden="true"/><span className="hidden sm:inline">Actualizar</span></Button>
          <Button tone="ghost" className="!bg-white/15 !text-white" onClick={onLogout} aria-label="Salir"><LogOut size={16} aria-hidden="true"/><span className="hidden sm:inline">Salir</span></Button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3" aria-label="Secciones">
        {tabs.map(item=><button key={item.id} onClick={()=>setTab(item.id)} aria-current={tab===item.id?"page":undefined} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${tab===item.id?"bg-white text-deep":"text-white/85 hover:bg-white/15"}`}>{item.icon}{item.label}</button>)}
      </nav>
    </header>

    <div className="mx-auto max-w-7xl space-y-5 px-4 pt-5">
      {settings&&!settings.persistent?<p className="rounded-2xl bg-yellow/20 p-3 text-sm text-navy"><b>Modo prueba:</b> los cambios se guardan solo en memoria y pueden perderse. En producción se activa el almacenamiento permanente.</p>:null}
      {notice?<p role="status" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-bold shadow-2xl ${notice.error?"bg-coral text-white":"bg-deep text-white"}`}>{notice.text}</p>:null}

      {tab==="resumen"?<Resumen items={items} counts={counts} loading={loading&&!feed} settings={settings} feed={feed} go={setTab}/>:null}
      {tab==="menciones"?<Menciones items={items} hours={hours} setHours={setHours} loading={loading}/>:null}
      {tab==="palabras"&&settings?<Palabras config={settings.config} onSaved={updateConfig} flash={flash}/>:null}
      {tab==="cuentas"&&settings?<Cuentas config={settings.config} feed={feed} onSaved={updateConfig} flash={flash}/>:null}
      {tab==="alertas"&&settings?<Alertas settings={settings} isAdmin={Boolean(isAdmin)} reload={loadSettings} flash={flash}/>:null}
      {tab==="usuarios"&&settings&&isAdmin?<Usuarios users={settings.users} me={settings.user.email} onChange={users=>setSettings({...settings,users})} flash={flash}/>:null}
    </div>
  </main>;
}

function Resumen({items,counts,loading,settings,feed,go}:{items:MonitorItem[];counts:Record<Semaforo,number>;loading:boolean;settings:ConfigResponse|null;feed:MonitorResult|null;go:(tab:Tab)=>void}){
  const outlets=useMemo(()=>{const map=new Map<string,number>();items.forEach(item=>map.set(item.outlet,(map.get(item.outlet)||0)+1));return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6);},[items]);
  const terms=useMemo(()=>{const map=new Map<string,{n:number;level:Semaforo}>();items.forEach(item=>item.matches.forEach(match=>map.set(match.term,{n:(map.get(match.term)?.n||0)+1,level:match.level})));return [...map.entries()].sort((a,b)=>b[1].n-a[1].n).slice(0,8);},[items]);
  const ok=feed?.sources.filter(source=>source.ok).length||0;
  return <>
    <div className="grid gap-3 md:grid-cols-3">
      {(["rojo","naranja","verde"] as Semaforo[]).map(level=><button key={level} onClick={()=>go("menciones")} className={`rounded-3xl border-l-[8px] bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 ${LEVELS[level].border}`}>
        <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-extrabold text-navy"><Dot level={level}/>{LEVELS[level].label}</span><span className="text-xs text-navy/50">48 h</span></div>
        <p className="mt-2 text-4xl font-black text-deep">{loading?"–":counts[level]}</p>
        <p className="mt-1 text-xs font-bold text-navy/60">{LEVELS[level].when}</p>
      </button>)}
    </div>
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <Title icon={<AlertTriangle size={18}/>} hint="Lo último que exige reacción del equipo.">Alertas rojas recientes</Title>
        <div className="space-y-3">{items.filter(item=>item.level==="rojo").slice(0,4).map(item=><MentionCard key={item.id} item={item}/>)}
          {!loading&&!counts.rojo?<p className="rounded-2xl bg-sand p-4 text-center text-sm text-navy/60">Sin alertas rojas en las últimas 48 horas.</p>:null}</div>
      </Card>
      <div className="space-y-5">
        <Card>
          <Title icon={<Newspaper size={18}/>}>Medios con más notas</Title>
          <ul className="space-y-2 text-sm">{outlets.map(([name,n])=><li key={name} className="flex items-center gap-2"><span className="flex-1 truncate font-bold text-deep">{name}</span><span className="h-2 rounded-full bg-ocean" style={{width:`${Math.max(12,n*14)}px`}} aria-hidden="true"/><span className="w-6 text-right font-black text-navy">{n}</span></li>)}
            {!outlets.length?<li className="text-navy/50">Aún sin datos.</li>:null}</ul>
        </Card>
        <Card>
          <Title icon={<KeyRound size={18}/>}>Palabras que más suenan</Title>
          <div className="flex flex-wrap gap-2">{terms.map(([term,info])=><span key={term} className="chip gap-1 bg-sand text-navy"><Dot level={info.level}/>{term} · {info.n}</span>)}{!terms.length?<span className="text-sm text-navy/50">Aún sin coincidencias.</span>:null}</div>
        </Card>
        <Card>
          <Title icon={<Bell size={18}/>}>Estado del sistema</Title>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Fuentes leídas</span><b>{ok} / {feed?.sources.length||0}</b></li>
            <li className="flex justify-between"><span>Palabras clave activas</span><b>{settings?.config.keywords.filter(k=>k.active).length||0}</b></li>
            <li className="flex justify-between"><span>Grupo de Telegram</span><b className={settings?.telegram.chat&&settings.telegram.token?"text-oceanDark":"text-coral"}>{settings?.telegram.chat&&settings.telegram.token?"Conectado":"Pendiente"}</b></li>
            <li className="flex justify-between"><span>Última actualización</span><b>{time(feed?.generatedAt)}</b></li>
          </ul>
        </Card>
      </div>
    </div>
  </>;
}

function Menciones({items,hours,setHours,loading}:{items:MonitorItem[];hours:number;setHours:(h:number)=>void;loading:boolean}){
  const [level,setLevel]=useState<Semaforo|"todos">("todos");
  const [kind,setKind]=useState<"todos"|"medio"|"buscador"|"cuenta">("todos");
  const [query,setQuery]=useState("");
  const [copied,setCopied]=useState(false);
  const filtered=items.filter(item=>(level==="todos"||item.level===level)&&(kind==="todos"||item.sourceKind===kind)&&(!query||`${item.title} ${item.outlet}`.toLowerCase().includes(query.toLowerCase())));
  const digest=["ESCUCHA DIGITAL · De POLO a POLO",...filtered.slice(0,15).map(item=>`${item.level==="rojo"?"🔴":item.level==="naranja"?"🟠":"🟢"} ${item.title} — ${item.outlet}\n${item.url}`)].join("\n\n");
  const copy=async()=>{await navigator.clipboard.writeText(digest);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return <>
    <Card>
      <div className="flex flex-col gap-3">
        <label className="relative block"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" aria-hidden="true"/><span className="sr-only">Buscar</span><input className="field pl-10" placeholder="Buscar en títulos y medios…" value={query} onChange={event=>setQuery(event.target.value)}/></label>
        <div className="flex flex-wrap items-center gap-2"><ListFilter size={16} className="text-navy/40" aria-hidden="true"/>
          <button onClick={()=>setLevel("todos")} aria-pressed={level==="todos"} className={`chip ${level==="todos"?"bg-deep text-white":"bg-sand text-navy"}`}>Todo ({items.length})</button>
          {(["rojo","naranja","verde"] as Semaforo[]).map(key=><button key={key} onClick={()=>setLevel(key)} aria-pressed={level===key} className={`chip gap-1 ${level===key?LEVELS[key].chip:"bg-sand text-navy"}`}><Dot level={key}/>{LEVELS[key].label} ({items.filter(i=>i.level===key).length})</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map(range=><button key={range.hours} onClick={()=>setHours(range.hours)} aria-pressed={hours===range.hours} className={`chip ${hours===range.hours?"bg-ocean text-white":"bg-sand text-navy"}`}>{range.label}</button>)}
          <span className="mx-1 h-5 w-px bg-navy/10" aria-hidden="true"/>
          {([["todos","Todas las fuentes"],["medio","Medios de Cotopaxi"],["buscador","Buscadores"],["cuenta","Cuentas seguidas"]] as const).map(([key,label])=><button key={key} onClick={()=>setKind(key)} aria-pressed={kind===key} className={`chip ${kind===key?"bg-purple text-white":"bg-sand text-navy"}`}>{label}</button>)}
          <span className="ml-auto flex gap-2">
            <Button tone="ghost" onClick={copy}>{copied?<Check size={14}/>:<Copy size={14}/>}{copied?"Copiado":"Copiar resumen"}</Button>
            <a href={`https://wa.me/?text=${encodeURIComponent(digest)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-extrabold text-white"><Send size={14} aria-hidden="true"/>WhatsApp</a>
          </span>
        </div>
      </div>
    </Card>
    <div className="space-y-3" aria-busy={loading}>
      {loading&&!items.length?Array.from({length:4}).map((_,index)=><div key={index} className="h-28 animate-pulse rounded-2xl bg-white"/>):null}
      {!loading&&!filtered.length?<Card><p className="text-center text-sm text-navy/60">Sin menciones con este filtro.</p></Card>:null}
      {filtered.map(item=><MentionCard key={item.id} item={item}/>)}
    </div>
  </>;
}

function Palabras({config,onSaved,flash}:{config:EscuchaConfig;onSaved:(c:EscuchaConfig)=>void;flash:(t:string,e?:boolean)=>void}){
  const [term,setTerm]=useState("");
  const [level,setLevel]=useState<Level>("naranja");
  const [group,setGroup]=useState("General");
  const [busy,setBusy]=useState(false);
  const groups=[...new Set(config.keywords.map(keyword=>keyword.group))];
  const act=async(body:Record<string,unknown>,message:string)=>{
    setBusy(true);
    try{const data=await post<{config:EscuchaConfig}>("/api/escucha/keywords",body);onSaved(data.config);flash(message);}
    catch(error){flash(error instanceof Error?error.message:"Error",true);}
    finally{setBusy(false);}
  };
  const add=async(event:React.FormEvent)=>{event.preventDefault();await act({action:"add",term,level,group},"Palabra clave agregada.");setTerm("");};
  return <>
    <Card>
      <Title icon={<Plus size={18}/>} hint={`Usa “+” para exigir varias palabras a la vez. Ejemplo: Tibán + denuncia.`}>Agregar palabra clave</Title>
      <form onSubmit={add} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
        <label><span className="label">Palabra o frase</span><input className="field" required minLength={2} maxLength={80} value={term} onChange={event=>setTerm(event.target.value)} placeholder="Ej.: vía Angamarca"/></label>
        <label><span className="label">Grupo</span><input className="field" list="grupos" maxLength={40} value={group} onChange={event=>setGroup(event.target.value)}/><datalist id="grupos">{groups.map(item=><option key={item} value={item}/>)}</datalist></label>
        <fieldset><legend className="label">Semáforo</legend><div className="flex flex-wrap gap-1">{(Object.keys(LEVELS) as Level[]).map(key=><button type="button" key={key} onClick={()=>setLevel(key)} aria-pressed={level===key} className={`chip gap-1 ${level===key?LEVELS[key].chip:"bg-sand text-navy"}`}><Dot level={key}/>{LEVELS[key].label}</button>)}</div></fieldset>
        <div className="flex items-end"><Button type="submit" disabled={busy} className="w-full"><Plus size={16}/>Agregar</Button></div>
      </form>
      <p className="mt-3 text-xs text-navy/55">{LEVELS[level].label}: {LEVELS[level].when}.</p>
    </Card>
    <div className="grid gap-5 lg:grid-cols-2">
      {(Object.keys(LEVELS) as Level[]).map(key=>{const list=config.keywords.filter(keyword=>keyword.level===key);return <Card key={key} className={`border-l-[8px] ${LEVELS[key].border}`}>
        <Title icon={<Dot level={key}/>} hint={LEVELS[key].when}>{LEVELS[key].label} ({list.length})</Title>
        <ul className="divide-y divide-navy/10">{list.map(keyword=><KeywordRow key={keyword.id} keyword={keyword} busy={busy} act={act}/>)}{!list.length?<li className="py-2 text-sm text-navy/50">Sin palabras en este nivel.</li>:null}</ul>
      </Card>;})}
    </div>
  </>;
}

function KeywordRow({keyword,busy,act}:{keyword:Keyword;busy:boolean;act:(body:Record<string,unknown>,message:string)=>void}){
  return <li className="flex flex-wrap items-center gap-2 py-2">
    <span className={`flex-1 font-bold ${keyword.active?"text-deep":"text-navy/40 line-through"}`}>{keyword.term}<span className="ml-2 text-xs font-normal text-navy/50">{keyword.group}</span></span>
    <label className="sr-only" htmlFor={`nivel-${keyword.id}`}>Nivel</label>
    <select id={`nivel-${keyword.id}`} disabled={busy} value={keyword.level} onChange={event=>act({action:"update",id:keyword.id,level:event.target.value},"Nivel actualizado.")} className="rounded-full border border-navy/15 bg-white px-2 py-1 text-xs font-bold text-navy">{(Object.keys(LEVELS) as Level[]).map(key=><option key={key} value={key}>{LEVELS[key].label}</option>)}</select>
    <button disabled={busy} onClick={()=>act({action:"update",id:keyword.id,active:!keyword.active},keyword.active?"Palabra pausada.":"Palabra activada.")} aria-label={keyword.active?"Pausar":"Activar"} title={keyword.active?"Pausar":"Activar"} className={`grid h-8 w-8 place-items-center rounded-full ${keyword.active?"bg-mist text-oceanDark":"bg-sand text-navy/40"}`}><Power size={14}/></button>
    <button disabled={busy} onClick={()=>{if(confirmDelete(keyword.term))act({action:"delete",id:keyword.id},"Palabra eliminada.");}} aria-label="Eliminar" title="Eliminar" className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-coralDark"><Trash2 size={14}/></button>
  </li>;
}

// Confirmación en la propia interfaz del navegador, solo para acciones destructivas.
const confirmDelete=(name:string)=>typeof window!=="undefined"&&window.confirm(`¿Eliminar “${name}”?`);

function Cuentas({config,feed,onSaved,flash}:{config:EscuchaConfig;feed:MonitorResult|null;onSaved:(c:EscuchaConfig)=>void;flash:(t:string,e?:boolean)=>void}){
  const [form,setForm]=useState({name:"",platform:"web" as Platform,url:"",canton:""});
  const [busy,setBusy]=useState(false);
  const [canton,setCanton]=useState("Todos");
  const [query,setQuery]=useState("");
  const cantones=["Todos",...[...new Set(MEDIOS_COTOPAXI.map(medio=>medio.canton))].sort()];
  const status=new Map((feed?.sources||[]).map(source=>[source.id,source]));
  const act=async(body:Record<string,unknown>,message:string)=>{
    setBusy(true);
    try{const data=await post<{config:EscuchaConfig}>("/api/escucha/accounts",body);onSaved(data.config);flash(message);}
    catch(error){flash(error instanceof Error?error.message:"Error",true);}
    finally{setBusy(false);}
  };
  const add=async(event:React.FormEvent)=>{event.preventDefault();await act({action:"add",...form},"Cuenta agregada.");setForm({...form,name:"",url:""});};
  const medios=MEDIOS_COTOPAXI.filter(medio=>(canton==="Todos"||medio.canton===canton)&&(!query||medio.name.toLowerCase().includes(query.toLowerCase())));
  const sourceStatus=(id:string)=>{const source=status.get(id);return source?(source.ok?<span className="chip bg-mist text-oceanDark">Leyendo · {source.count}</span>:<span className="chip bg-red-50 text-coralDark" title={source.error}>Sin RSS</span>):null;};
  return <>
    <Card>
      <Title icon={<Plus size={18}/>} hint="Sitios web, feeds RSS y canales de YouTube se leen solos. Facebook, Instagram, TikTok y X no permiten lectura gratuita: quedan en la lista para revisión manual.">Seguir una cuenta o medio</Title>
      <form onSubmit={add} className="grid gap-3 md:grid-cols-[1.3fr_1fr_2fr_1fr_auto]">
        <label><span className="label">Nombre</span><input className="field" required minLength={2} value={form.name} onChange={event=>setForm({...form,name:event.target.value})} placeholder="Ej.: Lourdes Tibán"/></label>
        <label><span className="label">Plataforma</span><select className="field" value={form.platform} onChange={event=>setForm({...form,platform:event.target.value as Platform})}>{(Object.keys(PLATFORMS) as Platform[]).map(key=><option key={key} value={key}>{PLATFORMS[key]}</option>)}</select></label>
        <label><span className="label">Enlace</span><input className="field" required type="url" value={form.url} onChange={event=>setForm({...form,url:event.target.value})} placeholder="https://…"/></label>
        <label><span className="label">Cantón</span><input className="field" value={form.canton} onChange={event=>setForm({...form,canton:event.target.value})} placeholder="Opcional"/></label>
        <div className="flex items-end"><Button type="submit" disabled={busy} className="w-full"><Plus size={16}/>Seguir</Button></div>
      </form>
    </Card>
    <Card>
      <Title icon={<Radio size={18}/>}>Cuentas seguidas ({config.accounts.length})</Title>
      <ul className="divide-y divide-navy/10">{config.accounts.map(account=><li key={account.id} className="flex flex-wrap items-center gap-2 py-2">
        <span className="flex-1"><a href={account.url} target="_blank" rel="noreferrer" className={`font-bold ${account.active?"text-deep":"text-navy/40 line-through"}`}>{account.name}</a><span className="ml-2 text-xs text-navy/50">{PLATFORMS[account.platform]}{account.canton?` · ${account.canton}`:""}</span></span>
        {account.feedUrl?sourceStatus(`cuenta-${account.id}`)||<span className="chip bg-mist text-oceanDark">Automática</span>:<span className="chip bg-yellow/20 text-navy">Revisión manual</span>}
        <button disabled={busy} onClick={()=>act({action:"toggle",id:account.id,active:!account.active},account.active?"Cuenta pausada.":"Cuenta activada.")} aria-label={account.active?"Pausar":"Activar"} className={`grid h-8 w-8 place-items-center rounded-full ${account.active?"bg-mist text-oceanDark":"bg-sand text-navy/40"}`}><Power size={14}/></button>
        <button disabled={busy} onClick={()=>{if(confirmDelete(account.name))act({action:"delete",id:account.id},"Cuenta eliminada.");}} aria-label="Eliminar" className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-coralDark"><Trash2 size={14}/></button>
      </li>)}{!config.accounts.length?<li className="py-2 text-sm text-navy/50">Aún no sigues cuentas adicionales. Agrega las cuentas oficiales que quieras vigilar.</li>:null}</ul>
    </Card>
    <Card>
      <Title icon={<Newspaper size={18}/>} hint="Directorio base de la provincia. Los sitios web con RSS se leen automáticamente.">Medios de Cotopaxi ({MEDIOS_COTOPAXI.length})</Title>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row"><input className="field sm:max-w-xs" placeholder="Buscar medio…" value={query} onChange={event=>setQuery(event.target.value)}/><div className="flex flex-wrap gap-2">{cantones.map(item=><button key={item} onClick={()=>setCanton(item)} aria-pressed={canton===item} className={`chip ${canton===item?"bg-deep text-white":"bg-sand text-navy"}`}>{item}</button>)}</div></div>
      <ul className="divide-y divide-navy/10">{medios.map(medio=><li key={medio.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
        <span><b className="text-deep">{medio.name}</b> <span className="text-xs text-navy/50">· {medio.category} · {medio.canton}</span></span>
        <span className="flex flex-wrap items-center gap-2">{sourceStatus(`medio-${medio.id}`)}{medio.profiles.map(profile=><a key={profile.url} href={profile.url} target="_blank" rel="noreferrer" className="chip bg-sand text-navy">{profile.platform==="WEB"?"Web":profile.platform.charAt(0)+profile.platform.slice(1).toLowerCase()}</a>)}{!medio.profiles.length?<span className="text-xs text-navy/40">Sin enlace verificado</span>:null}</span>
      </li>)}</ul>
    </Card>
  </>;
}

function Alertas({settings,isAdmin,reload,flash}:{settings:ConfigResponse;isAdmin:boolean;reload:()=>Promise<void>;flash:(t:string,e?:boolean)=>void}){
  const [chats,setChats]=useState<{id:string;title:string}[]|null>(null);
  const [busy,setBusy]=useState(false);
  const run=async(body:Record<string,unknown>,message:string)=>{
    setBusy(true);
    try{const data=await post<{chats?:{id:string;title:string}[];result?:AlertRun}>("/api/escucha/telegram",body);if(data.chats)setChats(data.chats);await reload();
      flash(data.result?.error?`Error: ${data.result.error}`:data.result?.skipped?"Telegram aún no está conectado.":message,Boolean(data.result?.error));}
    catch(error){flash(error instanceof Error?error.message:"Error",true);}
    finally{setBusy(false);}
  };
  const {token,chat}=settings.telegram;
  const steps=[
    {done:token,title:"Bot de Telegram",text:"Crear el bot con @BotFather y guardar su token en Vercel (ESCUCHA_TELEGRAM_BOT_TOKEN)."},
    {done:Boolean(chat),title:"Grupo del equipo",text:chat?`Conectado a: ${chat.title}`:"Agregar el bot al grupo, escribir un mensaje y pulsar “Buscar grupos”."},
    {done:settings.log.some(entry=>entry.sent>0),title:"Prueba de envío",text:"Enviar un mensaje de prueba al grupo."},
  ];
  return <>
    <div className="grid gap-3 md:grid-cols-3">{(["rojo","naranja","verde"] as Semaforo[]).map(level=><Card key={level} className={`border-l-[8px] ${LEVELS[level].border}`}>
      <p className="flex items-center gap-2 font-black text-deep"><Dot level={level}/>{LEVELS[level].label}</p>
      <p className="mt-1 text-sm text-navy/70">{level==="rojo"?"Cada 10 minutos se revisa y llega de inmediato al grupo.":level==="naranja"?"Un resumen al mediodía (12:00–12:59).":"Un resumen en la noche (20:00–20:59)."}</p>
      {isAdmin?<Button tone="soft" className="mt-3" disabled={busy} onClick={()=>run({action:"run",tipo:level==="rojo"?"rojo":level==="naranja"?"mediodia":"noche"},"Envío ejecutado.")}><Send size={14}/>Enviar ahora</Button>:null}
    </Card>)}</div>
    <Card>
      <Title icon={<Bell size={18}/>} hint="Las alertas llegan a un grupo de Telegram. WhatsApp no permite envíos automáticos a campañas; desde cada nota puedes reenviar a WhatsApp con un toque.">Conexión con Telegram</Title>
      <ol className="space-y-3">{steps.map((step,index)=><li key={step.title} className="flex gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${step.done?"bg-ocean text-white":"bg-sand text-navy"}`}>{step.done?<Check size={16}/>:index+1}</span><span><b className="text-deep">{step.title}</b><span className="block text-sm text-navy/65">{step.text}</span></span></li>)}</ol>
      {isAdmin?<div className="mt-4 flex flex-wrap gap-2">
        <Button tone="soft" disabled={busy||!token} onClick={()=>run({action:"detect"},"Búsqueda completada.")}><Search size={14}/>Buscar grupos</Button>
        <Button disabled={busy||!token||!chat} onClick={()=>run({action:"test"},"Mensaje de prueba enviado.")}><Send size={14}/>Enviar prueba</Button>
      </div>:null}
      {chats?<ul className="mt-3 space-y-2">{chats.map(item=><li key={item.id} className="flex items-center justify-between rounded-2xl bg-sand p-3"><span className="font-bold text-deep">{item.title}</span><Button tone="soft" disabled={busy} onClick={()=>run({action:"select",...item},"Grupo conectado.")}>Usar este grupo</Button></li>)}{!chats.length?<li className="text-sm text-navy/60">No aparecen grupos. Agrega el bot al grupo, escribe cualquier mensaje y vuelve a buscar.</li>:null}</ul>:null}
    </Card>
    <Card>
      <Title icon={<ListFilter size={18}/>}>Historial de envíos</Title>
      <ul className="divide-y divide-navy/10 text-sm">{settings.log.map((entry,index)=><li key={index} className="flex flex-wrap items-center gap-2 py-2"><span className="w-32 text-navy/60">{time(entry.at)}</span><span className="chip bg-sand text-navy">{entry.tipo}</span><span className="flex-1">{entry.items} notas · {entry.error?<b className="text-coral">{entry.error}</b>:entry.skipped?"no enviado (Telegram pendiente)":`${entry.sent} mensaje(s) enviado(s)`}</span><span className="text-xs text-navy/50">{entry.by}</span></li>)}{!settings.log.length?<li className="py-2 text-navy/50">Todavía no hay envíos.</li>:null}</ul>
    </Card>
  </>;
}

function Usuarios({users,me,onChange,flash}:{users:EscuchaUser[];me:string;onChange:(u:EscuchaUser[])=>void;flash:(t:string,e?:boolean)=>void}){
  const [form,setForm]=useState({email:"",name:"",role:"analista" as EscuchaUser["role"],password:""});
  const [busy,setBusy]=useState(false);
  const act=async(body:Record<string,unknown>,message:string)=>{
    setBusy(true);
    try{const data=await post<{users:EscuchaUser[]}>("/api/escucha/users",body);onChange(data.users);flash(message);return true;}
    catch(error){flash(error instanceof Error?error.message:"Error",true);return false;}
    finally{setBusy(false);}
  };
  const add=async(event:React.FormEvent)=>{event.preventDefault();if(await act({action:"add",...form},"Usuario creado."))setForm({email:"",name:"",role:"analista",password:""});};
  const reset=(email:string)=>{const password=window.prompt("Nueva contraseña (mínimo 10 caracteres):");if(password)act({action:"reset",email,password},"Contraseña actualizada.");};
  return <>
    <Card>
      <Title icon={<Plus size={18}/>} hint="Administrador: gestiona todo, incluidos usuarios y Telegram. Analista: consulta, palabras clave y cuentas.">Crear usuario</Title>
      <form onSubmit={add} className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1.2fr_auto]">
        <label><span className="label">Correo</span><input className="field" type="email" required value={form.email} onChange={event=>setForm({...form,email:event.target.value})}/></label>
        <label><span className="label">Nombre</span><input className="field" value={form.name} onChange={event=>setForm({...form,name:event.target.value})}/></label>
        <label><span className="label">Rol</span><select className="field" value={form.role} onChange={event=>setForm({...form,role:event.target.value as EscuchaUser["role"]})}><option value="analista">Analista</option><option value="admin">Administrador</option></select></label>
        <label><span className="label">Contraseña inicial</span><input className="field" type="password" required minLength={10} autoComplete="new-password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})}/></label>
        <div className="flex items-end"><Button type="submit" disabled={busy} className="w-full"><Plus size={16}/>Crear</Button></div>
      </form>
    </Card>
    <Card>
      <Title icon={<Users size={18}/>}>Usuarios con acceso ({users.length})</Title>
      <ul className="divide-y divide-navy/10">{users.map(user=><li key={user.email} className="flex flex-wrap items-center gap-2 py-2">
        <span className="flex-1"><b className="text-deep">{user.name}</b><span className="ml-2 text-xs text-navy/50">{user.email}</span></span>
        <span className={`chip ${user.role==="admin"?"bg-purple text-white":"bg-mist text-oceanDark"}`}>{user.role==="admin"?"Administrador":"Analista"}</span>
        {user.source==="principal"?<span className="chip bg-sand text-navy/60">Cuenta principal</span>:<>
          <Button tone="ghost" disabled={busy} onClick={()=>reset(user.email)}><KeyRound size={14}/>Contraseña</Button>
          {user.email!==me?<button disabled={busy} onClick={()=>{if(confirmDelete(user.email))act({action:"delete",email:user.email},"Usuario eliminado.");}} aria-label="Eliminar" className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-coralDark"><Trash2 size={14}/></button>:null}
        </>}
      </li>)}</ul>
    </Card>
  </>;
}
