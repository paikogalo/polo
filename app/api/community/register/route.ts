import {createHash,randomBytes} from "crypto";
import {communityRegistrationSchema} from "@/lib/community-schema";
import {communitySender,emailChannelConfigured,escapeEmailHtml,sendCampaignEmail,sendEmail} from "@/lib/email";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {adminSupabase} from "@/lib/supabase";

export async function POST(request:Request){
  const started=Date.now();
  const requestId=request.headers.get("x-vercel-id");
  console.log(JSON.stringify({level:"info",message:"community_registration_started",requestId}));
  if(!rateLimit(`community:${requestIp(request)}`,4,60*60*1000))return Response.json({error:"Demasiados intentos. Inténtalo nuevamente más tarde."},{status:429});
  try{
    const parsed=communityRegistrationSchema.safeParse(await request.json());
    if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message||"Revisa los datos ingresados."},{status:400});
    if(parsed.data.website)return Response.json({ok:true});
    const database=adminSupabase();
    const from=communitySender();
    if(!database||!emailChannelConfigured(from)){
      console.warn(JSON.stringify({level:"warn",message:"community_registration_not_configured",ms:Date.now()-started}));
      return Response.json({error:"El registro está listo, pero el canal de confirmación todavía está siendo configurado."},{status:503});
    }

    const token=randomBytes(32).toString("hex");
    const tokenHash=createHash("sha256").update(token).digest("hex");
    const unsubscribeToken=randomBytes(32).toString("hex");
    const unsubscribeTokenHash=createHash("sha256").update(unsubscribeToken).digest("hex");
    const {error:databaseError}=await database.from("community_registration_requests").upsert({
      created_at:new Date().toISOString(),
      full_name:parsed.data.fullName,
      email:parsed.data.email.toLowerCase(),
      phone:parsed.data.phone||null,
      canton:parsed.data.canton||null,
      parish:parsed.data.parish||null,
      neighborhood:parsed.data.neighborhood||null,
      age_range:parsed.data.ageRange||null,
      gender:parsed.data.gender||null,
      interests:parsed.data.interests,
      consent_communications:true,
      consent_version:"community-v1",
      confirmation_token_hash:tokenHash,
      unsubscribe_token_hash:unsubscribeTokenHash,
      expires_at:new Date(Date.now()+24*60*60*1000).toISOString(),
      source:parsed.data.source,
    },{onConflict:"email"});
    if(databaseError)throw new Error(databaseError.message);

    const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin;
    const confirmationUrl=`${siteUrl.replace(/\/$/,"")}/api/community/confirm?token=${encodeURIComponent(token)}`;
    const confirmationResult=await sendEmail({
      from,
      to:parsed.data.email,
      subject:"Confirma tu registro · Hipólito Carrera",
      text:`Hola, ${parsed.data.fullName}. Confirma tu registro voluntario en ${confirmationUrl}. El enlace vence en 24 horas. Si no solicitaste el registro, ignora este mensaje.`,
      html:`<div style="font-family:Arial,sans-serif;background:#f7f3ea;padding:32px"><div style="max-width:560px;margin:auto;background:#fff;border-radius:24px;padding:32px"><div style="color:#24aab0;font-weight:700">TU TERRITORIO TIENE VOZ</div><h1 style="color:#173148">Hola, ${escapeEmailHtml(parsed.data.fullName)}</h1><p style="color:#526678;line-height:1.6">Confirma tu correo para completar tu registro voluntario y recibir novedades oficiales. Los datos opcionales de edad, género y territorio se usarán únicamente en estadísticas agrupadas.</p><p style="margin:28px 0"><a href="${confirmationUrl}" style="background:#ef3d34;color:#fff;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:700">Confirmar mi correo</a></p><p style="font-size:12px;color:#71808d">El enlace vence en 24 horas. Si no solicitaste este registro, ignora el mensaje: tus datos no pasarán a la comunidad confirmada.</p></div></div>`,
      idempotencyKey:`community-${tokenHash.slice(0,24)}`,
    });
    if(!confirmationResult.sent)throw new Error("El canal de confirmación no está configurado");

    try{
      await sendCampaignEmail({
        from,
        replyTo:parsed.data.email,
        subject:`Nuevo registro de comunidad: ${parsed.data.fullName}`,
        html:`<h2>Nuevo registro pendiente de confirmación</h2><p><b>Nombre:</b> ${escapeEmailHtml(parsed.data.fullName)}</p><p><b>Correo:</b> ${escapeEmailHtml(parsed.data.email)}</p><p><b>Origen:</b> ${escapeEmailHtml(parsed.data.source)}</p><p>El registro se incorporará a la comunidad únicamente cuando la persona confirme su correo. Los datos demográficos opcionales se mantienen fuera de este aviso y se consultan únicamente de forma agregada en el panel autorizado.</p>`,
        idempotencyKey:`community-admin-${tokenHash.slice(0,24)}`,
      });
    }catch(notificationError){
      console.error(JSON.stringify({level:"error",message:"community_admin_email_failed",error:notificationError instanceof Error?notificationError.message:String(notificationError)}));
    }
    console.log(JSON.stringify({level:"info",message:"community_registration_completed",ms:Date.now()-started}));
    return Response.json({ok:true,message:"Revisa tu correo para confirmar el registro."});
  }catch(error){
    console.error(JSON.stringify({level:"error",message:"community_registration_failed",error:error instanceof Error?error.message:String(error),ms:Date.now()-started}));
    return Response.json({error:"No pudimos completar el registro. Inténtalo nuevamente."},{status:500});
  }
}
