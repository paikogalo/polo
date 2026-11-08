export const NODO_PATH="/nodo";
export const NODO_SITE_URL="https://www.depoloapoloavanzamoscotopaxi.com";

export const cantones=["Latacunga","Pujilí","Salcedo","Saquisilí","Sigchos","La Maná","Pangua"] as const;
export const generos=["Mujer","Hombre","Otro","Prefiero no decir"] as const;
export const estudiosOpciones=["Colegio en curso","Bachiller","Técnico/Tecnológico","Universidad en curso","Universitario","Otro"] as const;
export const ocupaciones=["Estudio","Trabajo","Estudio y trabajo","Ninguna por ahora"] as const;
export const intereses=[
  "Flores y claveles",
  "Artesanías de Pujilí, Salcedo y Latacunga",
  "Caretas y figuras de la Mama Negra",
  "Ponchos y tejidos",
  "Vino de mortiño",
  "Cerámica y regalos",
  "Leche, papa, maíz y agroturismo",
  "Apps y tecnología",
  "Otro",
] as const;
export const etapas=["Tengo una idea","Ya empecé","Ya vendo"] as const;
export const comoNosConociste=["Afiche/QR","Redes sociales","Video","Amigos","Colegio/Universidad","Otro"] as const;
export const estadosRegistro=["nuevo","contactado","seleccionado_piloto","descartado"] as const;
export const rangosEdad=["16–17","18–24","25–30"] as const;

export const EDAD_MIN=16;
export const EDAD_MAX=30;
export const MENSAJE_FUERA_DE_EDAD="NODO está pensado para jóvenes de 16 a 30 años. ¡Gracias por tu interés!";

export type NodoUbicacion="menu"|"home"|"chatbot"|"app";
export const nodoHref=(ubicacion:NodoUbicacion,hash="")=>`${NODO_PATH}?utm_source=${ubicacion}${hash}`;

export function rangoEdad(edad:number){
  if(edad<=17)return "16–17";
  if(edad<=24)return "18–24";
  return "25–30";
}

/** Ícono de la sección. Hoy es provisional; al copiar el kit se reemplaza en el mismo nombre de archivo. */
export const NODO_ICON_SRC="/nodo/nodo-icono.svg";
