"use client";
import {AlertTriangle,BarChart3,Check,Copy,ExternalLink,KeyRound,LayoutDashboard,ListFilter,LogOut,Newspaper,PieChart as PieIcon,Plus,Power,Printer,Radio,RefreshCw,Search,Send,Table2,Trash2,Users,X} from "lucide-react";
import {Bar,BarChart,CartesianGrid,Cell,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {useCallback,useEffect,useMemo,useState} from "react";
import type {AlertRun} from "@/lib/escucha/alerts";
import type {EscuchaUser} from "@/lib/escucha/auth";
import type {EscuchaConfig,Keyword,Level,Platform} from "@/lib/escucha/config";
import type {MonitorItem,MonitorResult,Semaforo} from "@/lib/escucha/monitor";
import {MEDIOS_COTOPAXI} from "@/lib/escucha/sources";

type ConfigResponse={user:EscuchaUser;config:EscuchaConfig;log:AlertRun[];telegram:{token:boolean;chat:{id:string;title:string}|null};persistent:boolean;users:EscuchaUser[]};
type Tab="resumen"|"menciones"|"palabras"|"cuentas"|"usuarios";

const LEVELS:Record<Level,{label:string;dot:string;chip:string;border:string;when:string}>={
  rojo:{label:"Rojo",dot:"bg-esc-red",chip:"bg-esc-red text-white",border:"border-l-esc-red",when:"Alerta inmediata a Telegram"},
  naranja:{label:"Naranja",dot:"bg-esc-amber",chip:"bg-esc-amber text-esc-ink",border:"border-l-esc-amber",when:"Resumen del mediodía"},
  verde:{label:"Verde",dot:"bg-esc-teal",chip:"bg-esc-teal text-white",border:"border-l-esc-teal",when:"Resumen de la noche"},
  excluir:{label:"Excluir",dot:"bg-esc-ink/40",chip:"bg-esc-ink/10 text-esc-ink",border:"border-l-navy/30",when:"Descarta la nota (ruido)"},
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
function Title({icon,children,hint}:{icon:React.ReactNode;children:React.ReactNode;hint?:string}){return <div className="mb-4"><h2 className="flex items-center gap-2 text-lg font-black text-esc-ink"><span className="text-esc-teal">{icon}</span>{children}</h2>{hint?<p className="mt-1 text-sm text-esc-ink/60">{hint}</p>:null}</div>;}
function Button({children,tone="primary",...props}:React.ButtonHTMLAttributes<HTMLButtonElement>&{tone?:"primary"|"soft"|"danger"|"ghost"}){
  const tones={primary:"bg-esc-red text-white hover:bg-esc-redDark",soft:"bg-esc-mist text-esc-ink hover:bg-esc-teal hover:text-white",danger:"bg-red-50 text-esc-redDark hover:bg-esc-red hover:text-white",ghost:"bg-esc-sand text-esc-ink hover:bg-esc-ink/10"};
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition disabled:opacity-50 ${tones[tone]} ${props.className||""}`}>{children}</button>;
}

function MentionCard({item}:{item:MonitorItem}){
  const share=`${item.title} — ${item.outlet}\n${item.url}`;
  return <article className={`rounded-2xl border-l-[6px] bg-white p-4 shadow-soft ${LEVELS[item.level].border}`}>
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={`chip ${LEVELS[item.level].chip}`}>{item.level==="rojo"?<AlertTriangle size={12} className="mr-1" aria-hidden="true"/>:null}{LEVELS[item.level].label}</span>
      {item.matches.slice(0,4).map(match=><span key={match.term} className="chip bg-esc-sand text-esc-ink/80">{match.term}</span>)}
      <span className="ml-auto text-esc-ink/50">{time(item.publishedAt)}</span>
    </div>
    <h3 className="mt-2 font-extrabold leading-snug text-esc-ink">{item.title}</h3>
    {item.summary?<p className="mt-1 line-clamp-2 text-sm text-esc-ink/65">{item.summary}</p>:null}
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className="font-bold text-esc-ink/60">{item.outlet}{item.canton?` · ${item.canton}`:""} · {item.sourceKind==="medio"?"Medio de Cotopaxi":item.sourceKind==="cuenta"?"Cuenta seguida":"Buscador"}</span>
      <span className="flex gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noreferrer" className="chip bg-[#25D366] text-white">WhatsApp</a>
        <a href={item.url} target="_blank" rel="noreferrer" className="chip bg-esc-mist text-esc-tealDark">Abrir nota <ExternalLink size={12} className="ml-1" aria-hidden="true"/></a>
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
  const [alertOpen,setAlertOpen]=useState(false);

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
    ...(isAdmin?[{id:"usuarios" as Tab,label:"Usuarios",icon:<Users size={18}/>}]:[]),
  ];
  const updateConfig=(config:EscuchaConfig)=>{setSettings(current=>current?{...current,config}:current);loadFeed(hours);};

  return <main className="min-h-screen bg-esc-sand pb-20">
    <div className="escucha-band h-1.5 print:hidden" aria-hidden="true"/>
    <header className="escucha-gradient text-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white px-3 py-2 shadow-soft"><img src="/escucha-logo.png" alt="Escucha Digital" width={150} height={42} className="h-9 w-auto"/></span>
          <p className="hidden text-[11px] font-extrabold uppercase tracking-widest text-white/75 sm:block">De POLO a POLO<br/><span className="font-bold normal-case tracking-normal text-white/60">Monitor privado</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-right text-xs sm:block"><b className="block">{settings?.user.name||"…"}</b><span className="text-white/75">{settings?.user.role==="admin"?"Administrador":"Analista"}</span></span>
          <Button className="!bg-white !text-esc-redDark" onClick={()=>setAlertOpen(true)}><AlertTriangle size={16} aria-hidden="true"/>Palabras de alerta</Button>
          <Button tone="ghost" className="!bg-white/15 !text-white" onClick={()=>loadFeed(hours)} disabled={loading} aria-label="Actualizar"><RefreshCw size={16} className={loading?"animate-spin":""} aria-hidden="true"/><span className="hidden sm:inline">Actualizar</span></Button>
          <Button tone="ghost" className="!bg-white/15 !text-white" onClick={onLogout} aria-label="Salir"><LogOut size={16} aria-hidden="true"/><span className="hidden sm:inline">Salir</span></Button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3" aria-label="Secciones">
        {tabs.map(item=><button key={item.id} onClick={()=>setTab(item.id)} aria-current={tab===item.id?"page":undefined} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${tab===item.id?"bg-white text-esc-ink":"text-white/85 hover:bg-white/15"}`}>{item.icon}{item.label}</button>)}
      </nav>
    </header>

    <div className="mx-auto max-w-7xl space-y-5 px-4 pt-5">
      {alertOpen&&settings?<AlertWords config={settings.config} onClose={()=>setAlertOpen(false)} onSaved={updateConfig} flash={flash}/>:null}
      {settings&&!settings.persistent?<p className="print:hidden rounded-2xl bg-esc-amber/20 p-3 text-sm text-esc-ink"><b>Modo prueba:</b> los cambios se guardan solo en memoria y pueden perderse. En producción se activa el almacenamiento permanente.</p>:null}
      {notice?<p role="status" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-bold shadow-2xl ${notice.error?"bg-esc-red text-white":"bg-esc-ink text-white"}`}>{notice.text}</p>:null}

      {tab==="resumen"?<Resumen items={items} counts={counts} loading={loading&&!feed} settings={settings} feed={feed} hours={hours} setHours={setHours} go={setTab}/>:null}
      {tab==="menciones"?<Menciones items={items} hours={hours} setHours={setHours} loading={loading}/>:null}
      {tab==="palabras"&&settings?<Palabras config={settings.config} onSaved={updateConfig} flash={flash}/>:null}
      {tab==="cuentas"&&settings?<Cuentas config={settings.config} feed={feed} onSaved={updateConfig} flash={flash}/>:null}
      {tab==="usuarios"&&settings&&isAdmin?<Usuarios users={settings.users} me={settings.user.email} onChange={users=>setSettings({...settings,users})} flash={flash}/>:null}
    </div>
  </main>;
}

type ChartKind="pastel"|"barras"|"tabla";
const PALETTE=["#41989C","#CF5343","#E9A73E","#684688","#B57B9F","#162837","#2F7276","#A8402F"];
const LEVEL_COLOR:Record<Semaforo,string>={rojo:"#CF5343",naranja:"#E9A73E",verde:"#41989C"};
type Datum={name:string;value:number;color?:string};

function countBy(items:MonitorItem[],key:(item:MonitorItem)=>string[]):Datum[]{
  const map=new Map<string,number>();
  items.forEach(item=>key(item).forEach(name=>map.set(name,(map.get(name)||0)+1)));
  return [...map.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
}

function ChartCard({title,hint,data,initial="barras",limit=8}:{title:string;hint?:string;data:Datum[];initial?:ChartKind;limit?:number}){
  const [kind,setKind]=useState<ChartKind>(initial);
  const rows=data.slice(0,limit);
  const total=data.reduce((sum,item)=>sum+item.value,0);
  const color=(item:Datum,index:number)=>item.color||PALETTE[index%PALETTE.length];
  const options:[ChartKind,React.ReactNode,string][]=[["pastel",<PieIcon key="p" size={14}/>,"Pastel"],["barras",<BarChart3 key="b" size={14}/>,"Barras"],["tabla",<Table2 key="t" size={14}/>,"Tabla"]];
  return <section className="break-inside-avoid rounded-3xl bg-white p-4 shadow-soft sm:p-5">
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div><h3 className="font-black text-esc-ink">{title}</h3>{hint?<p className="text-xs text-esc-ink/55">{hint}</p>:null}</div>
      <div className="flex rounded-full bg-esc-sand p-1 print:hidden" role="group" aria-label={`Tipo de gráfico: ${title}`}>
        {options.map(([key,icon,label])=><button key={key} onClick={()=>setKind(key)} aria-pressed={kind===key} title={label} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${kind===key?"bg-esc-ink text-white":"text-esc-ink"}`}>{icon}<span className="hidden sm:inline">{label}</span></button>)}
      </div>
    </div>
    {!rows.length?<p className="grid h-48 place-items-center rounded-2xl bg-esc-sand text-sm text-esc-ink/50">Sin datos en este periodo.</p>:
    kind==="tabla"?<table className="w-full text-sm"><thead><tr className="text-left text-xs text-esc-ink/50"><th className="py-1">Categoría</th><th className="py-1 text-right">Notas</th><th className="py-1 text-right">%</th></tr></thead>
      <tbody>{rows.map((item,index)=><tr key={item.name} className="border-t border-esc-ink/10"><td className="py-1.5"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{background:color(item,index)}}/>{item.name}</td><td className="py-1.5 text-right font-black">{item.value}</td><td className="py-1.5 text-right text-esc-ink/60">{total?Math.round(item.value*100/total):0}%</td></tr>)}</tbody></table>:
    <div className="h-56"><ResponsiveContainer width="100%" height="100%">
      {kind==="pastel"?<PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="80%" paddingAngle={2} isAnimationActive={false}>{rows.map((item,index)=><Cell key={item.name} fill={color(item,index)}/>)}</Pie><Tooltip formatter={(value:number)=>[`${value} notas`,""]}/></PieChart>:
      <BarChart data={rows} layout="vertical" margin={{left:8,right:16}}><CartesianGrid horizontal={false} stroke="#16283715"/><XAxis type="number" allowDecimals={false} tick={{fontSize:11}}/><YAxis type="category" dataKey="name" width={120} tick={{fontSize:11}}/><Tooltip formatter={(value:number)=>[`${value} notas`,""]}/><Bar dataKey="value" radius={[0,8,8,0]} isAnimationActive={false}>{rows.map((item,index)=><Cell key={item.name} fill={color(item,index)}/>)}</Bar></BarChart>}
    </ResponsiveContainer></div>}
    {kind==="pastel"&&rows.length?<ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-esc-ink/70">{rows.map((item,index)=><li key={item.name} className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{background:color(item,index)}}/>{item.name} ({item.value})</li>)}</ul>:null}
  </section>;
}

