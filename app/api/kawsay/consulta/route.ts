import {z} from "zod";
import {applicationsSender,emailChannelConfigured,escapeEmailHtml,sendCampaignEmail} from "@/lib/email";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {adminSupabase} from "@/lib/supabase";

export const runtime="nodejs";

const texto=(max:number)=>z.string().trim().max(max).optional().default("");
const schema=z.object({
  nombre:z.string().trim().min(2,"Escribe tu nombre").max(120),
  pais:texto(80),
  contacto:z.string().trim().min(5,"Escribe tu WhatsApp o correo").max(160),
  fechas:texto(120),mensaje:texto(1000),pedido:texto(1500),plan:texto(200),
  total:z.coerce.number().min(0).max(10_000_000).optional().default(0),
  detalle:texto(6000),website:z.string().max(0).optional(),
});

export async function POST(request:Request){
  const ip=requestIp(request);
  if(!rateLimit(`kawsay-consulta:${ip}`,5,30*60_000))return Response.json({error:"Enviaste varias solicitudes seguidas. Espera unos minutos."},{status:429});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message||"Revisa los datos enviados."},{status:400});
  const {website,...datos}=parsed.data;
  void website;
  const codigo=`VIA-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

  let guardado=false;
  const db=adminSupabase();
  if(db){
    const {error}=await db.from("kawsay_consultas").insert({codigo,nombre:datos.nombre,pais:datos.pais||null,contacto:datos.contacto,datos,estado:"nueva"});
    if(error)console.error(JSON.stringify({level:"error",message:"kawsay_consulta_db_failed",error:error.message}));
    else guardado=true;
  }
  let enviado=false;
  const from=applicationsSender();
  if(emailChannelConfigured(from)){
    try{
      const result=await sendCampaignEmail({
        from,replyTo:datos.contacto.includes("@")?datos.contacto:undefined,idempotencyKey:`kawsay-consulta-${codigo}`,
        subject:`Kawsay · viajero pide asesoría · ${datos.nombre}${datos.pais?` · ${datos.pais}`:""} · ${codigo}`,
        html:`<h2>Viajero que pide asesoría</h2><p><b>Código:</b> ${codigo}</p><p><b>Nombre:</b> ${escapeEmailHtml(datos.nombre)}</p><p><b>País:</b> ${escapeEmailHtml(datos.pais||"—")}</p><p><b>Contacto:</b> ${escapeEmailHtml(datos.contacto)}</p><p><b>Fechas:</b> ${escapeEmailHtml(datos.fechas||"—")}</p><p><b>Mensaje:</b> ${escapeEmailHtml(datos.mensaje||"—")}</p><p><b>Pedido:</b> ${escapeEmailHtml(datos.pedido||"—")}</p><p><b>Plan elegido:</b> ${escapeEmailHtml(datos.plan||"—")} · ${datos.total} USD (estimado)</p><pre style="white-space:pre-wrap">${escapeEmailHtml(datos.detalle)}</pre>`,
      });
      enviado=result.sent;
    }catch(error){console.error(JSON.stringify({level:"error",message:"kawsay_consulta_email_failed",error:error instanceof Error?error.message:String(error)}));}
  }
  if(!guardado&&!enviado)return Response.json({error:"La asesoría todavía no está habilitada. Inténtalo más tarde."},{status:503});
  return Response.json({codigo},{status:201});
}
