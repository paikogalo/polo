/** Llamada mínima a la API de mensajes de Anthropic. Devuelve null si no hay clave o si falla. */
export type Turno={role:"user"|"assistant";content:string};

export async function claude(options:{system?:string;messages:Turno[];maxTokens:number;model?:string;timeoutMs?:number}){
  const key=process.env.ANTHROPIC_API_KEY;
  if(!key)return null;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),options.timeoutMs||50_000);
  try{
    const response=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      signal:controller.signal,
      headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:options.model||process.env.KAWSAY_MODEL||"claude-sonnet-5-5",max_tokens:options.maxTokens,...(options.system?{system:options.system}:{}),messages:options.messages}),
    });
    if(!response.ok){console.error(JSON.stringify({level:"error",message:"kawsay_ai_failed",status:response.status}));return null;}
    const data=await response.json() as {content?:{type:string;text?:string}[]};
    return (data.content||[]).filter(block=>block.type==="text").map(block=>block.text||"").join("").trim()||null;
  }catch(error){
    console.error(JSON.stringify({level:"error",message:"kawsay_ai_error",error:error instanceof Error?error.message:String(error)}));
    return null;
  }finally{clearTimeout(timer);}
}
