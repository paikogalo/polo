import {randomInt} from "node:crypto";
import {communitySender,applicationsSender,emailChannelConfigured,escapeEmailHtml,sendEmail} from "@/lib/email";

const ALFABETO="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I para evitar confusiones

export function generarCodigoNodo(){
  let sufijo="";
  for(let i=0;i<6;i++)sufijo+=ALFABETO[randomInt(ALFABETO.length)];
  return `NODO-${sufijo}`;
}

export function nodoSender(){
  return (process.env.NODO_FROM_EMAIL||"").trim()||communitySender()||applicationsSender();
}

export const nodoEmailListo=()=>emailChannelConfigured(nodoSender());

export function siteUrl(request:Request){
  return (process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin).replace(/\/$/,"");
}

/** Modo de prueba solo para desarrollo local: sin Supabase y con NODO_DEMO=1 devuelve un código que no se guarda. */
export const nodoDemo=()=>process.env.NODO_DEMO==="1"&&process.env.VERCEL!=="1";

const marco=(contenido:string)=>`<div style="font-family:Arial,Helvetica,sans-serif;background:#F7FAFC;padding:28px"><div style="max-width:560px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden"><div style="height:6px;background:linear-gradient(90deg,#E63B32 0 20%,#2471C8 20% 40%,#27A9AD 40% 85%,#F7A713 85%)"></div><div style="padding:30px">${contenido}</div></div></div>`;

export async function enviarConfirmacionRegistro({correo,nombres,codigo,base}:{correo:string;nombres:string;codigo:string;base:string}){
  const misDatos=`${base}/nodo/mis-datos`;
  return sendEmail({
    from:nodoSender(),
    to:correo,
    subject:"Tu registro en NODO · Jóvenes Cotopaxi",
    idempotencyKey:`nodo-registro-${codigo}`,
    text:`Hola, ${nombres}. Tu registro para el piloto NODO quedó guardado. Tu código es ${codigo}.

Qué sigue: el equipo de NODO revisa los registros por cantón para conformar el piloto y te contactará por correo o WhatsApp sobre el programa. El registro es gratuito y voluntario, y no garantiza cupo, dinero ni beneficio alguno.

Tus datos solo se usan para conformar el piloto NODO y contactarte sobre el programa. Si quieres que los borremos, entra en ${misDatos} con tu correo y tu código.`,
    html:marco(`<div style="color:#0F6E73;font-weight:800;letter-spacing:.12em;font-size:12px">NODO · JÓVENES COTOPAXI</div>
<h1 style="color:#183247;font-size:24px;margin:10px 0 6px">¡Hola, ${escapeEmailHtml(nombres)}!</h1>
<p style="color:#183247;line-height:1.6">Tu registro para el piloto NODO quedó guardado. Este es tu código:</p>
<p style="font-size:26px;font-weight:800;color:#183247;background:#F7FAFC;border:2px dashed #27A9AD;border-radius:16px;padding:14px;text-align:center;letter-spacing:.08em">${codigo}</p>
<h2 style="color:#183247;font-size:17px;margin-top:24px">Qué sigue</h2>
<p style="color:#3c5568;line-height:1.6">El equipo de NODO revisa los registros por cantón para conformar el piloto y te contactará por correo o WhatsApp sobre el programa.</p>
<p style="color:#3c5568;line-height:1.6">El registro es gratuito y voluntario. No garantiza cupo, dinero ni beneficio alguno.</p>
<h2 style="color:#183247;font-size:17px;margin-top:24px">Tus datos</h2>
<p style="color:#3c5568;line-height:1.6">Solo se usan para conformar el piloto NODO y contactarte sobre el programa. Si quieres que los borremos, entra en <a href="${misDatos}" style="color:#0F6E73;font-weight:700">Mis datos</a> con tu correo y tu código.</p>`),
  });
}

export async function enviarEnlaceBorrado({correo,codigo,enlace}:{correo:string;codigo:string;enlace:string}){
  return sendEmail({
    from:nodoSender(),
    to:correo,
    subject:"Confirma el borrado de tus datos · NODO",
    idempotencyKey:`nodo-borrado-${codigo}-${Math.floor(Date.now()/600000)}`,
    text:`Recibimos una solicitud para borrar tu registro ${codigo} en NODO. Para confirmarla abre este enlace (vence en 24 horas): ${enlace}. Si no la pediste, ignora este correo: tus datos no cambian.`,
    html:marco(`<div style="color:#0F6E73;font-weight:800;letter-spacing:.12em;font-size:12px">NODO · JÓVENES COTOPAXI</div>
<h1 style="color:#183247;font-size:22px">Confirma el borrado de tus datos</h1>
<p style="color:#3c5568;line-height:1.6">Recibimos una solicitud para borrar tu registro <b>${codigo}</b>. Al confirmar, eliminaremos todos tus datos de NODO. Esta acción no se puede deshacer.</p>
<p style="margin:26px 0"><a href="${enlace}" style="background:#E63B32;color:#ffffff;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:700">Borrar mis datos</a></p>
<p style="font-size:12px;color:#5b6f80">El enlace vence en 24 horas. Si no pediste el borrado, ignora este correo: tus datos no cambian.</p>`),
  });
}
