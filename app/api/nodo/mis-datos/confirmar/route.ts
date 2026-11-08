import {createHash} from "node:crypto";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {adminSupabase} from "@/lib/supabase";

/**
 * Paso 2: la persona abre el enlace del correo y pulsa "Borrar mis datos".
 * Se usa POST (no GET) para que los antivirus que abren enlaces de correo no borren nada por accidente.
 * Al borrar el registro, los tokens se eliminan en cascada.
 */
export async function POST(request:Request){
  if(!rateLimit(`nodo:confirmar:${requestIp(request)}`,10,60*60*1000))return Response.json({estado:"error"},{status:429});
  const body=await request.json().catch(()=>null) as {token?:unknown}|null;
  const token=typeof body?.token==="string"?body.token:"";
  if(!/^[a-f0-9]{64}$/.test(token))return Response.json({estado:"invalido"},{status:400});
  const database=adminSupabase();
  if(!database)return Response.json({estado:"error"},{status:503});
  try{
    const tokenHash=createHash("sha256").update(token).digest("hex");
    const {data,error}=await database.from("nodo_borrado_tokens").select("registro_id,expires_at").eq("token_hash",tokenHash).maybeSingle();
    if(error)throw new Error(error.message);
    if(!data||new Date(data.expires_at).getTime()<Date.now())return Response.json({estado:"invalido"},{status:410});
    const {error:deleteError}=await database.from("nodo_registros").delete().eq("id",data.registro_id);
    if(deleteError)throw new Error(deleteError.message);
    return Response.json({estado:"eliminado"});
  }catch(error){
    console.error(JSON.stringify({level:"error",message:"nodo_borrado_confirm_failed",error:error instanceof Error?error.message:String(error)}));
    return Response.json({estado:"error"},{status:500});
  }
}
