import {getJson,setJson} from "@/lib/escucha/store";

/**
 * Entrega automática al grupo de Telegram del equipo (Bot API oficial y gratuita).
 * ESCUCHA_TELEGRAM_BOT_TOKEN vive solo en Vercel. El grupo se elige desde el panel
 * (o con ESCUCHA_TELEGRAM_CHAT_ID).
 *
 * WhatsApp no se automatiza: su política prohíbe la plataforma a candidatos y campañas.
 */

const LIMIT=3900;
const CHAT_KEY="escucha:telegram-chat";
type ChatSetting={id:string;title:string};

const botToken=()=>process.env.ESCUCHA_TELEGRAM_BOT_TOKEN||"";
const api=(method:string)=>`https://api.telegram.org/bot${botToken()}/${method}`;

export async function telegramChat():Promise<ChatSetting|null>{
  const stored=await getJson<ChatSetting|null>(CHAT_KEY,null);
  if(stored)return stored;
  if(process.env.ESCUCHA_TELEGRAM_CHAT_ID)return {id:process.env.ESCUCHA_TELEGRAM_CHAT_ID,title:"Grupo configurado en Vercel"};
  return autoConnect();
}

/**
 * Conexión automática: si el bot ya está en un grupo, lo toma (prefiere el que se llama "Escucha…"),
 * lo guarda y envía un mensaje de bienvenida. No hace falta configurar nada en el panel.
 */
async function autoConnect():Promise<ChatSetting|null>{
  if(!botToken())return null;
  try{
    const chats=await detectChats();
    const chat=chats.find(item=>/escucha/i.test(item.title))||(chats.length===1?chats[0]:null);
    if(!chat)return null;
    await setTelegramChat(chat);
    await fetch(api("sendMessage"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chat.id,text:"✅ Escucha digital · De POLO a POLO conectada a este grupo.\n🔴 Alertas inmediatas\n🟠 Resumen del mediodía\n🟢 Resumen de la noche"})});
    return chat;
  }catch{return null;}
}

export async function telegramStatus(){
  const chat=await telegramChat();
  return {token:Boolean(botToken()),chat};
}

export async function setTelegramChat(chat:ChatSetting){await setJson(CHAT_KEY,chat);}

/** Lista los grupos donde se agregó el bot y alguien escribió recientemente. */
export async function detectChats(){
  if(!botToken())throw new Error("Falta ESCUCHA_TELEGRAM_BOT_TOKEN en Vercel.");
  const response=await fetch(api("getUpdates"),{cache:"no-store"});
  const data=await response.json() as {ok:boolean;result?:{message?:{chat:{id:number;title?:string;type:string}};my_chat_member?:{chat:{id:number;title?:string;type:string}}}[]};
  if(!data.ok)throw new Error("Telegram rechazó el token del bot.");
  const chats=new Map<string,ChatSetting>();
  for(const update of data.result||[]){
    const chat=update.message?.chat||update.my_chat_member?.chat;
    if(chat&&chat.type!=="private")chats.set(String(chat.id),{id:String(chat.id),title:chat.title||String(chat.id)});
  }
  return [...chats.values()];
}

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
  const chat=await telegramChat();
  if(!botToken()||!chat)return {sent:0,skipped:true as const};
  let sent=0;
  for(const part of chunks(text)){
    const response=await fetch(api("sendMessage"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chat.id,text:part,disable_web_page_preview:true})});
    if(!response.ok)throw new Error(`Telegram respondió HTTP ${response.status}`);
    sent+=1;
  }
  return {sent,skipped:false as const};
}
