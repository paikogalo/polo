import {NextRequest,NextResponse} from "next/server";
import {applicationSchema} from "@/lib/application-schema";
import {applicationsSender,emailChannelConfigured,escapeEmailHtml,sendCampaignEmail} from "@/lib/email";

const attempts=new Map<string,{count:number;reset:number}>();
const allowedTypes=new Set(["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
const fileNames=["cv","experienceFile","coverLetter"] as const;
const clean=(value:FormDataEntryValue|null)=>typeof value==="string"?value.trim():"";

export async function POST(request:NextRequest){
  try{
    const ip=request.headers.get("x-forwarded-for")?.split(",")[0]||"local";
    const now=Date.now();
    const entry=attempts.get(ip);
    if(entry&&entry.reset>now&&entry.count>=3)return NextResponse.json({error:"Has enviado varios perfiles. Espera una hora e inténtalo nuevamente."},{status:429});
    attempts.set(ip,{count:entry&&entry.reset>now?entry.count+1:1,reset:now+60*60_000});

    const form=await request.formData();
    if(clean(form.get("website")))return NextResponse.json({error:"Solicitud no válida"},{status:400});
    const parsed=applicationSchema.safeParse({
      fullName:clean(form.get("fullName")),
      idNumber:clean(form.get("idNumber")),
      email:clean(form.get("email")),
      phone:clean(form.get("phone")),
      canton:clean(form.get("canton")),
      parish:clean(form.get("parish")),
      profession:clean(form.get("profession")),
      education:clean(form.get("education")),
      experienceYears:clean(form.get("experienceYears")),
      interestArea:clean(form.get("interestArea")),
      profile:clean(form.get("profile")),
      consent:form.get("consent")==="true",
      website:clean(form.get("website")),
    });
    if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Revisa la información enviada"},{status:400});

    const documents=fileNames
      .map(name=>({name,file:form.get(name)}))
      .filter((item):item is {name:typeof fileNames[number];file:File}=>item.file instanceof File&&item.file.size>0);
    if(!documents.some(item=>item.name==="cv"))return NextResponse.json({error:"Debes adjuntar tu hoja de vida o CV"},{status:400});
    const total=documents.reduce((sum,item)=>sum+item.file.size,0);
    if(total>4*1024*1024||documents.some(item=>!allowedTypes.has(item.file.type)))return NextResponse.json({error:"Los documentos deben ser PDF, DOC o DOCX y no superar 4 MB en total"},{status:400});

    const from=applicationsSender();
    if(!emailChannelConfigured(from))return NextResponse.json({error:"El canal de recepción de perfiles está en proceso de configuración. Inténtalo nuevamente más tarde."},{status:503});
    const attachments=await Promise.all(documents.map(async({name,file})=>({
      filename:`${name}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g,"_"),
      content:Buffer.from(await file.arrayBuffer()).toString("base64"),
    })));
    const data=parsed.data;
    const result=await sendCampaignEmail({
      from,
      replyTo:data.email,
      subject:`Nuevo perfil profesional: ${data.fullName}`,
      html:`<h2>Nuevo perfil para Trabaja con nosotros</h2><p><b>Nombre:</b> ${escapeEmailHtml(data.fullName)}</p><p><b>Identificación:</b> ${escapeEmailHtml(data.idNumber)}</p><p><b>Correo:</b> ${escapeEmailHtml(data.email)}</p><p><b>Teléfono:</b> ${escapeEmailHtml(data.phone)}</p><p><b>Ubicación:</b> ${escapeEmailHtml(data.canton)} / ${escapeEmailHtml(data.parish||"No indicada")}</p><p><b>Profesión:</b> ${escapeEmailHtml(data.profession)}</p><p><b>Formación:</b> ${escapeEmailHtml(data.education)}</p><p><b>Experiencia:</b> ${data.experienceYears} años</p><p><b>Área:</b> ${escapeEmailHtml(data.interestArea)}</p><p><b>Perfil:</b><br>${escapeEmailHtml(data.profile).replace(/\n/g,"<br>")}</p>`,
      attachments,
    });
    if(!result.sent)throw new Error("El canal de correo no está configurado");
    return NextResponse.json({ok:true},{status:201});
  }catch(error){
    console.error(error);
    return NextResponse.json({error:"No fue posible enviar tu perfil. Inténtalo nuevamente."},{status:500});
  }
}
