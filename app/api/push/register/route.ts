import {pushRegistrationSchema} from "@/lib/community-schema";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {adminSupabase} from "@/lib/supabase";
import {z} from "zod";

export async function POST(request:Request){
  if(!rateLimit(`push:${requestIp(request)}`,8,60*60*1000))return Response.json({error:"Demasiados intentos."},{status:429});
  const parsed=pushRegistrationSchema.safeParse(await request.json());
  if(!parsed.success)return Response.json({error:"Registro de notificaciones no válido."},{status:400});
  const database=adminSupabase();
  if(!database)return Response.json({error:"Las notificaciones aún están siendo configuradas."},{status:503});
  const {error}=await database.from("push_subscriptions").upsert({
    token:parsed.data.token,
    platform:parsed.data.platform,
    email:parsed.data.email||null,
    source:parsed.data.source||"app",
    consent:true,
    consent_version:parsed.data.consentVersion||"1",
    last_active_at:new Date().toISOString(),
    disabled_at:null,
  },{onConflict:"token"});
  if(error)return Response.json({error:"No se pudo activar las notificaciones."},{status:500});
  return Response.json({ok:true});
}

export async function DELETE(request:Request){
  if(!rateLimit(`push-delete:${requestIp(request)}`,12,60*60*1000))return Response.json({error:"Demasiados intentos."},{status:429});
  const parsed=z.object({token:z.string().trim().min(12).max(500)}).safeParse(await request.json());
  if(!parsed.success)return Response.json({error:"Token no válido."},{status:400});
  const database=adminSupabase();
  if(!database)return Response.json({error:"Las notificaciones aún están siendo configuradas."},{status:503});
  const {error}=await database.from("push_subscriptions").update({disabled_at:new Date().toISOString()}).eq("token",parsed.data.token);
  if(error)return Response.json({error:"No se pudo desactivar la alerta."},{status:500});
  return Response.json({ok:true});
}
