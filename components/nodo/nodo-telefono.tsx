import {NODO_ICON_SRC} from "@/lib/nodo/constants";

/**
 * Marco de teléfono con pantalla de scroll propio. En escritorio queda fijo a la izquierda (sticky)
 * mientras se recorre la página; en móvil se muestra en su sección con el mismo scroll interno.
 */
export function NodoTelefono({children}:{children:React.ReactNode}){
  return <div className="nodo-gradient-ring mx-auto w-full max-w-[390px] rounded-[3rem] p-[3px] shadow-[0_30px_80px_rgba(24,50,71,.35)]">
    <div className="rounded-[2.85rem] bg-navy p-2.5">
      <div className="relative flex h-[min(78vh,740px)] flex-col overflow-hidden rounded-[2.3rem] bg-white lg:h-[calc(100vh-8.5rem)] lg:max-h-[820px]">
        {/* barra de estado y "isla" */}
        <div className="relative flex h-9 shrink-0 items-center justify-between bg-white px-6 text-[11px] font-bold text-navy" aria-hidden="true">
          <span>9:41</span><span className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-navy"/><span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-navy/70"/><span className="h-2.5 w-5 rounded-[3px] border-2 border-navy/70"/></span>
        </div>
        <div className="nodo-gradient flex shrink-0 items-center gap-3 px-4 py-3 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={NODO_ICON_SRC} alt="" width={28} height={28} className="h-7 w-7"/></span>
          <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.18em] text-yellow">NODO · Jóvenes Cotopaxi</p><h2 id="registro-titulo" className="truncate text-base font-extrabold">Registro para el piloto</h2></div>
        </div>
        <div className="nodo-phone-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-sand" tabIndex={0} aria-labelledby="registro-titulo">
          {children}
        </div>
        <div className="flex h-6 shrink-0 items-center justify-center bg-sand" aria-hidden="true"><span className="h-1.5 w-28 rounded-full bg-navy/80"/></div>
      </div>
    </div>
  </div>;
}
