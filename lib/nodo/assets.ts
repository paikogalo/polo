import {existsSync,statSync} from "node:fs";
import path from "node:path";

/**
 * Archivos del kit oficial NODO (public/nodo/). Se comprueban al compilar:
 * si un archivo aún no se ha copiado, la página muestra "Disponible pronto" en vez de un enlace roto.
 * Si los MP4 se alojan fuera del repositorio (Supabase Storage o YouTube), se configuran con
 * NEXT_PUBLIC_NODO_VIDEO_720_URL y NEXT_PUBLIC_NODO_VIDEO_1080_URL.
 */
export type NodoAsset={href:string|null;bytes:number|null;nombre:string};

const publico=(archivo:string)=>path.join(process.cwd(),"public","nodo",archivo);

function local(archivo:string):NodoAsset{
  const ruta=publico(archivo);
  if(!existsSync(ruta))return {href:null,bytes:null,nombre:archivo};
  return {href:`/nodo/${archivo}`,bytes:statSync(ruta).size,nombre:archivo};
}

function remotoOLocal(url:string|undefined,archivo:string):NodoAsset{
  const limpia=url?.trim();
  if(limpia&&/^https:\/\//.test(limpia))return {href:limpia,bytes:null,nombre:archivo};
  return local(archivo);
}

export function nodoAssets(){
  const logoOficial=local("nodo-logo.svg");
  const logoBlancoOficial=local("nodo-logo-blanco.svg");
  return {
    pdf:local("nodo-propuesta.pdf"),
    video720:remotoOLocal(process.env.NEXT_PUBLIC_NODO_VIDEO_720_URL,"nodo-video-720.mp4"),
    video1080:remotoOLocal(process.env.NEXT_PUBLIC_NODO_VIDEO_1080_URL,"nodo-video-1080.mp4"),
    poster:local("nodo-video-poster.jpg"),
    subtitulos:local("nodo-video-es.vtt"),
    logo:logoOficial,
    /** Para mostrar en pantalla: el oficial si existe; si no, la versión provisional (nunca se ofrece para descargar). */
    logoBlancoSrc:logoBlancoOficial.href??"/nodo/provisional/nodo-logo-blanco.svg",
    kitCompleto:Boolean(logoOficial.href&&logoBlancoOficial.href),
  };
}

export function formatoTamano(bytes:number|null){
  if(!bytes)return null;
  if(bytes<1024*1024)return `${Math.round(bytes/1024)} KB`;
  return `${(bytes/1024/1024).toFixed(1).replace(".",",")} MB`;
}
