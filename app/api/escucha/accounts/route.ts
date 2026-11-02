import {randomUUID} from "node:crypto";
import {z} from "zod";
import {authorizeEscuchaRequest,denied,privateHeaders} from "@/lib/escucha/auth";
import {deriveFeed,getConfig,saveConfig} from "@/lib/escucha/config";

const platform=z.enum(["web","rss","youtube","facebook","instagram","tiktok","x","otra"]);
const schema=z.discriminatedUnion("action",[
  z.object({action:z.literal("add"),name:z.string().trim().min(2).max(80),platform,url:z.string().trim().url().max(400).refine(value=>/^https?:\/\//.test(value)),canton:z.string().trim().max(40).default("")}),
  z.object({action:z.literal("toggle"),id:z.string(),active:z.boolean()}),
  z.object({action:z.literal("delete"),id:z.string()}),
]);

export async function POST(request:Request){
  const user=await authorizeEscuchaRequest(request);
  if(!user)return denied();
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Revisa el nombre y el enlace."},{status:400,headers:privateHeaders});
  const config=await getConfig();
  const input=parsed.data;
  if(input.action==="add"){
    if(config.accounts.length>=200)return Response.json({error:"Límite de 200 cuentas."},{status:400,headers:privateHeaders});
    config.accounts.push({id:randomUUID(),name:input.name,platform:input.platform,url:input.url,feedUrl:deriveFeed(input.platform,input.url),canton:input.canton,active:true});
  }else if(input.action==="toggle"){
    const account=config.accounts.find(item=>item.id===input.id);
    if(account)account.active=input.active;
  }else config.accounts=config.accounts.filter(item=>item.id!==input.id);
  return Response.json({ok:true,config:await saveConfig(config,user.email)},{headers:privateHeaders});
}
