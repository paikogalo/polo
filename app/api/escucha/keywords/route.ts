import {randomUUID} from "node:crypto";
import {z} from "zod";
import {authorizeEscuchaRequest,denied,privateHeaders} from "@/lib/escucha/auth";
import {runRedAlerts} from "@/lib/escucha/alerts";
import {getConfig,saveConfig} from "@/lib/escucha/config";

export const maxDuration=30;

const level=z.enum(["rojo","naranja","verde","excluir"]);
const schema=z.discriminatedUnion("action",[
  z.object({action:z.literal("add"),term:z.string().trim().min(2).max(80),level,group:z.string().trim().max(40).default("General")}),
  z.object({action:z.literal("update"),id:z.string(),term:z.string().trim().min(2).max(80).optional(),level:level.optional(),group:z.string().trim().max(40).optional(),active:z.boolean().optional()}),
  z.object({action:z.literal("delete"),id:z.string()}),
]);

export async function POST(request:Request){
  const user=await authorizeEscuchaRequest(request);
  if(!user)return denied();
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Datos no válidos."},{status:400,headers:privateHeaders});
  const config=await getConfig();
  const input=parsed.data;
  if(input.action==="add"){
    if(config.keywords.some(keyword=>keyword.term.toLowerCase()===input.term.toLowerCase()))return Response.json({error:"Esa palabra clave ya existe."},{status:409,headers:privateHeaders});
    if(config.keywords.length>=150)return Response.json({error:"Límite de 150 palabras clave."},{status:400,headers:privateHeaders});
    config.keywords.push({id:randomUUID(),term:input.term,level:input.level,group:input.group||"General",active:true});
  }else if(input.action==="update"){
    const keyword=config.keywords.find(item=>item.id===input.id);
    if(!keyword)return Response.json({error:"No existe."},{status:404,headers:privateHeaders});
    Object.assign(keyword,Object.fromEntries(Object.entries(input).filter(([key,value])=>key!=="action"&&key!=="id"&&value!==undefined)));
  }else config.keywords=config.keywords.filter(item=>item.id!==input.id);
  const saved=await saveConfig(config,user.email);
  // Una palabra nueva o cambiada a rojo se busca de inmediato y, si aparece, se avisa al grupo.
  const becameRed=(input.action==="add"&&input.level==="rojo")||(input.action==="update"&&input.level==="rojo");
  const scan=becameRed?await runRedAlerts(user.email).catch(()=>null):null;
  return Response.json({ok:true,config:saved,scan},{headers:privateHeaders});
}
