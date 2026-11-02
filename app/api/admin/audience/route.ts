import {authorizeAdminRequest} from "@/lib/admin-session";
import {adminSupabase} from "@/lib/supabase";

type AudienceRow={
  created_at:string;
  full_name:string;
  email:string;
  gender:string|null;
  age_range:string|null;
  canton:string|null;
  parish:string|null;
  neighborhood:string|null;
  source:string;
};

const PAGE_SIZE=1000;
const privateJson=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const group=(values:Array<string|null>)=>Object.entries(values.reduce<Record<string,number>>((result,value)=>{
  const key=value?.trim()||"Sin especificar";
  result[key]=(result[key]||0)+1;
  return result;
},{})).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name,"es"));

async function loadAudienceRows(database:NonNullable<ReturnType<typeof adminSupabase>>){
  const rows:AudienceRow[]=[];
  for(let from=0;;from+=PAGE_SIZE){
    const {data,error}=await database.from("community_members")
      .select("created_at,full_name,email,gender,age_range,canton,parish,neighborhood,source")
      .eq("consent_communications",true)
      .is("unsubscribed_at",null)
      .not("confirmed_at","is",null)
      .order("created_at",{ascending:false})
      .range(from,from+PAGE_SIZE-1);
    if(error)return {rows:[],error};
    const page=(data||[]) as AudienceRow[];
    rows.push(...page);
    if(page.length<PAGE_SIZE)break;
  }
  return {rows,error:null};
}

export async function GET(request:Request){
  const started=Date.now();
  const admin=await authorizeAdminRequest(request);
  if(!admin)return privateJson({error:"No autorizado."},401);
  const database=adminSupabase();
  if(!database)return privateJson({error:"Las métricas demográficas están listas, pero falta conectar el almacenamiento privado."},503);

  const pendingPromise=database.from("community_registration_requests")
    .select("id",{count:"exact",head:true})
    .gt("expires_at",new Date().toISOString());
  const pushPromise=database.from("push_subscriptions")
    .select("id",{count:"exact",head:true})
    .is("disabled_at",null)
    .eq("consent",true);
  const [{rows,error:membersError},pendingResult,pushResult]=await Promise.all([
    loadAudienceRows(database),
    pendingPromise,
    pushPromise,
  ]);
  if(membersError||pendingResult.error||pushResult.error)return privateJson({error:"No se pudieron cargar las métricas."},500);

  console.log(JSON.stringify({level:"info",message:"admin_audience_loaded",adminMethod:admin.method,memberCount:rows.length,ms:Date.now()-started}));
  return privateJson({
    total:rows.length,
    pending:pendingResult.count||0,
    pushSubscribers:pushResult.count||0,
    byGender:group(rows.map(member=>member.gender)),
    byAge:group(rows.map(member=>member.age_range)),
    byCanton:group(rows.map(member=>member.canton)),
    byParish:group(rows.map(member=>member.parish)),
    byNeighborhood:group(rows.map(member=>member.neighborhood)),
    bySource:group(rows.map(member=>member.source)),
    members:rows.slice(0,200).map(member=>({full_name:member.full_name,email:member.email,source:member.source})),
  });
}
