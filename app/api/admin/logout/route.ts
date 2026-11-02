import {ADMIN_SESSION_COOKIE} from "@/lib/admin-session";

export async function POST(){
  const secure=process.env.NODE_ENV==="production"?"; Secure":"";
  return Response.json({ok:true},{headers:{"Cache-Control":"private, no-store","Set-Cookie":`${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`}});
}
