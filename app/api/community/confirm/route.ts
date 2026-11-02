import {createHash} from "crypto";
import {adminSupabase} from "@/lib/supabase";

export async function GET(request:Request){
  const token=new URL(request.url).searchParams.get("token");
  const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin;
  if(!token||token.length!==64)return Response.redirect(`${siteUrl}/?registro=error`);
  const database=adminSupabase();
  if(!database)return Response.redirect(`${siteUrl}/?registro=configuracion`);
  const tokenHash=createHash("sha256").update(token).digest("hex");
  const {data:memberId,error:confirmationError}=await database.rpc("confirm_community_member",{p_token_hash:tokenHash});
  if(memberId)return Response.redirect(`${siteUrl}/?registro=confirmado`);
  if(confirmationError)console.error(JSON.stringify({level:"error",message:"community_confirmation_failed",error:confirmationError.message}));

  // Compatibilidad con enlaces emitidos antes de incorporar solicitudes pendientes.
  const {data,error}=await database.from("community_members").update({confirmed_at:new Date().toISOString(),confirmation_token_hash:null}).eq("confirmation_token_hash",tokenHash).select("id").maybeSingle();
  return Response.redirect(`${siteUrl}/?registro=${!error&&data?"confirmado":"error"}`);
}
