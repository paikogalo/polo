const DEFAULT_CAMPAIGN_RECIPIENT="info@depoloapoloavanzamoscotopaxi.com";

type EmailAttachment={
  filename:string;
  content:string;
};

type EmailOptions={
  to:string|string[];
  subject:string;
  from?:string;
  replyTo?:string;
  text?:string;
  html?:string;
  attachments?:EmailAttachment[];
  idempotencyKey?:string;
};

export type EmailResult={sent:true}|{sent:false;reason:"not-configured"};

const configuredEmail=(value:string|undefined)=>value?.trim()||"";

export function campaignRecipient(){
  return configuredEmail(process.env.CONTACT_TO_EMAIL)
    ||configuredEmail(process.env.APPLICATIONS_TO_EMAIL)
    ||DEFAULT_CAMPAIGN_RECIPIENT;
}

export function applicationsSender(){
  return configuredEmail(process.env.APPLICATIONS_FROM_EMAIL)
    ||configuredEmail(process.env.COMMUNITY_FROM_EMAIL);
}

export function communitySender(){
  return configuredEmail(process.env.COMMUNITY_FROM_EMAIL)
    ||configuredEmail(process.env.APPLICATIONS_FROM_EMAIL);
}

export function emailChannelConfigured(from?:string){
  return Boolean(configuredEmail(process.env.RESEND_API_KEY)&&configuredEmail(from));
}

export function escapeEmailHtml(value:string){
  return value.replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]||char));
}

export async function sendEmail(options:EmailOptions):Promise<EmailResult>{
  const apiKey=configuredEmail(process.env.RESEND_API_KEY);
  const from=configuredEmail(options.from)||applicationsSender();
  if(!apiKey||!from)return {sent:false,reason:"not-configured"};

  const headers:Record<string,string>={
    Authorization:`Bearer ${apiKey}`,
    "Content-Type":"application/json",
  };
  if(options.idempotencyKey)headers["Idempotency-Key"]=options.idempotencyKey;

  const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers,
    body:JSON.stringify({
      from,
      to:Array.isArray(options.to)?options.to:[options.to],
      subject:options.subject,
      ...(options.replyTo?{reply_to:options.replyTo}:{}),
      ...(options.text?{text:options.text}:{}),
      ...(options.html?{html:options.html}:{}),
      ...(options.attachments?.length?{attachments:options.attachments}:{}),
    }),
  });
  if(!response.ok)throw new Error(`Resend ${response.status}`);
  return {sent:true};
}

export function sendCampaignEmail(options:Omit<EmailOptions,"to">){
  return sendEmail({...options,to:campaignRecipient()});
}
