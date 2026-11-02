import {z} from "zod";

export const ageRanges=["18–24","25–34","35–44","45–54","55 o más"] as const;
export const genderOptions=["Mujer","Hombre","Otro","Prefiero no indicar"] as const;
export const communityInterests=["Voluntariado","Propuestas","Eventos","Producción y empleo","Ambiente y agua","Vialidad","Contenido digital"] as const;

export const communityRegistrationSchema=z.object({
  fullName:z.string().trim().min(3,"Escribe tu nombre completo").max(120),
  email:z.string().trim().email("Correo no válido").max(180),
  phone:z.string().trim().max(30).optional().or(z.literal("")),
  canton:z.string().trim().max(100).optional().or(z.literal("")),
  parish:z.string().trim().max(100).optional().or(z.literal("")),
  neighborhood:z.string().trim().max(140).optional().or(z.literal("")),
  ageRange:z.enum(ageRanges).optional().or(z.literal("")),
  gender:z.enum(genderOptions).optional().or(z.literal("")),
  interests:z.array(z.enum(communityInterests)).max(5).default([]),
  consentCommunications:z.boolean().refine(Boolean,"Debes confirmar que eres mayor de 18 años y autorizar el envío de novedades"),
  website:z.string().max(0).optional(),
  source:z.enum(["web","ios","android"]).default("web"),
});

export const pushRegistrationSchema=z.object({
  token:z.string().trim().min(12).max(500),
  platform:z.enum(["ios","android","web"]),
  email:z.string().trim().email().optional().or(z.literal("")),
  consent:z.boolean().refine(Boolean),
  source:z.string().trim().max(80).optional(),
  consentVersion:z.string().trim().max(20).optional(),
});

export type CommunityRegistration=z.infer<typeof communityRegistrationSchema>;
