/**
 * Entrega automática al grupo de Telegram del equipo (Bot API oficial y gratuita).
 * Requiere ESCUCHA_TELEGRAM_BOT_TOKEN y ESCUCHA_TELEGRAM_CHAT_ID en Vercel.
 *
 * WhatsApp no se automatiza: la política de WhatsApp Business prohíbe su plataforma
 * a candidatos y campañas, y los clientes no oficiales provocan bloqueos de número.
 * El panel ofrece un botón "Compartir por WhatsApp" para reenvío manual.
 */

const LIMIT=3900;

export const telegramIsConfigured=()=>Boolean(process.env.ESCUCHA_TELEGRAM_BOT_TOKEN&&process.env.ESCUCHA_TELEGRAM_CHAT_ID);

function chunks(text:string){
  const parts:string[]=[];let current="";
  for(const line of text.split("\n")){
    if((current+"\n"+line).length>LIMIT){parts.push(current);current=line;}
    else current=current?`${current}\n${line}`:line;
  }
  if(current)parts.push(current);
  return parts;
}

export async function sendTelegram(text:string){
  if(!telegramIsConfigured())return {sent:0,skipped:true as const};
  let sent=0;
  for(const part of chunks(text)){
    const response=await fetch(`https://api.telegram.org/bot${process.env.ESCUCHA_TELEGRAM_BOT_TOKEN}/sendMessage`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({chat_id:process.env.ESCUCHA_TELEGRAM_CHAT_ID,text:part,disable_web_page_preview:true}),
    });
    if(!response.ok)throw new Error(`Telegram respondió HTTP ${response.status}`);
    sent+=1;
  }
  return {sent,skipped:false as const};
}