function Resumen({items,counts,loading,settings,feed,hours,setHours,go}:{items:MonitorItem[];counts:Record<Semaforo,number>;loading:boolean;settings:ConfigResponse|null;feed:MonitorResult|null;hours:number;setHours:(h:number)=>void;go:(tab:Tab)=>void}){
  const total=items.length;
  const semaforo:Datum[]=(["rojo","naranja","verde"] as Semaforo[]).map(level=>({name:LEVELS[level].label,value:counts[level],color:LEVEL_COLOR[level]})).filter(item=>item.value);
  const byOutlet=useMemo(()=>countBy(items,item=>[item.outlet]),[items]);
  const byTerm=useMemo(()=>countBy(items,item=>item.matches.map(match=>match.term)),[items]);
  const byGroup=useMemo(()=>countBy(items,item=>[...new Set(item.matches.map(match=>match.group))]),[items]);
  const byKind=useMemo(()=>countBy(items,item=>[item.sourceKind==="medio"?"Medios de Cotopaxi":item.sourceKind==="cuenta"?"Cuentas seguidas":"Buscadores y medios nacionales"]),[items]);
  const byDay=useMemo(()=>{
    const format=new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",weekday:"short",day:"2-digit"});
    const map=new Map<string,{rojo:number;naranja:number;verde:number;t:number}>();
    items.forEach(item=>{if(!item.publishedAt)return;const date=new Date(item.publishedAt);const key=format.format(date);const row=map.get(key)||{rojo:0,naranja:0,verde:0,t:date.getTime()};row[item.level]+=1;map.set(key,row);});
    return [...map.entries()].sort((a,b)=>a[1].t-b[1].t).map(([name,row])=>({name,...row}));
  },[items]);
  const ok=feed?.sources.filter(source=>source.ok).length||0;
  const printedAt=new Intl.DateTimeFormat("es-EC",{timeZone:"America/Guayaquil",dateStyle:"long",timeStyle:"short"}).format(new Date());
  return <>
    <div className="hidden print:block"><img src="/escucha-logo.png" alt="Escucha Digital" width={220} height={61} className="mb-2 h-14 w-auto"/><h1 className="text-xl font-black text-esc-ink">Reporte · De POLO a POLO</h1><p className="text-sm text-esc-ink/60">Reporte del monitor · últimas {hours===168?"7 días":`${hours} horas`} · {printedAt}</p></div>
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {RANGES.map(range=><button key={range.hours} onClick={()=>setHours(range.hours)} aria-pressed={hours===range.hours} className={`chip ${hours===range.hours?"bg-esc-ink text-white":"bg-white text-esc-ink shadow-soft"}`}>{range.label}</button>)}
      <Button tone="soft" className="ml-auto" onClick={()=>window.print()}><Printer size={16}/>Imprimir / PDF</Button>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {(["rojo","naranja","verde"] as Semaforo[]).map(level=><button key={level} onClick={()=>go("menciones")} className={`break-inside-avoid rounded-3xl border-l-[8px] bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 ${LEVELS[level].border}`}>
        <span className="flex items-center gap-2 text-sm font-extrabold text-esc-ink"><Dot level={level}/>{LEVELS[level].label}</span>
        <p className="mt-1 text-4xl font-black text-esc-ink">{loading?"–":counts[level]}</p>
        <p className="text-xs font-bold text-esc-ink/55">{LEVELS[level].when}</p>
      </button>)}
      <div className="break-inside-avoid rounded-3xl border-l-[8px] border-l-esc-purple bg-white p-4 shadow-soft">
        <span className="text-sm font-extrabold text-esc-ink">Total de notas</span>
        <p className="mt-1 text-4xl font-black text-esc-ink">{loading?"–":total}</p>
        <p className="text-xs font-bold text-esc-ink/55">{ok} de {feed?.sources.length||0} fuentes leídas</p>
      </div>
    </div>
    <div className="grid gap-5 lg:grid-cols-2 print:grid-cols-2">
      <ChartCard title="Semáforo" hint="Cómo se reparten las notas por nivel de alerta." data={semaforo} initial="pastel"/>
      <section className="break-inside-avoid rounded-3xl bg-white p-4 shadow-soft sm:p-5">
        <h3 className="font-black text-esc-ink">Evolución por día</h3><p className="mb-3 text-xs text-esc-ink/55">Notas publicadas cada día, por color.</p>
        {byDay.length?<div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={byDay}><CartesianGrid vertical={false} stroke="#16283715"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis allowDecimals={false} tick={{fontSize:11}}/><Tooltip/>
          <Bar dataKey="verde" name="Verde" stackId="a" fill={LEVEL_COLOR.verde} isAnimationActive={false}/><Bar dataKey="naranja" name="Naranja" stackId="a" fill={LEVEL_COLOR.naranja} isAnimationActive={false}/><Bar dataKey="rojo" name="Rojo" stackId="a" fill={LEVEL_COLOR.rojo} radius={[6,6,0,0]} isAnimationActive={false}/></BarChart></ResponsiveContainer></div>:<p className="grid h-48 place-items-center rounded-2xl bg-esc-sand text-sm text-esc-ink/50">Sin datos en este periodo.</p>}
      </section>
      <ChartCard title="Medios con más notas" data={byOutlet}/>
      <ChartCard title="Palabras clave que más suenan" data={byTerm}/>
      <ChartCard title="Temas" hint="Grupos de palabras clave." data={byGroup} initial="pastel"/>
      <ChartCard title="Tipo de fuente" data={byKind} initial="tabla"/>
    </div>
    <Card className="break-inside-avoid">
      <Title icon={<AlertTriangle size={18}/>} hint="Lo último que exige reacción del equipo.">Alertas rojas recientes</Title>
      <div className="space-y-3">{items.filter(item=>item.level==="rojo").slice(0,5).map(item=><MentionCard key={item.id} item={item}/>)}
        {!loading&&!counts.rojo?<p className="rounded-2xl bg-esc-sand p-4 text-center text-sm text-esc-ink/60">Sin alertas rojas en este periodo.</p>:null}</div>
    </Card>
    <p className="text-center text-xs text-esc-ink/50 print:block">Telegram: {settings?.telegram.chat&&settings.telegram.token?`conectado a “${settings.telegram.chat.title}”`:"pendiente de conexión"} · Actualizado {time(feed?.generatedAt)} · Clasificación automática por palabras clave; verificar antes de reaccionar.</p>
  </>;
}

