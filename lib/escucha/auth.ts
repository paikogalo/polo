import {createHash,createHmac,randomBytes,scryptSync,timingSafeEqual} from "node:crypto";
import {CUENTAS_PRINCIPALES} from "@/lib/escucha/cuentas";
import {verifyGithubOidc} from "@/lib/escucha/oidc";
import {getJson,setJson,storeIsPersistent} from "@/lib/escucha/store";

/**
 * Acceso privado del módulo de Escucha Digital.
 *
 * - Cuentas principales (administradores) en ESCUCHA_USERS: "correo:SHA256,correo2:SHA256,correo3:SHA256".
 * - Los administradores pueden crear cuentas adicionales desde el panel (se guardan con scrypt).
 * - La sesión se firma con ESCUCHA_SESSION_SECRET y se revalida en cada petición.
 */

export const ESCUCHA_SESSION_COOKIE="dp_escucha_session";
const SESSION_DURATION_SECONDS=12*60*60;
const USERS_KEY="escucha:users";

export type Role="admin"|"analista";
export type EscuchaUser={email:string;role:Role;name:string;source:"principal"|"panel";createdAt:string};
type StoredUser=EscuchaUser&{secret:string};

const constantTimeEqual=(left:string,right:string)=>{
  const a=Buffer.from(left);const b=Buffer.from(right);
  return a.length===b.length&&timingSafeEqual(a,b);
};

/** Solo en vistas previas de Vercel (nunca en producción) y sin cuentas configuradas: cuenta demo. */
const isPreviewDemo=()=>process.env.VERCEL_ENV==="preview"&&!process.env.ESCUCHA_USERS;
const PREVIEW_DEMO:StoredUser={email:"demo@escucha.prueba",role:"admin",name:"Cuenta de prueba",source:"principal",createdAt:"",secret:`sha256$${createHash("sha256").update("PruebaEscucha2026").digest("hex")}`};
const sha256=(value:string)=>createHash("sha256").update(value).digest("hex");

function principalUsers():StoredUser[]{
  if(!process.env.ESCUCHA_USERS)return [...CUENTAS_PRINCIPALES.map(user=>({...user,role:"admin" as const,source:"principal" as const,createdAt:""})),...(isPreviewDemo()?[PREVIEW_DEMO]:[])];
  return (process.env.ESCUCHA_USERS||"").split(",").map(entry=>entry.trim()).filter(Boolean).map(entry=>{
    const separator=entry.lastIndexOf(":");
    const email=entry.slice(0,separator).trim().toLowerCase();
    return {email,role:"admin" as const,name:email.split("@")[0],source:"principal" as const,createdAt:"",secret:`sha256$${entry.slice(separator+1).trim().toLowerCase()}`};
  }).filter(user=>user.email.includes("@")&&/^sha256\$[a-f0-9]{64}$/.test(user.secret));
}

async function panelUsers(){return getJson<StoredUser[]>(USERS_KEY,[]);}

const OVERRIDES_KEY="escucha:principal-passwords";
async function allUsers(){
  const overrides=await getJson<Record<string,string>>(OVERRIDES_KEY,{});
  const principal=principalUsers().map(user=>overrides[user.email]?{...user,secret:overrides[user.email]}:user);
  const emails=new Set(principal.map(user=>user.email));
  return [...principal,...(await panelUsers()).filter(user=>!emails.has(user.email))];
}

const publicUser=({secret:_secret,...user}:StoredUser):EscuchaUser=>user;

export async function listUsers(){return (await allUsers()).map(publicUser);}

const hashPassword=(password:string)=>{const salt=randomBytes(16).toString("hex");return `scrypt$${salt}$${scryptSync(password,salt,32).toString("hex")}`;};

function checkPassword(secret:string,password:string){
  const [kind,a,b]=secret.split("$");
  if(kind==="sha256")return constantTimeEqual(sha256(password),a);
  if(kind==="scrypt"&&a&&b)return constantTimeEqual(scryptSync(password,a,32).toString("hex"),b);
  return false;
}

