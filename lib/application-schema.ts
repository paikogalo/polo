import {z} from "zod";

export const applicationSchema=z.object({
  fullName:z.string().trim().min(3,"Escribe tus nombres completos").max(120),
  idNumber:z.string().trim().min(8,"Revisa tu número de identificación").max(15),
  email:z.string().trim().email("Correo no válido").max(150),
  phone:z.string().trim().min(7,"Revisa tu número de teléfono").max(20),
  canton:z.string().trim().min(2,"Indica tu cantón").max(80),
  parish:z.string().trim().max(80).optional().or(z.literal("")),
  profession:z.string().trim().min(2,"Indica tu profesión u oficio").max(120),
  education:z.string().trim().min(2,"Indica tu nivel de formación").max(120),
  experienceYears:z.coerce.number().min(0).max(60),
  interestArea:z.string().trim().min(2,"Selecciona un área de interés").max(120),
  profile:z.string().trim().min(80,"Cuéntanos un poco más sobre tu perfil").max(2000,"Máximo 2.000 caracteres"),
  consent:z.boolean().refine(Boolean,"Debes autorizar el tratamiento de tus datos"),
  website:z.string().max(0).optional(),
});

export type ApplicationInput=z.infer<typeof applicationSchema>;
