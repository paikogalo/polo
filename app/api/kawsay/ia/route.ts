import {z} from "zod";
import {claude} from "@/lib/kawsay/anthropic";
import {chatSystem,parsePlan,planPrompt} from "@/lib/kawsay/prompts";
import {rateLimit,requestIp} from "@/lib/rate-limit";

export const runtime="nodejs";
export const maxDuration=60;

const turno=z.object({role:z.enum(["user","assistant"]),content:z.string().max(2000)});
const schema=z.discriminatedUnion("kind",[
  z.object({kind:z.literal("plan"),pedido:z.string().trim().min(8).max(1500),previo:z.unknown().optional()}),
  z.object({kind:z.literal("chat"),historial:z.array(turno).min(1).max(12)}),
]);

export async function POST(request:Request){
  const ip=requestIp(request);
  if(!rateLimit(`kawsay-ia:${ip}`,15,10*60_000))return Response.json({error:"Hiciste muchas consultas seguidas. Espera unos minutos."},{status:429});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:"Pedido no válido."},{status:400});
  const input=parsed.data;
  if(!process.env.ANTHROPIC_API_KEY)return Response.json({disponible:false});

  if(input.kind==="plan"){
    const text=await claude({messages:[{role:"user",content:planPrompt(input.pedido,input.previo)}],maxTokens:4000});
    if(!text)return Response.json({error:"No pudimos armar el plan esta vez. Inténtalo de nuevo."},{status:502});
    try{return Response.json({disponible:true,plan:parsePlan(text)});}
    catch{return Response.json({error:"No pudimos armar el plan esta vez. Inténtalo de nuevo o simplifica el pedido."},{status:502});}
  }

  const historial=input.historial.slice(-10);
  while(historial[0]?.role==="assistant")historial.shift();
  if(!historial.length)return Response.json({error:"Pedido no válido."},{status:400});
  const text=await claude({system:chatSystem(),messages:historial,maxTokens:500,model:process.env.KAWSAY_CHAT_MODEL||"claude-haiku-5-5",timeoutMs:25_000});
  if(!text)return Response.json({error:"El asistente no está disponible ahora."},{status:502});
  return Response.json({disponible:true,texto:text});
}