function AlertWords({config,onClose,onSaved,flash}:{config:EscuchaConfig;onClose:()=>void;onSaved:(c:EscuchaConfig)=>void;flash:(t:string,e?:boolean)=>void}){
  const [term,setTerm]=useState("");
  const [busy,setBusy]=useState(false);
  const red=config.keywords.filter(keyword=>keyword.level==="rojo");
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose();};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[onClose]);
  const act=async(body:Record<string,unknown>,message:string)=>{
    setBusy(true);
    try{const data=await post<{config:EscuchaConfig;scan?:{items?:number;sent?:number}|null}>("/api/escucha/keywords",body);onSaved(data.config);
      flash(data.scan&&data.scan.items?`${message} Se encontraron ${data.scan.items} nota(s) y se avisó al grupo.`:message);}
    catch(error){flash(error instanceof Error?error.message:"Error",true);}
    finally{setBusy(false);}
  };
  const add=async(event:React.FormEvent)=>{event.preventDefault();await act({action:"add",term,level:"rojo",group:"Alertas"},"Palabra de alerta agregada.");setTerm("");};
  return <div className="fixed inset-0 z-50 grid place-items-center bg-esc-ink/60 p-4 print:hidden" role="dialog" aria-modal="true" aria-labelledby="alertas-titulo" onClick={onClose}>
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl" onClick={event=>event.stopPropagation()}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 id="alertas-titulo" className="flex items-center gap-2 text-xl font-black text-esc-ink"><Dot level="rojo"/>Palabras de alerta</h2><p className="mt-1 text-sm text-esc-ink/60">Cuando el monitor detecte una de estas palabras en un medio, llega <b>de inmediato</b> al grupo de Telegram. Usa “+” para exigir dos palabras juntas: <i>Tibán + denuncia</i>.</p></div>
        <button onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-esc-sand text-esc-ink"><X size={18}/></button>
      </div>
      <form onSubmit={add} className="mt-4 flex gap-2"><label className="flex-1"><span className="sr-only">Nueva palabra de alerta</span><input className="field" autoFocus required minLength={2} maxLength={80} value={term} onChange={event=>setTerm(event.target.value)} placeholder="Ej.: debate + Cotopaxi"/></label><Button type="submit" disabled={busy}><Plus size={16}/>Agregar</Button></form>
      <ul className="mt-4 divide-y divide-esc-ink/10">{red.map(keyword=><li key={keyword.id} className="flex items-center gap-2 py-2">
        <span className={`flex-1 font-bold ${keyword.active?"text-esc-ink":"text-esc-ink/40 line-through"}`}>{keyword.term}<span className="ml-2 text-xs font-normal text-esc-ink/50">{keyword.group}</span></span>
        <button disabled={busy} onClick={()=>act({action:"update",id:keyword.id,active:!keyword.active},keyword.active?"Palabra pausada.":"Palabra activada.")} aria-label={keyword.active?"Pausar":"Activar"} className={`grid h-8 w-8 place-items-center rounded-full ${keyword.active?"bg-esc-mist text-esc-tealDark":"bg-esc-sand text-esc-ink/40"}`}><Power size={14}/></button>
        <button disabled={busy} onClick={()=>act({action:"update",id:keyword.id,level:"naranja"},"Pasó a naranja (resumen del mediodía).")} title="Bajar a naranja" className="rounded-full bg-esc-amber/20 px-3 py-1 text-xs font-extrabold text-esc-ink">A naranja</button>
        <button disabled={busy} onClick={()=>{if(confirmDelete(keyword.term))act({action:"delete",id:keyword.id},"Palabra eliminada.");}} aria-label="Eliminar" className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-esc-redDark"><Trash2 size={14}/></button>
      </li>)}</ul>
    </div>
  </div>;
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
        <label className="relative block"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-esc-ink/40" aria-hidden="true"/><span className="sr-only">Buscar</span><input className="field pl-10" placeholder="Buscar en títulos y medios…" value={query} onChange={event=>setQuery(event.target.value)}/></label>
        <div className="flex flex-wrap items-center gap-2"><ListFilter size={16} className="text-esc-ink/40" aria-hidden="true"/>
          <button onClick={()=>setLevel("todos")} aria-pressed={level==="todos"} className={`chip ${level==="todos"?"bg-esc-ink text-white":"bg-esc-sand text-esc-ink"}`}>Todo ({items.length})</button>
          {(["rojo","naranja","verde"] as Semaforo[]).map(key=><button key={key} onClick={()=>setLevel(key)} aria-pressed={level===key} className={`chip gap-1 ${level===key?LEVELS[key].chip:"bg-esc-sand text-esc-ink"}`}><Dot level={key}/>{LEVELS[key].label} ({items.filter(i=>i.level===key).length})</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map(range=><button key={range.hours} onClick={()=>setHours(range.hours)} aria-pressed={hours===range.hours} className={`chip ${hours===range.hours?"bg-esc-teal text-white":"bg-esc-sand text-esc-ink"}`}>{range.label}</button>)}
          <span className="mx-1 h-5 w-px bg-esc-ink/10" aria-hidden="true"/>
          {([["todos","Todas las fuentes"],["medio","Medios de Cotopaxi"],["buscador","Buscadores"],["cuenta","Cuentas seguidas"]] as const).map(([key,label])=><button key={key} onClick={()=>setKind(key)} aria-pressed={kind===key} className={`chip ${kind===key?"bg-esc-purple text-white":"bg-esc-sand text-esc-ink"}`}>{label}</button>)}
          <span className="ml-auto flex gap-2">
            <Button tone="ghost" onClick={copy}>{copied?<Check size={14}/>:<Copy size={14}/>}{copied?"Copiado":"Copiar resumen"}</Button>
            <a href={`https://wa.me/?text=${encodeURIComponent(digest)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-extrabold text-white"><Send size={14} aria-hidden="true"/>WhatsApp</a>
          </span>
        </div>
      </div>
    </Card>
    <div className="space-y-3" aria-busy={loading}>
      {loading&&!items.length?Array.from({length:4}).map((_,index)=><div key={index} className="h-28 animate-pulse rounded-2xl bg-white"/>):null}
      {!loading&&!filtered.length?<Card><p className="text-center text-sm text-esc-ink/60">Sin menciones con este filtro.</p></Card>:null}
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
        <fieldset><legend className="label">Semáforo</legend><div className="flex flex-wrap gap-1">{(Object.keys(LEVELS) as Level[]).map(key=><button type="button" key={key} onClick={()=>setLevel(key)} aria-pressed={level===key} className={`chip gap-1 ${level===key?LEVELS[key].chip:"bg-esc-sand text-esc-ink"}`}><Dot level={key}/>{LEVELS[key].label}</button>)}</div></fieldset>
        <div className="flex items-end"><Button type="submit" disabled={busy} className="w-full"><Plus size={16}/>Agregar</Button></div>
      </form>
      <p className="mt-3 text-xs text-esc-ink/55">{LEVELS[level].label}: {LEVELS[level].when}.</p>
    </Card>
    <div className="grid gap-5 lg:grid-cols-2">
      {(Object.keys(LEVELS) as Level[]).map(key=>{const list=config.keywords.filter(keyword=>keyword.level===key);return <Card key={key} className={`border-l-[8px] ${LEVELS[key].border}`}>
        <Title icon={<Dot level={key}/>} hint={LEVELS[key].when}>{LEVELS[key].label} ({list.length})</Title>
        <ul className="divide-y divide-esc-ink/10">{list.map(keyword=><KeywordRow key={keyword.id} keyword={keyword} busy={busy} act={act}/>)}{!list.length?<li className="py-2 text-sm text-esc-ink/50">Sin palabras en este nivel.</li>:null}</ul>
      </Card>;})}
    </div>
  </>;
}

function KeywordRow({keyword,busy,act}:{keyword:Keyword;busy:boolean;act:(body:Record<string,unknown>,message:string)=>void}){
  return <li className="flex flex-wrap items-center gap-2 py-2">
    <span className={`flex-1 font-bold ${keyword.active?"text-esc-ink":"text-esc-ink/40 line-through"}`}>{keyword.term}<span className="ml-2 text-xs font-normal text-esc-ink/50">{keyword.group}</span></span>
    <label className="sr-only" htmlFor={`nivel-${keyword.id}`}>Nivel</label>
    <select id={`nivel-${keyword.id}`} disabled={busy} value={keyword.level} onChange={event=>act({action:"update",id:keyword.id,level:event.target.value},"Nivel actualizado.")} className="rounded-full border border-esc-ink/15 bg-white px-2 py-1 text-xs font-bold text-esc-ink">{(Object.keys(LEVELS) as Level[]).map(key=><option key={key} value={key}>{LEVELS[key].label}</option>)}</select>
    <button disabled={busy} onClick={()=>act({action:"update",id:keyword.id,active:!keyword.active},keyword.active?"Palabra pausada.":"Palabra activada.")} aria-label={keyword.active?"Pausar":"Activar"} title={keyword.active?"Pausar":"Activar"} className={`grid h-8 w-8 place-items-center rounded-full ${keyword.active?"bg-esc-mist text-esc-tealDark":"bg-esc-sand text-esc-ink/40"}`}><Power size={14}/></button>
    <button disabled={busy} onClick={()=>{if(confirmDelete(keyword.term))act({action:"delete",id:keyword.id},"Palabra eliminada.");}} aria-label="Eliminar" title="Eliminar" className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-esc-redDark"><Trash2 size={14}/></button>
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
  const sourceStatus=(id:string)=>{const source=status.get(id);return source?(source.ok?<span className="chip bg-esc-mist text-esc-tealDark">Leyendo · {source.count}</span>:<span className="chip bg-red-50 text-esc-redDark" title={source.error}>Sin RSS</span>):null;};
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
      <ul className="divide-y divide-esc-ink/10">{config.accounts.map(account=><li key={account.id} className="flex flex-wrap items-center gap-2 py-2">
        <span className="flex-1"><a href={account.url} target="_blank" rel="noreferrer" className={`font-bold ${account.active?"text-esc-ink":"text-esc-ink/40 line-through"}`}>{account.name}</a><span className="ml-2 text-xs text-esc-ink/50">{PLATFORMS[account.platform]}{account.canton?` · ${account.canton}`:""}</span></span>
        {account.feedUrl?sourceStatus(`cuenta-${account.id}`)||<span className="chip bg-esc-mist text-esc-tealDark">Automática</span>:<span className="chip bg-esc-amber/20 text-esc-ink">Revisión manual</span>}
        <button disabled={busy} onClick={()=>act({action:"toggle",id:account.id,active:!account.active},account.active?"Cuenta pausada.":"Cuenta activada.")} aria-label={account.active?"Pausar":"Activar"} className={`grid h-8 w-8 place-items-center rounded-full ${account.active?"bg-esc-mist text-esc-tealDark":"bg-esc-sand text-esc-ink/40"}`}><Power size={14}/></button>
        <button disabled={busy} onClick={()=>{if(confirmDelete(account.name))act({action:"delete",id:account.id},"Cuenta eliminada.");}} aria-label="Eliminar" className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-esc-redDark"><Trash2 size={14}/></button>
      </li>)}{!config.accounts.length?<li className="py-2 text-sm text-esc-ink/50">Aún no sigues cuentas adicionales. Agrega las cuentas oficiales que quieras vigilar.</li>:null}</ul>
    </Card>
    <Card>
      <Title icon={<Newspaper size={18}/>} hint="Directorio base de la provincia. Los sitios web con RSS se leen automáticamente.">Medios de Cotopaxi ({MEDIOS_COTOPAXI.length})</Title>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row"><input className="field sm:max-w-xs" placeholder="Buscar medio…" value={query} onChange={event=>setQuery(event.target.value)}/><div className="flex flex-wrap gap-2">{cantones.map(item=><button key={item} onClick={()=>setCanton(item)} aria-pressed={canton===item} className={`chip ${canton===item?"bg-esc-ink text-white":"bg-esc-sand text-esc-ink"}`}>{item}</button>)}</div></div>
      <ul className="divide-y divide-esc-ink/10">{medios.map(medio=><li key={medio.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
        <span><b className="text-esc-ink">{medio.name}</b> <span className="text-xs text-esc-ink/50">· {medio.category} · {medio.canton}</span></span>
        <span className="flex flex-wrap items-center gap-2">{sourceStatus(`medio-${medio.id}`)}{medio.profiles.map(profile=><a key={profile.url} href={profile.url} target="_blank" rel="noreferrer" className="chip bg-esc-sand text-esc-ink">{profile.platform==="WEB"?"Web":profile.platform.charAt(0)+profile.platform.slice(1).toLowerCase()}</a>)}{!medio.profiles.length?<span className="text-xs text-esc-ink/40">Sin enlace verificado</span>:null}</span>
      </li>)}</ul>
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
      <ul className="divide-y divide-esc-ink/10">{users.map(user=><li key={user.email} className="flex flex-wrap items-center gap-2 py-2">
        <span className="flex-1"><b className="text-esc-ink">{user.name}</b><span className="ml-2 text-xs text-esc-ink/50">{user.email}</span></span>
        <span className={`chip ${user.role==="admin"?"bg-esc-purple text-white":"bg-esc-mist text-esc-tealDark"}`}>{user.role==="admin"?"Administrador":"Analista"}</span>
        {user.source==="principal"?<span className="chip bg-esc-sand text-esc-ink/60">Cuenta principal</span>:<>
          <Button tone="ghost" disabled={busy} onClick={()=>reset(user.email)}><KeyRound size={14}/>Contraseña</Button>
          {user.email!==me?<button disabled={busy} onClick={()=>{if(confirmDelete(user.email))act({action:"delete",email:user.email},"Usuario eliminado.");}} aria-label="Eliminar" className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-esc-redDark"><Trash2 size={14}/></button>:null}
        </>}
      </li>)}</ul>
    </Card>
  </>;
}
