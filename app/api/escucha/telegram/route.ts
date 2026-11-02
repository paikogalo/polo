import {z} from "zod";
import {runDigest,runRedAlerts,sendTest} from "@/lib/escucha/alerts";
import {authorizeEscuchaRequest,denied,privateHeaders} from "@/lib/escucha/auth";
import {detectChats,setTelegramChat,telegramStatus} from "@/lib/escucha/telegram";

export const maxDuration=30;

const schema=z.discriminatedUnion("action",[
  z.object({action:z.literal("detect")}),
  z.object({action:z.literal("select"),id:z.string().regex(/^-?\d+$/),title:z.string().max(120)}),
  z.object({action:z.literal("test")}),
  z.object({action:z.literal("run"),tipo:z.enum(["rojo","mediodia","noche"])}),
]);

export async function POST(request:Request){
  const user=await authorizeEscuchaRequest(request);
  if(!user)return denied();
  if(user.role!=="admin")return denied(403,"Solo un administrador puede configurar alertas.");
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Acción no válida."},{status:400,headers:privateHeaders});
  const input=parsed.data;
  try{
    if(input.action==="detect")return Response.json({chats:await detectChats()},{headers:privateHeaders});
    if(input.action==="select"){await setTelegramChat({id:input.id,title:input.title});return Response.json({ok:true,telegram:await telegramStatus()},{headers:privateHeaders});}
    if(input.action==="test")return Response.json({result:await sendTest(user.email)},{headers:privateHeaders});
    const result=input.tipo==="rojo"?await runRedAlerts(user.email):await runDigest(input.tipo,user.email);
    return Response.json({result},{headers:privateHeaders});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Error"},{status:400,headers:privateHeaders});}
}
