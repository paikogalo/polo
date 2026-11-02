import {ESCUCHA_SESSION_COOKIE,privateHeaders} from "@/lib/escucha/auth";

export async function POST(){
  const secure=process.env.NODE_ENV==="production"?"; Secure":"";
  return Response.json({ok:true},{headers:{...privateHeaders,"Set-Cookie":`${ESCUCHA_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`}});
}
