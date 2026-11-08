"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import {Download,Loader2,RefreshCw,Save,UsersRound} from "lucide-react";
import {Bar,BarChart,CartesianGrid,Cell,Legend,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {cantones,estadosRegistro,etapas,intereses,rangoEdad,rangosEdad} from "@/lib/nodo/constants";

type Conteo={name:string;value:number};
type Fila={id:string;codigo:string;created_at:string;nombres:string;edad:number;genero:string|null;canton:string;parroquia:string;comunidad_barrio:string|null;correo:string;whatsapp:string;estudios:string|null;ocupacion:string|null;intereses:string[];etapa:string;idea:string|null;necesidad:string|null;participaria_piloto:boolean;como_nos_conociste:string|null;acepta_novedades:boolean;origen:string;utm_source:string|null;utm_medium:string|null;utm_campaign:string|null;estado:string;notas_internas:string|null};
type Respuesta={configured:boolean;total:number;rows:Fila[];aggregates:null|Record<"porCanton"|"porEdad"|"porInteres"|"porEtapa"|"porPiloto"|"porOrigen"|"porEstado",Conteo[]>;error?:string};

const colores=["#27A9AD","#183247","#F7A713","#2471C8","#E63B32","#0F6E73","#3B8BEA"];
const etiquetaEstado:Record<string,string>={nuevo:"Nuevo",contactado:"Contactado",seleccionado_piloto:"Seleccionado para el piloto",descartado:"Descartado"};

export function NodoAdmin({accessToken}:{accessToken?:string}){
  const [datos,setDatos]=useState<Respuesta|null>(null);
  const [cargando,setCargando]=useState(true);
  const [error,setError]=useState("");
  const [f,setF]=useState({canton:"",edad:"",interes:"",etapa:"",estado:""});
  const [notas,setNotas]=useState<Record<string,string>>({});
  const [guardando,setGuardando]=useState<string|null>(null);
  const headers=useMemo(()=>accessToken?{Authorization:`Bearer ${accessToken}`}:undefined,[accessToken]);

  const cargar=useCallback(async()=>{
    setCargando(true);setError("");
    try{
      const r=await fetch("/api/admin/nodo",{headers,cache:"no-store"});
      const j=await r.json() as Respuesta;
      if(!r.ok)throw new Error(j.error||"No se pudieron cargar los registros.");
      setDatos(j);
    }catch(e){setError(e instanceof Error?e.message:"No se pudieron cargar los registros.");}
    setCargando(false);
  },[headers]);
  useEffect(()=>{cargar();},[cargar]);

  const filas=useMemo(()=>(datos?.rows||[]).filter(r=>(!f.canton||r.canton===f.canton)&&(!f.edad||rangoEdad(r.edad)===f.edad)&&(!f.interes||r.intereses.includes(f.interes))&&(!f.etapa||r.etapa===f.etapa)&&(!f.estado||r.estado===f.estado)),[datos,f]);

  const guardar=async(id:string,cambios:{estado?:string;notas_internas?:string})=>{
    setGuardando(id);
    const r=await fetch("/api/admin/nodo",{method:"PATCH",headers:{"Content-Type":"application/json",...headers},body:JSON.stringify({id,...cambios})}).catch(()=>null);
    if(r?.ok)setDatos(d=>d?{...d,rows:d.rows.map(x=>x.id===id?{...x,...cambios}:x)}:d);
    else setError("No se pudo guardar el cambio. Inténtalo de nuevo.");
    setGuardando(null);
  };

  const exportar=async()=>{
    const r=await fetch("/api/admin/nodo?format=csv",{headers});
    if(!r.ok)return setError("No se pudo exportar el CSV.");
    const url=URL.createObjectURL(await r.blob());
    const a=document.createElement("a");a.href=url;a.download=`nodo-registros-${new Date().toISOString().slice(0,10)}.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  if(cargando&&!datos)return <div className="grid min-h-64 place-items-center text-sm font-bold text-navy/70"><Loader2 className="animate-spin" aria-hidden="true"/>Cargando registros de NODO…</div>;
  if(error&&!datos)return <p role="alert" className="mt-6 rounded-2xl bg-coral/10 p-5 font-bold text-coralDark">{error}</p>;
  if(datos&&!datos.configured)return <div className="mt-6 rounded-3xl border border-dashed border-navy/25 bg-white p-8 text-center"><p className="text-lg font-extrabold text-navy">NODO aún no está conectado a la base de datos</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-navy/70">Configura Supabase y ejecuta la migración <code>supabase/migrations/20261108_nodo.sql</code>. Hasta entonces el formulario público muestra un aviso y no guarda registros.</p></div>;
  const a=datos!.aggregates!;
  const piloto=a.porPiloto.find(x=>x.name==="Sí")?.value||0;

  return <div className="mt-6 space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-black text-deep">NODO · Jóvenes Cotopaxi</h1><p className="mt-1 text-sm text-navy/70">Registros para el piloto. Las gráficas muestran solo cifras agregadas.</p></div>
      <div className="flex gap-2"><button onClick={cargar} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-sm font-bold"><RefreshCw size={16} aria-hidden="true"/>Actualizar</button><button onClick={exportar} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-4 text-sm font-extrabold text-white"><Download size={16} aria-hidden="true"/>Exportar CSV</button></div>
    </div>
    {error&&<p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coralDark">{error}</p>}

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[["Registros",datos!.total],["Quieren ir al piloto",piloto],["Cantones con registros",a.porCanton.length],["Llegaron por afiche/QR",a.porOrigen.filter(x=>x.name.startsWith("afiche")).reduce((s,x)=>s+x.value,0)]].map(([l,v])=><div key={String(l)} className="rounded-2xl border border-navy/10 bg-white p-5"><UsersRound className="h-5 w-5 text-ocean" aria-hidden="true"/><span className="mt-3 block text-xs font-bold text-navy/70">{l}</span><b className="mt-1 block text-3xl text-deep">{v}</b></div>)}
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <Grafico titulo="Registros por cantón"><BarChart data={cantones.map(c=>({name:c,value:a.porCanton.find(x=>x.name===c)?.value||0}))}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" fontSize={11}/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" name="Registros" fill="#27A9AD" radius={[6,6,0,0]}/></BarChart></Grafico>
      <Grafico titulo="Por rango de edad"><BarChart data={rangosEdad.map(r=>({name:r,value:a.porEdad.find(x=>x.name===r)?.value||0}))}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" name="Registros" fill="#183247" radius={[6,6,0,0]}/></BarChart></Grafico>
      <Grafico titulo="Por intereses"><BarChart data={a.porInteres} layout="vertical" margin={{left:10}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="name" width={170} fontSize={10}/><Tooltip/><Bar dataKey="value" name="Registros" fill="#F7A713" radius={[0,6,6,0]}/></BarChart></Grafico>
      <Grafico titulo="Por origen (UTM)"><BarChart data={a.porOrigen} layout="vertical" margin={{left:10}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="name" width={120} fontSize={11}/><Tooltip/><Bar dataKey="value" name="Registros" fill="#2471C8" radius={[0,6,6,0]}/></BarChart></Grafico>
      <Grafico titulo="Por etapa"><PieChart><Pie data={a.porEtapa} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3} label>{a.porEtapa.map((_,i)=><Cell key={i} fill={colores[i%colores.length]}/>)}</Pie><Tooltip/><Legend verticalAlign="bottom"/></PieChart></Grafico>
      <Grafico titulo="¿Participaría en el piloto?"><PieChart><Pie data={a.porPiloto} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3} label>{a.porPiloto.map((x,i)=><Cell key={i} fill={x.name==="Sí"?"#27A9AD":"#183247"}/>)}</Pie><Tooltip/><Legend verticalAlign="bottom"/></PieChart></Grafico>
    </div>

    <section className="rounded-3xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-black">Registros</h2><span className="text-xs font-bold text-navy/70">{filas.length} de {datos!.total}</span></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Filtro valor={f.canton} set={v=>setF({...f,canton:v})} todos="Todos los cantones" opciones={[...cantones]}/>
        <Filtro valor={f.edad} set={v=>setF({...f,edad:v})} todos="Todas las edades" opciones={[...rangosEdad]}/>
        <Filtro valor={f.interes} set={v=>setF({...f,interes:v})} todos="Todos los intereses" opciones={[...intereses]}/>
        <Filtro valor={f.etapa} set={v=>setF({...f,etapa:v})} todos="Todas las etapas" opciones={[...etapas]}/>
        <Filtro valor={f.estado} set={v=>setF({...f,estado:v})} todos="Todos los estados" opciones={[...estadosRegistro]} etiquetas={etiquetaEstado}/>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-y bg-sand text-xs text-navy/70"><tr>{["Código","Fecha","Nombre","Edad","Cantón / parroquia","Contacto","Intereses","Etapa","Piloto","Origen","Estado","Notas internas"].map(x=><th key={x} className="px-3 py-3">{x}</th>)}</tr></thead>
          <tbody>{filas.map(r=><tr key={r.id} className="border-b border-navy/10 align-top">
            <td className="whitespace-nowrap px-3 py-3 font-bold text-oceanDark">{r.codigo}</td>
            <td className="px-3 py-3">{new Date(r.created_at).toLocaleDateString("es-EC")}</td>
            <td className="min-w-40 px-3 py-3 font-semibold">{r.nombres}</td>
            <td className="px-3 py-3">{r.edad}</td>
            <td className="px-3 py-3">{r.canton}<span className="block text-xs text-navy/70">{r.parroquia}{r.comunidad_barrio?` · ${r.comunidad_barrio}`:""}</span></td>
            <td className="px-3 py-3"><a className="block text-oceanDark underline" href={`mailto:${r.correo}`}>{r.correo}</a><span className="text-xs">{r.whatsapp}</span></td>
            <td className="max-w-56 px-3 py-3 text-xs">{r.intereses.join(", ")}</td>
            <td className="px-3 py-3">{r.etapa}</td>
            <td className="px-3 py-3">{r.participaria_piloto?"Sí":"No"}</td>
            <td className="px-3 py-3 text-xs">{[r.utm_source,r.utm_medium].filter(Boolean).join(" / ")||r.origen}</td>
            <td className="px-3 py-3"><label className="sr-only" htmlFor={`estado-${r.id}`}>Estado de {r.codigo}</label><select id={`estado-${r.id}`} className="field min-w-40 py-2" value={r.estado} onChange={e=>guardar(r.id,{estado:e.target.value})}>{estadosRegistro.map(s=><option key={s} value={s}>{etiquetaEstado[s]}</option>)}</select></td>
            <td className="px-3 py-3"><label className="sr-only" htmlFor={`notas-${r.id}`}>Notas internas de {r.codigo}</label><textarea id={`notas-${r.id}`} rows={2} maxLength={2000} className="field min-w-56 py-2 text-xs" value={notas[r.id]??r.notas_internas??""} onChange={e=>setNotas({...notas,[r.id]:e.target.value})}/>{notas[r.id]!==undefined&&notas[r.id]!==(r.notas_internas??"")&&<button onClick={()=>guardar(r.id,{notas_internas:notas[r.id]})} disabled={guardando===r.id} className="mt-1 inline-flex min-h-9 items-center gap-1 rounded-full bg-ocean px-3 text-xs font-extrabold text-white"><Save size={13} aria-hidden="true"/>Guardar nota</button>}</td>
          </tr>)}</tbody>
        </table>
        {!filas.length&&<p className="py-10 text-center text-sm text-navy/70">Todavía no hay registros con estos filtros.</p>}
      </div>
    </section>
  </div>;
}

function Grafico({titulo,children}:{titulo:string;children:React.ReactElement}){
  return <div className="rounded-3xl border border-navy/10 bg-white p-5"><h3 className="font-bold">{titulo}</h3><div className="mt-4 h-64"><ResponsiveContainer>{children}</ResponsiveContainer></div></div>;
}
function Filtro({valor,set,todos,opciones,etiquetas}:{valor:string;set:(v:string)=>void;todos:string;opciones:string[];etiquetas?:Record<string,string>}){
  return <select aria-label={todos} className="field" value={valor} onChange={e=>set(e.target.value)}><option value="">{todos}</option>{opciones.map(o=><option key={o} value={o}>{etiquetas?.[o]||o}</option>)}</select>;
}