export async function addUser(input:{email:string;name:string;role:Role;password:string}){
  const email=input.email.trim().toLowerCase();
  if((await allUsers()).some(user=>user.email===email))throw new Error("Ya existe una cuenta con ese correo.");
  const users=await panelUsers();
  users.push({email,name:input.name.trim()||email.split("@")[0],role:input.role,source:"panel",createdAt:new Date().toISOString(),secret:hashPassword(input.password)});
  await setJson(USERS_KEY,users);
}

export async function removeUser(email:string){
  const target=email.trim().toLowerCase();
  if(principalUsers().some(user=>user.email===target))throw new Error("Las cuentas principales no se pueden eliminar desde el panel.");
  await setJson(USERS_KEY,(await panelUsers()).filter(user=>user.email!==target));
}

export async function resetUserPassword(email:string,password:string){
  const target=email.trim().toLowerCase();
  if(principalUsers().some(user=>user.email===target)){
    const overrides=await getJson<Record<string,string>>(OVERRIDES_KEY,{});
    overrides[target]=hashPassword(password);
    await setJson(OVERRIDES_KEY,overrides);
    return;
  }
  const users=await panelUsers();
  const user=users.find(item=>item.email===target);
  if(!user)throw new Error("No existe esa cuenta.");
  user.secret=hashPassword(password);
  await setJson(USERS_KEY,users);
}

// Secreto de sesión: ESCUCHA_SESSION_SECRET, derivado de CRON_SECRET, o uno aleatorio que se crea y guarda en Redis.
let storedSecret="";
const envSecret=()=>process.env.ESCUCHA_SESSION_SECRET||((process.env.CRON_SECRET||"").length>=32?sha256(`escucha-session:${process.env.CRON_SECRET}`):"")||(isPreviewDemo()?sha256(`escucha-preview:${process.env.VERCEL_GIT_COMMIT_SHA||"local"}`):"");
const sessionSecret=()=>envSecret()||storedSecret;
export async function ensureSessionSecret(){
  if(envSecret()||storedSecret||!storeIsPersistent())return;
  let value=await getJson<string>("escucha:session-secret","");
  if(!value){value=randomBytes(32).toString("hex");await setJson("escucha:session-secret",value);value=await getJson<string>("escucha:session-secret",value);}
  storedSecret=value;
}

export function escuchaIsConfigured(){return principalUsers().length>0&&sessionSecret().length>=32;}

export async function validateEscuchaLogin(email:string,password:string){
  await ensureSessionSecret();
  if(!escuchaIsConfigured())return null;
  const submitted=email.trim().toLowerCase();
  let match:StoredUser|null=null;
  for(const user of await allUsers()){
    const ok=checkPassword(user.secret,password);
    if(constantTimeEqual(submitted,user.email)&&ok)match=user;
  }
  return match?publicUser(match):null;
}

export function createEscuchaSession(email:string){
  const expiresAt=Math.floor(Date.now()/1000)+SESSION_DURATION_SECONDS;
  const payload=Buffer.from(JSON.stringify({email,expiresAt,scope:"escucha"})).toString("base64url");
  const signature=createHmac("sha256",sessionSecret()).update(payload).digest("base64url");
  return {token:`${payload}.${signature}`,maxAge:SESSION_DURATION_SECONDS};
}

const cookieValue=(request:Request,name:string)=>request.headers.get("cookie")?.split(";").map(value=>value.trim()).find(value=>value.startsWith(`${name}=`))?.slice(name.length+1);

export async function authorizeEscuchaRequest(request:Request):Promise<EscuchaUser|null>{
  await ensureSessionSecret();
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
    // Una cuenta eliminada pierde el acceso de inmediato.
    const user=(await allUsers()).find(item=>item.email===parsed.email);
    return user?publicUser(user):null;
  }catch{return null;}
}

export const privateHeaders={"Cache-Control":"private, no-store","Vary":"Cookie","X-Robots-Tag":"noindex, nofollow"};
export const denied=(status=401,error="No autorizado.")=>Response.json({error},{status,headers:privateHeaders});

/** Autoriza las tareas automáticas: token OIDC de GitHub Actions o, si existe, CRON_SECRET. */
export async function authorizeCronRequest(request:Request){
  const header=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";
  if(!header)return false;
  const secret=process.env.CRON_SECRET||"";
  if(secret.length>=16&&constantTimeEqual(header,secret))return true;
  return verifyGithubOidc(header);
}
