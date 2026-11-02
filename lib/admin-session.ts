import {createHash,createHmac,timingSafeEqual} from "node:crypto";
import {isAdminIdentity} from "@/lib/admin-auth";
import {adminSupabase} from "@/lib/supabase";

export const ADMIN_SESSION_COOKIE="hc_admin_session";
const SESSION_DURATION_SECONDS=8*60*60;

const constantTimeEqual=(left:string,right:string)=>{
  const leftBuffer=Buffer.from(left);
  const rightBuffer=Buffer.from(right);
  return leftBuffer.length===rightBuffer.length&&timingSafeEqual(leftBuffer,rightBuffer);
};

const configuredAdminEmail=()=>
  (process.env.ADMIN_EMAIL||process.env.ADMIN_EMAILS?.split(",")[0]||"").trim().toLowerCase();

export function passwordAdminIsConfigured(){
  return Boolean(configuredAdminEmail()&&process.env.ADMIN_PASSWORD_SHA256&&process.env.ADMIN_SESSION_SECRET);
}

export function validatePasswordAdmin(email:string,password:string){
  if(!passwordAdminIsConfigured())return false;
  const submittedEmail=email.trim().toLowerCase();
  const submittedHash=createHash("sha256").update(password).digest("hex");
  return constantTimeEqual(submittedEmail,configuredAdminEmail())&&constantTimeEqual(submittedHash,process.env.ADMIN_PASSWORD_SHA256!);
}

export function createPasswordAdminSession(email:string){
  const expiresAt=Math.floor(Date.now()/1000)+SESSION_DURATION_SECONDS;
  const payload=Buffer.from(JSON.stringify({email:email.trim().toLowerCase(),expiresAt})).toString("base64url");
  const signature=createHmac("sha256",process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url");
  return {token:`${payload}.${signature}`,maxAge:SESSION_DURATION_SECONDS};
}

function verifyPasswordAdminSession(token:string|undefined){
  if(!token||!passwordAdminIsConfigured())return null;
  const [payload,signature]=token.split(".");
  if(!payload||!signature)return null;
  const expected=createHmac("sha256",process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url");
  if(!constantTimeEqual(signature,expected))return null;
  try{
    const parsed=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as {email?:string;expiresAt?:number};
    if(parsed.email!==configuredAdminEmail()||!parsed.expiresAt||parsed.expiresAt<Math.floor(Date.now()/1000))return null;
    return parsed.email;
  }catch{return null;}
}

const cookieValue=(request:Request,name:string)=>request.headers.get("cookie")?.split(";").map(value=>value.trim()).find(value=>value.startsWith(`${name}=`))?.slice(name.length+1);

export async function authorizeAdminRequest(request:Request){
  const cookieEmail=verifyPasswordAdminSession(cookieValue(request,ADMIN_SESSION_COOKIE));
  if(cookieEmail)return {email:cookieEmail,method:"password" as const};

  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  const database=adminSupabase();
  if(!database||!token)return null;
  const {data,error}=await database.auth.getUser(token);
  if(error||!data.user||!isAdminIdentity(data.user))return null;
  return {email:data.user.email||"administrador",method:"supabase" as const};
}

