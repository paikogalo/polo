import {fallbackSocialUpdates} from "@/lib/social-feed";
import {adminSupabase} from "@/lib/supabase";
import {z} from "zod";

const socialDomains=["facebook.com","instagram.com","tiktok.com","youtube.com","youtu.be","x.com","twitter.com","flickr.com","linkedin.com","whatsapp.com","wa.me"];
const isHttps=(value:string)=>{try{return new URL(value).protocol==="https:"}catch{return false}};
const isSocialUrl=(value:string)=>{try{const host=new URL(value).hostname.toLowerCase();return isHttps(value)&&socialDomains.some(domain=>host===domain||host.endsWith(`.${domain}`))}catch{return false}};
const updateSchema=z.object({
  externalId:z.string().trim().min(1).max(200),
  platform:z.string().trim().min(2).max(40),
  title:z.string().trim().min(3).max(180),
  excerpt:z.string().trim().max(500).default(""),
  url:z.string().url().max(1000).refine(isSocialUrl,"La publicación debe pertenecer a una red social admitida."),
  imageUrl:z.string().url().max(1000).refine(isHttps,"La imagen debe usar HTTPS.").optional().or(z.literal("")),
  publishedAt:z.string().datetime({offset:true}),
});

export async function GET(){
  const database=adminSupabase();
  if(!database)return Response.json({updates:fallbackSocialUpdates,configured:false},{headers:{"Cache-Control":"public, max-age=60, s-maxage=300"}});
  const {data,error}=await database.from("social_updates").select("id,platform,title,excerpt,url,image_url,published_at").order("published_at",{ascending:false}).limit(12);
  if(error||!data?.length)return Response.json({updates:fallbackSocialUpdates,configured:false},{headers:{"Cache-Control":"public, max-age=60, s-maxage=300"}});
  return Response.json({configured:true,updates:data.map(item=>({id:item.id,platform:item.platform,title:item.title,excerpt:item.excerpt,url:item.url,imageUrl:item.image_url||undefined,publishedAt:item.published_at}))},{headers:{"Cache-Control":"public, max-age=60, s-maxage=300"}});
}

export async function POST(request:Request){
  const secret=process.env.SOCIAL_WEBHOOK_SECRET;
  if(!secret||request.headers.get("x-social-webhook-secret")!==secret)return Response.json({error:"No autorizado."},{status:401});
  const parsed=updateSchema.safeParse(await request.json());
  if(!parsed.success)return Response.json({error:"Novedad no válida."},{status:400});
  const database=adminSupabase();
  if(!database)return Response.json({error:"Base de datos no configurada."},{status:503});
  const payload={external_id:parsed.data.externalId,platform:parsed.data.platform,title:parsed.data.title,excerpt:parsed.data.excerpt,url:parsed.data.url,image_url:parsed.data.imageUrl||null,published_at:parsed.data.publishedAt};
  const inserted=await database.from("social_updates").insert(payload).select("id").single();
  let data=inserted.data;
  if(inserted.error?.code==="23505"){
    const updated=await database.from("social_updates").update(payload).eq("external_id",parsed.data.externalId).select("id").single();
    if(updated.error)return Response.json({error:"No se pudo actualizar la novedad."},{status:500});
    return Response.json({ok:true,id:updated.data.id,updated:true,pushRecipients:0});
  }
  if(inserted.error||!data)return Response.json({error:"No se pudo guardar la novedad."},{status:500});

  const {data:subscriptions}=await database.from("push_subscriptions").select("token").is("disabled_at",null).eq("consent",true).limit(500);
  const expoTokens=(subscriptions||[]).map(item=>item.token).filter(token=>token.startsWith("ExponentPushToken[")||token.startsWith("ExpoPushToken["));
  if(expoTokens.length){
    const messages=expoTokens.map(to=>({to,title:`Nueva publicación en ${parsed.data.platform}`,body:parsed.data.title,data:{url:parsed.data.url,updateId:data.id},sound:"default"}));
    for(let index=0;index<messages.length;index+=100){
      const response=await fetch("https://exp.host/--/api/v2/push/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(messages.slice(index,index+100))});
      if(!response.ok)console.error(JSON.stringify({level:"error",message:"expo_push_failed",status:response.status}));
    }
  }
  console.log(JSON.stringify({level:"info",message:"social_update_ingested",platform:parsed.data.platform,pushRecipients:expoTokens.length}));
  return Response.json({ok:true,id:data.id,pushRecipients:expoTokens.length});
}
