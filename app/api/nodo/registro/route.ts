import {MENSAJE_FUERA_DE_EDAD} from "@/lib/nodo/constants";
import {calcularEdad,edadEnRango,nodoRegistroSchema,normalizarWhatsapp} from "@/lib/nodo/schema";
import {enviarConfirmacionRegistro,generarCodigoNodo,nodoDemo,siteUrl} from "@/lib/nodo/server";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {adminSupabase} from "@/lib/supabase";

const json=(body:unknown,status=200)=>Response.json(body,{status});

export async function POST(request:Request){
  const started=Date.now();
  let cuerpo:unknown;
  try{cuerpo=await request.json();}catch{return json({error:"No pudimos leer el formulario. Recarga la página e inténtalo de nuevo."},400);}

  // La edad se calcula siempre en el servidor; nunca se confía en el cliente.
  const fecha=typeof (cuerpo as {fecha_nacimiento?:unknown})?.fecha_nacimiento==="string"?(cuerpo as {fecha_nacimiento:string}).fecha_nacimiento:"";
  const edad=calcularEdad(fecha);
  if(edad!==null&&!edadEnRango(edad))return json({error:MENSAJE_FUERA_DE_EDAD,fueraDeEdad:true},422);

  const parsed=nodoRegistroSchema.safeParse(cuerpo);
  if(!parsed.success)return json({error:parsed.error.issues[0]?.message||"Revisa los datos del formulario."},400);
  const data=parsed.data;
  if(data.website)return json({codigo:generarCodigoNodo()}); // honeypot: respuesta normal, no se guarda nada

  if(!rateLimit(`nodo:ip:${requestIp(request)}`,5,60*60*1000))return json({error:"Hiciste demasiados envíos seguidos. Inténtalo nuevamente en una hora."},429);
  // "1 registro por correo" lo garantiza el índice único nodo_registros_correo_uq (ver supabase/schema.sql).

  const edadServidor=calcularEdad(data.fecha_nacimiento)!;
  if(edadServidor<18&&!data.consentimiento_adolescente)return json({error:"Para registrarte con 16 o 17 años debes marcar la autorización adicional."},400);

  const database=adminSupabase();
  if(!database){
    if(nodoDemo())return json({codigo:generarCodigoNodo(),demo:true});
    console.warn(JSON.stringify({level:"warn",message:"nodo_registro_not_configured"}));
    return json({error:"El registro de NODO se está habilitando. Inténtalo nuevamente en unas horas."},503);
  }

  const fila={
    nombres:data.nombres,
    fecha_nacimiento:data.fecha_nacimiento,
    edad:edadServidor,
    genero:data.genero||null,
    canton:data.canton,
    parroquia:data.parroquia,
    comunidad_barrio:data.comunidad_barrio||null,
    correo:data.correo,
    whatsapp:normalizarWhatsapp(data.whatsapp)!,
    estudios:data.estudios,
    ocupacion:data.ocupacion,
    intereses:data.intereses,
    etapa:data.etapa,
    idea:data.idea||null,
    necesidad:data.necesidad||null,
    participaria_piloto:data.participaria_piloto==="si",
    como_nos_conociste:data.como_nos_conociste||null,
    consentimiento_datos:true,
    consentimiento_sin_garantia:true,
    consentimiento_adolescente:edadServidor<18?true:null,
    acepta_novedades:Boolean(data.acepta_novedades),
    origen:data.utm_source==="app"?"app":"web",
    utm_source:data.utm_source||null,
    utm_medium:data.utm_medium||null,
    utm_campaign:data.utm_campaign||null,
  };

  try{
    let codigo="";
    for(let intento=0;intento<4;intento++){
      codigo=generarCodigoNodo();
      const {error}=await database.from("nodo_registros").insert({...fila,codigo});
      if(!error)break;
      if(error.code==="23505"&&/correo/i.test(`${error.message} ${error.details||""}`))return json({error:"Este correo ya está registrado en NODO. Si quieres corregir tus datos, pide el borrado en Mis datos y vuelve a registrarte."},409);
      if(error.code==="23505"&&intento<3)continue; // código repetido: se genera otro
      throw new Error(error.message);
    }

    try{
      const enviado=await enviarConfirmacionRegistro({correo:data.correo,nombres:data.nombres,codigo,base:siteUrl(request)});
      if(!enviado.sent)console.warn(JSON.stringify({level:"warn",message:"nodo_email_not_configured"}));
    }catch(errorCorreo){
      console.error(JSON.stringify({level:"error",message:"nodo_email_failed",error:errorCorreo instanceof Error?errorCorreo.message:String(errorCorreo)}));
    }
    console.log(JSON.stringify({level:"info",message:"nodo_registro_ok",ms:Date.now()-started}));
    return json({codigo});
  }catch(error){
    console.error(JSON.stringify({level:"error",message:"nodo_registro_failed",error:error instanceof Error?error.message:String(error)}));
    return json({error:"No pudimos completar tu registro. Inténtalo nuevamente en unos minutos."},500);
  }
}
