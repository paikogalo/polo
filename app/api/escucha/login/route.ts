import {z} from "zod";
import {createEscuchaSession,escuchaIsConfigured,ESCUCHA_SESSION_COOKIE,privateHeaders,validateEscuchaLogin} from "@/lib/escucha/auth";
import {rateLimit,requestIp} from "@/lib/rate-limit";

const schema=z.object({email:z.string().email().max(200),password:z.string().min(8).max(200)});

export async function POST(request:Request){
  if(!rateLimit(`escucha-login:${requestIp(request)}`,5,15*60*1000))return Response.json({error:"Demasiados intentos. Espera unos minutos."},{status:429,headers:privateHeaders});
  if(!escuchaIsConfigured())return Response.json({error:"El acceso todavía no está configurado."},{status:503,headers:privateHeaders});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  const email=parsed.success?validateEscuchaLogin(parsed.data.email,parsed.data.password):null;
  if(!email)return Response.json({error:"Usuario o contraseña incorrectos."},{status:401,headers:privateHeaders});
  const session=createEscuchaSession(email);
  const secure=process.env.NODE_ENV==="production"?"; Secure":"";
  return Response.json({ok:true,email},{headers:{...privateHeaders,"Set-Cookie":`${ESCUCHA_SESSION_COOKIE}=${session.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${session.maxAge}${secure}`}});
}
