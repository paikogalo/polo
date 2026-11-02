import {socialNetworks} from "@/lib/social";

export function SocialLinks({light=false}:{light?:boolean}){
  return <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Redes sociales">
    {socialNetworks.map(({name,href,icon:Icon})=><a key={name} href={href||"/redes"} target={href?"_blank":undefined} rel={href?"noreferrer":undefined} aria-label={href?`Abrir ${name}`:`Ver ${name} en la página de redes`} title={name} className={`grid h-10 w-10 place-items-center rounded-full transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean ${light?"bg-white/10 text-white hover:bg-coral":"bg-deep text-white hover:bg-coral"}`}><Icon size={18} aria-hidden="true"/></a>)}
  </div>
}
