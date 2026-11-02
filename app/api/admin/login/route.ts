import {z} from "zod";
import {ADMIN_SESSION_COOKIE,createPasswordAdminSession,passwordAdminIsConfigured,validatePasswordAdmin} from "@/lib/admin-session";
import {rateLimit,requestIp} from "@/lib/rate-limit";

const loginSchema=z.object({email:z.string().email(),password:z.string().min(8).max(200)});
const privateJson=(body:unknown,status=200,headers:HeadersInit={})=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store","Vary":"Cookie, Authorization",...headers}});

export async function POST(request:Request){
  if(!rateLimit(`admin-login:${requestIp(request)}`,6,15*60*1000))return privateJson({error:"Demasiados intentos. Espera unos minutos."},429);
  if(!passwordAdminIsConfigured())return privateJson({error:"El acceso administrativo todavía no está configurado.",code:"PASSWORD_AUTH_NOT_CONFIGURED"},503);
  const parsed=loginSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success||!validatePasswordAdmin(parsed.data.email,parsed.data.password))return privateJson({error:"Usuario o contraseña incorrectos."},401);
  const session=createPasswordAdminSession(parsed.data.email);
  const secure=process.env.NODE_ENV==="production"?"; Secure":"";
  return privateJson({ok:true},200,{"Set-Cookie":`${ADMIN_SESSION_COOKIE}=${session.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${session.maxAge}${secure}`});
}
