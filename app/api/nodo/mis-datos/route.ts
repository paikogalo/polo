import {createHash,randomBytes} from "node:crypto";
import {nodoBorradoSchema} from "@/lib/nodo/schema";
import {enviarEnlaceBorrado,siteUrl} from "@/lib/nodo/server";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {adminSupabase} from "@/lib/supabase";

const RESPUESTA="Si el correo y el código coinciden con un registro, te enviamos un enlace para confirmar el borrado. Revisa tu bandeja de entrada y la carpeta de spam.";

/** Paso 1: la persona pide el borrado con su correo y su código. Siempre se responde lo mismo para no revelar si existe un registro. */
export async function POST(request:Request){
  if(!rateLimit(`nodo:borrado:${requestIp(request)}`,5,60*60*1000))return Response.json({error:"Demasiados intentos. Inténtalo nuevamente en una hora."},{status:429});
  const parsed=nodoBorradoSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message||"Revisa el correo y el código."},{status:400});
  if(parsed.data.website)return Response.json({ok:true,message:RESPUESTA});

  const database=adminSupabase();
  if(!database)return Response.json({error:"Esta función se está habilitando. Mientras tanto, escribe a info@depoloapoloavanzamoscotopaxi.com con tu código."},{status:503});

  try{
    const {data:registro,error}=await database.from("nodo_registros").select("id,codigo,correo").eq("codigo",parsed.data.codigo).eq("correo",parsed.data.correo).maybeSingle();
    if(error)throw new Error(error.message);
    if(registro){
      const token=randomBytes(32).toString("hex");
      const tokenHash=createHash("sha256").update(token).digest("hex");
      const {error:tokenError}=await database.from("nodo_borrado_tokens").insert({registro_id:registro.id,token_hash:tokenHash,expires_at:new Date(Date.now()+24*60*60*1000).toISOString()});
      if(tokenError)throw new Error(tokenError.message);
      const enlace=`${siteUrl(request)}/nodo/mis-datos?token=${token}`;
      const enviado=await enviarEnlaceBorrado({correo:registro.correo,codigo:registro.codigo,enlace});
      if(!enviado.sent)return Response.json({error:"No pudimos enviar el correo de confirmación. Escribe a info@depoloapoloavanzamoscotopaxi.com con tu código."},{status:503});
    }
    return Response.json({ok:true,message:RESPUESTA});
  }catch(error){
    console.error(JSON.stringify({level:"error",message:"nodo_borrado_failed",error:error instanceof Error?error.message:String(error)}));
    return Response.json({error:"No pudimos procesar la solicitud. Inténtalo nuevamente en unos minutos."},{status:500});
  }
}
