import {socialNetworks} from "@/lib/social";

/** Enlaces oficiales de redes (desde las variables NEXT_PUBLIC_SOCIAL_*) para páginas estáticas como /kawsay. */
export function GET(){
  return Response.json({redes:socialNetworks.filter(red=>red.href).map(({name,href})=>({name,href}))},{headers:{"Cache-Control":"public, max-age=300, s-maxage=600"}});
}
