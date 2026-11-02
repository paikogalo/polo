import {socialNetworks} from "@/lib/social";

export function SocialDock(){
  return <aside className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-white/25 bg-deep/95 p-1.5 shadow-2xl backdrop-blur lg:bottom-auto lg:left-auto lg:right-3 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:flex-col lg:gap-1 lg:p-2" aria-label="Accesos rápidos a redes sociales">
    {socialNetworks.map(({name,href,icon:Icon})=><a key={name} href={href||"/redes"} target={href?"_blank":undefined} rel={href?"noreferrer":undefined} aria-label={name} className="grid h-8 w-8 place-items-center rounded-full text-white transition hover:scale-110 hover:bg-coral lg:h-9 lg:w-9"><Icon size={16}/></a>)}
  </aside>;
}
