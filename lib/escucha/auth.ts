import {createHash,createHmac,timingSafeEqual} from "node:crypto";

/**
 * Acceso privado del módulo de Escucha Digital.
 *
 * Solo admite las cuentas definidas en ESCUCHA_USERS (máximo tres), con el formato:
 *   correo1@dominio.com:SHA256_DE_LA_CONTRASEÑA,correo2@...:SHA256,correo3@...:SHA256
 * Las contraseñas nunca se guardan en texto plano. La sesión se firma con ESCUCHA_SESSION_SECRET.
 */

export const ESCUCHA_SESSION_COOKIE="dp_escucha_session";
const SESSION_DURATION_SECONDS=12*60*60;
const MAX_USERS=3;

type EscuchaUser={email:string;passwordHash:string};

const constantTimeEqual=(left:string,right:string)=>{
  const a=Buffer.from(left);const b=Buffer.from(right);
  return a.length===b.length&&timingSafeEqual(a,b);
};

export function escuchaUsers():EscuchaUser[]{
  return (process.env.ESCUCHA_USERS||"")
    .split(",")
    .map(entry=>entry.trim())
    .filter(Boolean)
    .map(entry=>{
      const separator=entry.lastIndexOf(":");
      return {email:entry.slice(0,separator).trim().toLowerCase(),passwordHash:entry.slice(separator+1).trim().toLowerCase()};
    })
    .filter(user=>user.email.includes("@")&&/^[a-f0-9]{64}$/.test(user.passwordHash))
    .slice(0,MAX_USERS);
}

const sessionSecret=()=>process.env.ESCUCHA_SESSION_SECRET||"";

export function escuchaIsConfigured(){
  return escuchaUsers().length>0&&sessionSecret().length>=32;
}

export function validateEscuchaLogin(email:string,password:string){
  if(!escuchaIsConfigured())return null;
  const submittedEmail=email.trim().toLowerCase();
  const submittedHash=createHash("sha256").update(password).digest("hex");
  let match:string|null=null;
  // Recorre todas las cuentas para no revelar por tiempo cuál existe.
  for(const user of escuchaUsers()){
    if(constantTimeEqual(submittedEmail,user.email)&&constantTimeEqual(submittedHash,user.passwordHash))match=user.email;
  }
  return match;
}

export function createEscuchaSession(email:string){
  const expiresAt=Math.floor(Date.now()/1000)+SESSION_DURATION_SECONDS;
  const payload=Buffer.from(JSON.stringify({email,expiresAt,scope:"escucha"})).toString("base64url");
  const signature=createHmac("sha256",sessionSecret()).update(payload).digest("base64url");
  return {token:`${payload}.${signature}`,maxAge:SESSION_DURATION_SECONDS};
}

const cookieValue=(request:Request,name:string)=>request.headers.get("cookie")?.split(";").map(value=>value.trim()).find(value=>value.startsWith(`${name}=`))?.slice(name.length+1);

export function authorizeEscuchaRequest(request:Request){
  if(!escuchaIsConfigured())return null;
  const token=cookieValue(request,ESCUCHA_SESSION_COOKIE);
  if(!token)return null;
  const [payload,signature]=token.split(".");
  if(!payload||!signature)return null;
  const expected=createHmac("sha256",sessionSecret()).update(payload).digest("base64url");
  if(!constantTimeEqual(signature,expected))return null;
  try{
    const parsed=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as {email?:string;expiresAt?:number;scope?:string};
    if(parsed.scope!=="escucha"||!parsed.email||!parsed.expiresAt||parsed.expiresAt<Math.floor(Date.now()/1000))return null;
    // Si una cuenta se retira de ESCUCHA_USERS, su sesión deja de valer de inmediato.
    if(!escuchaUsers().some(user=>user.email===parsed.email))return null;
    return {email:parsed.email};
  }catch{return null;}
}

export const privateHeaders={"Cache-Control":"private, no-store","Vary":"Cookie","X-Robots-Tag":"noindex, nofollow"};

/** Autoriza las llamadas automáticas (Vercel Cron o un programador externo) con CRON_SECRET. */
export function authorizeCronRequest(request:Request){
  const secret=process.env.CRON_SECRET||"";
  if(secret.length<16)return false;
  const header=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";
  return constantTimeEqual(header,secret);
}
