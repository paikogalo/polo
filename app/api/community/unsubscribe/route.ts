import {createHash} from "crypto";
import {adminSupabase} from "@/lib/supabase";

export async function GET(request:Request){
  const token=new URL(request.url).searchParams.get("token");
  const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin;
  if(!token||token.length!==64)return Response.redirect(`${siteUrl}/?suscripcion=error`);
  const database=adminSupabase();
  if(!database)return Response.redirect(`${siteUrl}/?suscripcion=error`);
  const tokenHash=createHash("sha256").update(token).digest("hex");
  const {data,error}=await database.from("community_members").update({unsubscribed_at:new Date().toISOString(),consent_communications:false,unsubscribe_token_hash:null}).eq("unsubscribe_token_hash",tokenHash).select("id").maybeSingle();
  if(!error&&data)return Response.redirect(`${siteUrl}/?suscripcion=cancelada`);
  const {data:pending,error:pendingError}=await database.from("community_registration_requests").delete().eq("unsubscribe_token_hash",tokenHash).select("id").maybeSingle();
  return Response.redirect(`${siteUrl}/?suscripcion=${!pendingError&&pending?"cancelada":"error"}`);
}
