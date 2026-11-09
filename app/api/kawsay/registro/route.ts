import {z} from "zod";
import {emailChannelConfigured,applicationsSender,escapeEmailHtml,sendCampaignEmail} from "@/lib/email";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {adminSupabase} from "@/lib/supabase";

export const runtime="nodejs";

const texto=(max:number)=>z.string().trim().max(max).optional().default("");
const foto=z.string().max(300_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/,"Foto no válida");
const CANTONES={lat:"Latacunga",puj:"Pujilí",sal:"Salcedo",saq:"Saquisilí",sig:"Sigchos",man:"La Maná",pan:"Pangua"} as const;
const CATEGORIAS={comer:"Dónde comer",dormir:"Dónde dormir",experiencias:"Experiencias",compras:"Artesanía y compras",noche:"Vida nocturna"} as const;

const schema=z.object({
  perfil:z.string().trim().min(2).max(60),
  nombre:z.string().trim().min(2,"Escribe el nombre del negocio").max(120),
  cat:z.enum(Object.keys(CATEGORIAS) as [keyof typeof CATEGORIAS]),
  sub:z.string().trim().min(2).max(80),
  canton:z.enum(Object.keys(CANTONES) as [keyof typeof CANTONES]),
  parroquia:texto(120),dir:z.string().trim().min(3).max(240),horario:texto(120),precio:texto(10),
  desc:z.string().trim().min(30,"La descripción necesita al menos 30 caracteres").max(400),
  idiomas:z.array(z.string().max(30)).max(6).default([]),serv:z.array(z.string().max(40)).max(12).default([]),
  resp:z.string().trim().min(2).max(120),cargo:texto(80),
  wa:z.string().trim().regex(/^(0?9\d{8}|\+?5939\d{8})$/,"Revisa el número de WhatsApp"),
  email:z.string().trim().email("Revisa el correo").max(160).optional().or(z.literal("")),
  redes:texto(200),ruc:z.string().trim().regex(/^(\d{13})?$/,"El RUC o RIMPE tiene 13 dígitos").optional().default(""),
  fotos:z.array(foto).min(2,"Sube al menos dos fotos").max(5),
  docs:z.array(z.string().max(80)).max(8).default([]),
  autoriza:z.literal(true,{errorMap:()=>({message:"Necesitamos tu autorización para usar las fotos"})}),
  datos:z.literal(true,{errorMap:()=>({message:"Acepta el uso de tus datos para continuar"})}),
  boletin:z.boolean().default(false),claim:texto(120),website:z.string().max(0).optional(),
});

export async function POST(request:Request){
  const ip=requestIp(request);
  if(!rateLimit(`kawsay-registro:${ip}`,5,30*60_000))return Response.json({error:"Enviaste varias solicitudes seguidas. Espera unos minutos."},{status:429});
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  if(body&&typeof body.wa==="string")body.wa=body.wa.replace(/[\s-]/g,"");
  const parsed=schema.safeParse(body);
  if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message||"Revisa los datos enviados."},{status:400});
  const {fotos,website,...datos}=parsed.data;
  void website;
  const codigo=`KAW-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

  let guardado=false;
  const db=adminSupabase();
  if(db){
    const {data,error}=await db.from("kawsay_registros").insert({codigo,nombre:datos.nombre,canton:datos.canton,categoria:datos.cat,tipo:datos.sub,whatsapp:datos.wa,email:datos.email||null,acepta_boletin:datos.boletin,datos,estado:"pendiente"}).select("id").single();
    if(error)console.error(JSON.stringify({level:"error",message:"kawsay_registro_db_failed",error:error.message}));
    else{
      guardado=true;
      for(const [index,dataUrl] of fotos.entries()){
        const [meta,base64]=dataUrl.split(",");
        const type=meta.slice(5,meta.indexOf(";"));
        const upload=await db.storage.from("kawsay-fotos").upload(`${data.id}/${index+1}.${type.split("/")[1]}`,Buffer.from(base64,"base64"),{contentType:type});
        if(upload.error)console.error(JSON.stringify({level:"error",message:"kawsay_foto_failed",error:upload.error.message}));
      }
    }
  }

  let enviado=false;
  const from=applicationsSender();
  if(emailChannelConfigured(from)){
    const fila=(etiqueta:string,valor:string)=>`<p><b>${etiqueta}:</b> ${escapeEmailHtml(valor||"—")}</p>`;
    try{
      const result=await sendCampaignEmail({
        from,replyTo:datos.email||undefined,idempotencyKey:`kawsay-registro-${codigo}`,
        subject:`Kawsay · nuevo negocio · ${datos.nombre} · ${CANTONES[datos.canton]} · ${codigo}`,
        html:`<h2>Nuevo registro de negocio en Kawsay</h2>${fila("Código",codigo)}${fila("Negocio",datos.nombre)}${datos.claim?fila("Reclama la ficha",datos.claim):""}${fila("Perfil",datos.perfil)}${fila("Categoría",`${CATEGORIAS[datos.cat]} · ${datos.sub}`)}${fila("Cantón",`${CANTONES[datos.canton]}${datos.parroquia?` · ${datos.parroquia}`:""}`)}${fila("Dirección",datos.dir)}${fila("Horario",datos.horario)}${fila("Precios",datos.precio)}${fila("Descripción",datos.desc)}${fila("Idiomas",datos.idiomas.join(", "))}${fila("Servicios",datos.serv.join(", "))}${fila("Responsable",`${datos.resp}${datos.cargo?` (${datos.cargo})`:""}`)}${fila("WhatsApp",datos.wa)}${fila("Correo",datos.email||"")}${fila("Redes",datos.redes)}${fila("RUC/RIMPE",datos.ruc)}${fila("Documentos",datos.docs.join(", "))}${fila("Acepta recibir información de la campaña",datos.boletin?"Sí":"No")}`,
        attachments:fotos.map((dataUrl,index)=>({filename:`${codigo}-foto-${index+1}.jpg`,content:dataUrl.split(",")[1]})),
      });
      enviado=result.sent;
    }catch(error){console.error(JSON.stringify({level:"error",message:"kawsay_registro_email_failed",error:error instanceof Error?error.message:String(error)}));}
  }

  if(!guardado&&!enviado)return Response.json({error:"El registro todavía no está habilitado. Inténtalo más tarde o escríbenos por WhatsApp."},{status:503});
  return Response.json({codigo},{status:201});
}
