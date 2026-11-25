import {randomInt} from "node:crypto";
import {z} from "zod";
import {applicationsSender,emailChannelConfigured,escapeEmailHtml,sendCampaignEmail} from "@/lib/email";
import {calcularEdad} from "@/lib/nodo/schema";
import {cedulaValida} from "@/lib/becas/cedula";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {adminSupabase} from "@/lib/supabase";

export const runtime="nodejs";

const CANTONES=["Latacunga","La Maná","Pangua","Pujilí","Salcedo","Saquisilí","Sigchos"] as const;
const PRIORIDAD=["si","no","nd"] as const;
const ALFABETO="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const texto=(min:number,max:number,msg:string)=>z.string().trim().min(min,msg).max(max);
const schema=z.object({
  cedula:z.string().trim().refine(cedulaValida,"Ingresa una cédula válida de 10 dígitos."),
  nombres:texto(2,80,"Escribe tus nombres."),
  apellidos:texto(2,80,"Escribe tus apellidos."),
  fecha_nacimiento:z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/,"Indica tu fecha de nacimiento."),
  celular:z.string().trim().regex(/^09\d{8}$/,"Celular de 10 dígitos que empiece con 09."),
  correo:z.string().trim().toLowerCase().email("Revisa el correo.").max(160).optional().or(z.literal("")),
  provincia:z.enum(["Cotopaxi","Otra provincia"]),
  canton:z.string().trim().max(40).optional().or(z.literal("")),
  parroquia:texto(2,140,"Escribe tu parroquia, barrio o comunidad."),
  zona:z.enum(["urbana","rural"]).optional(),
  nivel:texto(2,80,"Elige tu nivel académico."),
  carrera:texto(2,120,"Elige una carrera."),
  modalidad:z.enum(["virtual","hibrida"]).optional(),
  tipo_estudiante:z.enum(["primera","retoma","trabaja"]).optional(),
  prioridad_violencia:z.enum(PRIORIDAD).default("nd"),
  prioridad_discapacidad:z.enum(PRIORIDAD).default("nd"),
  consentimiento_datos:z.literal(true,{errorMap:()=>({message:"Marca las dos autorizaciones para enviar."})}),
  consentimiento_sin_garantia:z.literal(true,{errorMap:()=>({message:"Marca las dos autorizaciones para enviar."})}),
  website:z.string().max(0).optional().or(z.literal("")),
  origen:z.string().max(40).optional(),
}).superRefine((d,ctx)=>{
  if(d.provincia==="Cotopaxi"&&!(CANTONES as readonly string[]).includes(d.canton||""))ctx.addIssue({code:"custom",path:["canton"],message:"Elige tu cantón."});
});

const json=(body:unknown,status=200)=>Response.json(body,{status});
const codigoNuevo=()=>{let s="";for(let i=0;i<6;i++)s+=ALFABETO[randomInt(ALFABETO.length)];return `BECA-${s}`;};

export async function POST(request:Request){
  const cuerpo=await request.json().catch(()=>null);
  const parsed=schema.safeParse(cuerpo);
  if(!parsed.success)return json({error:parsed.error.issues[0]?.message||"Revisa los datos del formulario."},400);
  const d=parsed.data;
  if(d.website)return json({codigo:codigoNuevo()}); // trampa para robots: no se guarda nada
  if(!rateLimit(`becas:ip:${requestIp(request)}`,6,60*60*1000))return json({error:"Hiciste varios envíos seguidos. Inténtalo nuevamente en una hora."},429);

  const edad=calcularEdad(d.fecha_nacimiento);
  if(edad===null)return json({error:"Revisa tu fecha de nacimiento."},400);
  if(edad<18)return json({error:"El registro es para mayores de 18 años."},422);

  const fila={
    cedula:d.cedula,nombres:d.nombres,apellidos:d.apellidos,fecha_nacimiento:d.fecha_nacimiento,edad,
    celular:d.celular,correo:d.correo||null,provincia:d.provincia,canton:d.provincia==="Cotopaxi"?d.canton:null,
    parroquia:d.parroquia,zona:d.zona||null,nivel:d.nivel,carrera:d.carrera,modalidad:d.modalidad||null,
    tipo_estudiante:d.tipo_estudiante||null,prioridad_violencia:d.prioridad_violencia,prioridad_discapacidad:d.prioridad_discapacidad,
    consentimiento_datos:true,consentimiento_sin_garantia:true,origen:d.origen==="app"?"app":"web",
  };

  let codigo=codigoNuevo();
  let guardado=false;
  const db=adminSupabase();
  if(db){
    for(let intento=0;intento<4;intento++){
      const {error}=await db.from("becas_registros").insert({...fila,codigo});
      if(!error){guardado=true;break;}
      if(error.code==="23505"&&/cedula/i.test(`${error.message} ${error.details||""}`))return json({error:"Esta cédula ya tiene un registro de interés. No necesitas registrarte otra vez."},409);
      if(error.code==="23505"){codigo=codigoNuevo();continue;}
      console.error(JSON.stringify({level:"error",message:"becas_registro_db_failed",code:error.code,error:error.message}));
      break;
    }
  }

  // Respaldo: si la base no está lista, el registro llega al correo de la campaña.
  let enviado=false;
  const from=applicationsSender();
  if(!guardado&&emailChannelConfigured(from)){
    const f=(k:string,v:string|null|undefined)=>`<p><b>${k}:</b> ${escapeEmailHtml(v||"—")}</p>`;
    try{
      const r=await sendCampaignEmail({
        from,idempotencyKey:`becas-${codigo}`,
        subject:`Becas · nuevo registro · ${fila.canton||fila.provincia} · ${codigo}`,
        html:`<h2>Nuevo registro de interés en Becas De Polo a Polo</h2>${f("Código",codigo)}${f("Cédula",fila.cedula)}${f("Nombres",`${fila.nombres} ${fila.apellidos}`)}${f("Edad",String(edad))}${f("Celular",fila.celular)}${f("Correo",fila.correo)}${f("Ubicación",[fila.provincia,fila.canton,fila.parroquia,fila.zona].filter(Boolean).join(" · "))}${f("Nivel",fila.nivel)}${f("Carrera",fila.carrera)}${f("Modalidad",fila.modalidad)}${f("Tipo de estudiante",fila.tipo_estudiante)}${f("Prioridad declarada (violencia / discapacidad)",`${fila.prioridad_violencia} / ${fila.prioridad_discapacidad}`)}<p style="color:#888">Datos confidenciales: uso exclusivo del programa de becas.</p>`,
      });
      enviado=r.sent;
    }catch(e){console.error(JSON.stringify({level:"error",message:"becas_registro_email_failed",error:e instanceof Error?e.message:String(e)}));}
  }

  if(!guardado&&!enviado){
    console.warn(JSON.stringify({level:"warn",message:"becas_registro_not_configured"}));
    return json({error:"El registro se está habilitando. Inténtalo nuevamente en unos minutos o escríbenos por WhatsApp."},503);
  }
  console.log(JSON.stringify({level:"info",message:"becas_registro_ok",guardado,enviado}));
  return json({codigo},201);
}
