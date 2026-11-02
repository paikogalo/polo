import {NextRequest,NextResponse} from "next/server";
import {applicationsSender,emailChannelConfigured,escapeEmailHtml,sendCampaignEmail} from "@/lib/email";
import {reportSchema} from "@/lib/schema";
import {adminSupabase} from "@/lib/supabase";

const attempts=new Map<string,{count:number;reset:number}>();
const clean=(value:FormDataEntryValue|null)=>typeof value==="string"?value.replace(/[<>]/g,"").trim():"";

export async function POST(request:NextRequest){
  try{
    const ip=request.headers.get("x-forwarded-for")?.split(",")[0]||"local";
    const now=Date.now();
    const entry=attempts.get(ip);
    if(entry&&entry.reset>now&&entry.count>=5)return NextResponse.json({error:"Has enviado varios reportes. Espera unos minutos e inténtalo nuevamente."},{status:429});
    attempts.set(ip,{count:entry&&entry.reset>now?entry.count+1:1,reset:now+10*60_000});

    const form=await request.formData();
    if(clean(form.get("website")))return NextResponse.json({error:"Solicitud no válida"},{status:400});
    const raw=Object.fromEntries(["full_name","phone","email","province","canton","parish","neighborhood","community","precinct","address_reference","category","urgency","description","website","turnstileToken"].map(key=>[key,clean(form.get(key))]));
    const latitude=clean(form.get("latitude"));
    const longitude=clean(form.get("longitude"));
    const parsed=reportSchema.safeParse({...raw,latitude:latitude?Number(latitude):undefined,longitude:longitude?Number(longitude):undefined,consent:form.get("consent")==="true"});
    if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Revisa los datos enviados"},{status:400});

    const images=form.getAll("images").filter((value):value is File=>value instanceof File);
    if(images.length>3||images.some(file=>file.size>5*1024*1024||!["image/jpeg","image/png","image/webp"].includes(file.type)))return NextResponse.json({error:"Las fotografías no cumplen los límites permitidos"},{status:400});

    if(process.env.TURNSTILE_SECRET_KEY&&process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY){
      const token=raw.turnstileToken;
      if(!token)return NextResponse.json({error:"Completa la verificación de seguridad"},{status:400});
      const verify=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:token,remoteip:ip})});
      const result=await verify.json() as {success:boolean};
      if(!result.success)return NextResponse.json({error:"No fue posible validar la verificación de seguridad"},{status:400});
    }

    const supabase=adminSupabase();
    let code=`HC-LAT-${String(Math.floor(100000+Math.random()*900000))}`;
    if(supabase){
      const {data,error}=await supabase.from("territorial_reports").insert({...parsed.data,category:parsed.data.category||null,urgency:parsed.data.urgency||null,latitude:parsed.data.latitude||null,longitude:parsed.data.longitude||null,source:"web"}).select("id,registration_code").single();
      if(error)throw error;
      code=data.registration_code;
      for(const [index,file] of images.entries()){
        const extension=file.name.split(".").pop()?.toLowerCase()||"jpg";
        const path=`${data.id}/${crypto.randomUUID()}-${index}.${extension}`;
        const upload=await supabase.storage.from("report-images").upload(path,await file.arrayBuffer(),{contentType:file.type});
        if(upload.error)throw upload.error;
        await supabase.from("report_images").insert({report_id:data.id,storage_path:path,image_url:path});
      }
    }

    let emailSent=false;
    const from=applicationsSender();
    if(emailChannelConfigured(from)){
      const data=parsed.data;
      const attachments=await Promise.all(images.map(async(file,index)=>({
        filename:`necesidad-${index+1}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g,"_"),
        content:Buffer.from(await file.arrayBuffer()).toString("base64"),
      })));
      try{
        const emailResult=await sendCampaignEmail({
          from,
          replyTo:data.email||undefined,
          idempotencyKey:`territorial-report-${code}`,
          subject:`Nueva necesidad territorial · ${data.canton||"Cotopaxi"} · ${code}`,
          html:`<h2>Nueva necesidad territorial</h2><p><b>Código:</b> ${escapeEmailHtml(code)}</p><p><b>Nombre:</b> ${escapeEmailHtml(data.full_name||"No indicado")}</p><p><b>Correo:</b> ${escapeEmailHtml(data.email||"No indicado")}</p><p><b>Teléfono:</b> ${escapeEmailHtml(data.phone||"No indicado")}</p><p><b>Territorio:</b> ${escapeEmailHtml([data.province,data.canton,data.parish,data.neighborhood,data.community,data.precinct].filter(Boolean).join(" / ")||"No indicado")}</p><p><b>Referencia:</b> ${escapeEmailHtml(data.address_reference||"No indicada")}</p><p><b>Categoría:</b> ${escapeEmailHtml(data.category||"No indicada")}</p><p><b>Urgencia:</b> ${escapeEmailHtml(data.urgency||"No indicada")}</p><p><b>Ubicación:</b> ${data.latitude!==undefined&&data.longitude!==undefined?`${data.latitude}, ${data.longitude}`:"No compartida"}</p><p><b>Necesidad o propuesta:</b><br>${escapeEmailHtml(data.description||"Sin descripción").replace(/\n/g,"<br>")}</p>`,
          attachments,
        });
        emailSent=emailResult.sent;
      }catch(error){
        console.error(JSON.stringify({level:"error",message:"territorial_report_email_failed",error:error instanceof Error?error.message:String(error)}));
        if(!supabase)throw error;
      }
    }

    return NextResponse.json({registrationCode:code,mode:supabase?"supabase":"local",emailSent},{status:201});
  }catch(error){
    console.error(error);
    return NextResponse.json({error:"No pudimos registrar tu aporte. Inténtalo nuevamente."},{status:500});
  }
}
