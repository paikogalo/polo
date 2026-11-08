import {Facebook,Instagram,MessageCircle,Youtube} from "lucide-react";
import {socialNetworks} from "@/lib/social";

/** Botones de Facebook, Instagram, YouTube y WhatsApp con las cuentas oficiales configuradas en NEXT_PUBLIC_SOCIAL_*. */
const redes=[
  {name:"Facebook",icon:Facebook,cls:"bg-[#1460D6] text-white"},
  {name:"Instagram",icon:Instagram,cls:"bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white"},
  {name:"YouTube",icon:Youtube,cls:"bg-[#D70000] text-white"},
  {name:"WhatsApp",icon:MessageCircle,cls:"bg-[#0E7A3E] text-white"},
] as const;

export function NodoSocial({compacto=false}:{compacto?:boolean}){
  return <ul className={`flex flex-wrap gap-2 ${compacto?"justify-center":""}`} aria-label="Síguenos en redes sociales">
    {redes.map(r=>{
      const href=socialNetworks.find(s=>s.name===r.name)?.href||"";
      const Icon=r.icon;
      return <li key={r.name}><a href={href||"/redes"} target={href?"_blank":undefined} rel={href?"noopener noreferrer":undefined}
        aria-label={href?`${r.name} (se abre en otra pestaña)`:`${r.name}: ver en la página de redes`}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full font-extrabold shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow motion-reduce:transform-none ${compacto?"w-11 justify-center px-0":"px-4 text-sm"} ${r.cls}`}>
        <Icon size={18} aria-hidden="true"/>{!compacto&&r.name}
      </a></li>;
    })}
  </ul>;
}
