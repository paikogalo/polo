export type ChatPrefill={
  fullName:string;
  email:string;
  phone:string;
  message:string;
};

const CHAT_PREFILL_KEY="hipolito-chat-prefill";
export const CHAT_PREFILL_EVENT="hipolito-chat-prefill-ready";

export function saveChatPrefill(value:ChatPrefill){
  if(typeof window==="undefined")return;
  window.sessionStorage.setItem(CHAT_PREFILL_KEY,JSON.stringify(value));
}

export function notifyChatPrefill(){
  if(typeof window!=="undefined")window.dispatchEvent(new Event(CHAT_PREFILL_EVENT));
}

export function takeChatPrefill():ChatPrefill|null{
  if(typeof window==="undefined")return null;
  const raw=window.sessionStorage.getItem(CHAT_PREFILL_KEY);
  if(!raw)return null;
  window.sessionStorage.removeItem(CHAT_PREFILL_KEY);
  try{
    const value=JSON.parse(raw) as Partial<ChatPrefill>;
    if(typeof value.fullName!=="string"||typeof value.email!=="string"||typeof value.phone!=="string"||typeof value.message!=="string")return null;
    return {fullName:value.fullName,email:value.email,phone:value.phone,message:value.message};
  }catch{return null}
}
