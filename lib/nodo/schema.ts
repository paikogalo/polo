import {z} from "zod";
import {EDAD_MAX,EDAD_MIN,MENSAJE_FUERA_DE_EDAD,cantones,comoNosConociste,estudiosOpciones,etapas,generos,intereses,ocupaciones} from "@/lib/nodo/constants";

/** Fecha de hoy en Ecuador continental (UTC-5), para que la edad no cambie según el servidor. */
export function hoyEcuador(now=new Date()){
  const partes=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Guayaquil",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
  const valor=(tipo:string)=>Number(partes.find(p=>p.type===tipo)?.value);
  return {y:valor("year"),m:valor("month"),d:valor("day")};
}

/** Edad cumplida a partir de una fecha AAAA-MM-DD. Devuelve null si la fecha no es válida. */
export function calcularEdad(fecha:string,now=new Date()){
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if(!match)return null;
  const [y,m,d]=[Number(match[1]),Number(match[2]),Number(match[3])];
  const check=new Date(Date.UTC(y,m-1,d));
  if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d)return null;
  const hoy=hoyEcuador(now);
  let edad=hoy.y-y;
  if(hoy.m<m||(hoy.m===m&&hoy.d<d))edad-=1;
  return edad>=0&&edad<130?edad:null;
}

export const edadEnRango=(edad:number|null)=>edad!==null&&edad>=EDAD_MIN&&edad<=EDAD_MAX;

export function normalizarWhatsapp(valor:string){
  const limpio=valor.replace(/[\s\-().]/g,"");
  if(/^09\d{8}$/.test(limpio))return `+593${limpio.slice(1)}`;
  if(/^\+5939\d{8}$/.test(limpio))return limpio;
  return null;
}

const opcional=(max:number)=>z.string().trim().max(max).optional().or(z.literal(""));

export const nodoRegistroSchema=z.object({
  nombres:z.string().trim().min(3,"Escribe tus nombres y apellidos (mínimo 3 caracteres).").max(120,"Máximo 120 caracteres."),
  fecha_nacimiento:z.string().trim().min(1,"Indica tu fecha de nacimiento."),
  genero:z.enum(generos).optional().or(z.literal("")),
  canton:z.enum(cantones,{errorMap:()=>({message:"Elige tu cantón."})}),
  parroquia:z.string().trim().min(2,"Escribe tu parroquia.").max(100),
  comunidad_barrio:opcional(140),
  correo:z.string().trim().toLowerCase().email("Escribe un correo válido.").max(180),
  whatsapp:z.string().trim().refine(v=>normalizarWhatsapp(v)!==null,"Usa el formato 09XXXXXXXX o +5939XXXXXXXX."),
  estudios:z.enum(estudiosOpciones,{errorMap:()=>({message:"Elige tu nivel de estudios."})}),
  ocupacion:z.enum(ocupaciones,{errorMap:()=>({message:"Elige tu ocupación."})}),
  intereses:z.array(z.enum(intereses)).min(1,"Elige al menos un interés."),
  etapa:z.enum(etapas,{errorMap:()=>({message:"Cuéntanos en qué etapa estás."})}),
  idea:z.string().trim().max(500,"Máximo 500 caracteres.").optional().or(z.literal("")),
  necesidad:z.string().trim().max(300,"Máximo 300 caracteres.").optional().or(z.literal("")),
  participaria_piloto:z.enum(["si","no"],{errorMap:()=>({message:"Responde si te gustaría participar en el piloto."})}),
  como_nos_conociste:z.enum(comoNosConociste).optional().or(z.literal("")),
  consentimiento_datos:z.boolean().refine(Boolean,"Necesitamos tu autorización para tratar tus datos."),
  consentimiento_sin_garantia:z.boolean().refine(Boolean,"Debes confirmar que entiendes que el registro no garantiza cupo ni beneficios."),
  consentimiento_adolescente:z.boolean().optional(),
  acepta_novedades:z.boolean().default(false),
  website:z.string().max(0).optional().or(z.literal("")),
  utm_source:opcional(60),
  utm_medium:opcional(60),
  utm_campaign:opcional(80),
}).superRefine((data,ctx)=>{
  const edad=calcularEdad(data.fecha_nacimiento);
  if(edad===null){ctx.addIssue({code:z.ZodIssueCode.custom,path:["fecha_nacimiento"],message:"Escribe una fecha de nacimiento válida."});return;}
  if(!edadEnRango(edad)){ctx.addIssue({code:z.ZodIssueCode.custom,path:["fecha_nacimiento"],message:MENSAJE_FUERA_DE_EDAD});return;}
  if(edad<18&&!data.consentimiento_adolescente)ctx.addIssue({code:z.ZodIssueCode.custom,path:["consentimiento_adolescente"],message:"Para registrarte con 16 o 17 años debes marcar esta autorización."});
});

export type NodoRegistroInput=z.input<typeof nodoRegistroSchema>;
export type NodoRegistro=z.output<typeof nodoRegistroSchema>;

export const nodoBorradoSchema=z.object({
  correo:z.string().trim().toLowerCase().email("Escribe un correo válido.").max(180),
  codigo:z.string().trim().toUpperCase().regex(/^NODO-[A-Z0-9]{6}$/,"El código tiene el formato NODO-XXXXXX."),
  website:z.string().max(0).optional().or(z.literal("")),
});
