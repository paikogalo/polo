import {z} from "zod";
import {authorizeAdminRequest} from "@/lib/admin-session";
import {estadosRegistro,rangoEdad} from "@/lib/nodo/constants";
import {adminSupabase} from "@/lib/supabase";

export const dynamic="force-dynamic";

const columnas=["codigo","created_at","nombres","edad","genero","canton","parroquia","comunidad_barrio","correo","whatsapp","estudios","ocupacion","intereses","etapa","idea","necesidad","participaria_piloto","como_nos_conociste","acepta_novedades","origen","utm_source","utm_medium","utm_campaign","estado","notas_internas"] as const;

type Fila={id:string}&Record<(typeof columnas)[number],unknown>;

const noAutorizado=()=>Response.json({error:"Acceso exclusivo para administradores."},{status:401});

function contar(filas:Fila[],clave:(f:Fila)=>string|string[]){
  const mapa=new Map<string,number>();
  for(const f of filas){const v=clave(f);for(const x of Array.isArray(v)?v:[v])mapa.set(x,(mapa.get(x)||0)+1);}
  return [...mapa.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
}

/** Evita la inyección de fórmulas al abrir el CSV en Excel o Sheets. */
function celda(valor:unknown){
  let texto=Array.isArray(valor)?valor.join(" | "):valor===null||valor===undefined?"":String(valor);
  if(/^[=+\-@\t\r]/.test(texto))texto=`'${texto}`;
  return `"${texto.replace(/"/g,'""')}"`;
}

export async function GET(request:Request){
  if(!await authorizeAdminRequest(request))return noAutorizado();
  const database=adminSupabase();
  if(!database)return Response.json({configured:false,total:0,rows:[],aggregates:null});
  const {data,error}=await database.from("nodo_registros").select(`id,${columnas.join(",")}`).order("created_at",{ascending:false}).limit(5000);
  if(error){
    console.error(JSON.stringify({level:"error",message:"admin_nodo_failed",error:error.message}));
    return Response.json({error:"No se pudo leer la tabla de NODO. Verifica que la migración esté aplicada."},{status:500});
  }
  const filas=(data||[]) as unknown as Fila[];

  if(new URL(request.url).searchParams.get("format")==="csv"){
    const csv=[columnas.join(","),...filas.map(f=>columnas.map(c=>celda(f[c])).join(","))].join("\r\n");
    return new Response(`﻿${csv}`,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="nodo-registros-${new Date().toISOString().slice(0,10)}.csv"`,"Cache-Control":"no-store"}});
  }

  const aggregates={
    porCanton:contar(filas,f=>String(f.canton)),
    porEdad:contar(filas,f=>rangoEdad(Number(f.edad))),
    porInteres:contar(filas,f=>(f.intereses as string[])||[]),
    porEtapa:contar(filas,f=>String(f.etapa)),
    porPiloto:contar(filas,f=>f.participaria_piloto?"Sí":"No por ahora"),
    porOrigen:contar(filas,f=>[f.utm_source,f.utm_medium].filter(Boolean).join(" / ")||String(f.origen||"web")),
    porEstado:contar(filas,f=>String(f.estado)),
  };
  return Response.json({configured:true,total:filas.length,rows:filas,aggregates},{headers:{"Cache-Control":"no-store"}});
}

const cambioSchema=z.object({
  id:z.string().uuid(),
  estado:z.enum(estadosRegistro).optional(),
  notas_internas:z.string().max(2000).optional(),
});

export async function PATCH(request:Request){
  if(!await authorizeAdminRequest(request))return noAutorizado();
  const parsed=cambioSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Cambio no válido."},{status:400});
  const database=adminSupabase();
  if(!database)return Response.json({error:"Supabase no está configurado."},{status:503});
  const {id,...cambios}=parsed.data;
  if(!Object.keys(cambios).length)return Response.json({ok:true});
  const {error}=await database.from("nodo_registros").update(cambios).eq("id",id);
  if(error)return Response.json({error:"No se pudo guardar el cambio."},{status:500});
  return Response.json({ok:true});
}
