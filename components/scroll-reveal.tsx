"use client";
import {useEffect,useRef} from "react";
import {usePathname} from "next/navigation";

/**
 * Animaciones de entrada al hacer scroll y barra de progreso de lectura.
 * - Detecta automáticamente los bloques de cada sección (encabezados, tarjetas, formularios).
 * - Cualquier elemento puede sumarse con el atributo data-reveal.
 * - No oculta nada si JavaScript falla, ni lo que ya está en pantalla al cargar.
 * - Respeta "reducir movimiento" del sistema operativo.
 */
const AUTO_TARGETS=[
  "main section:not(#inicio) .section > *",
  "main section:not(#inicio) .grid > *",
  "main section:not(#inicio) article",
  "[data-reveal]",
].join(",");

export function ScrollReveal(){
  const pathname=usePathname();
  const barRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce||!("IntersectionObserver" in window)||pathname?.startsWith("/admin"))return;
    const root=document.documentElement;

    const all=Array.from(document.querySelectorAll<HTMLElement>(AUTO_TARGETS))
      .filter(el=>!el.closest("[data-no-reveal]")&&!el.closest("#inicio")&&!el.matches("input,script,style,template")&&el.getClientRects().length>0);
    // Si un bloque contiene a otro, anima solo los internos (evita doble animación).
    const targets=all.filter(el=>!all.some(other=>other!==el&&el.contains(other)));

    const viewportH=window.innerHeight;
    const pending:HTMLElement[]=[];
    targets.forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top<viewportH*0.92&&r.bottom>0)return; // ya visible al cargar: no se oculta
      const siblings=el.parentElement?Array.from(el.parentElement.children).filter(c=>targets.includes(c as HTMLElement)):[el];
      const i=Math.max(0,siblings.indexOf(el));
      el.style.setProperty("--reveal-delay",`${Math.min(i,4)*90}ms`);
      el.classList.add("reveal",el.matches("article, .grid > *")?"reveal-zoom":"reveal-up");
      pending.push(el);
    });
    root.classList.add("reveal-ready");

    const finish=(el:HTMLElement)=>{
      el.classList.remove("reveal","reveal-in","reveal-zoom","reveal-up");
      el.style.removeProperty("--reveal-delay");
    };
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const el=entry.target as HTMLElement;
        io.unobserve(el);
        el.classList.add("reveal-in");
        // Al terminar, se devuelven los estilos originales (hover, posiciones fijas, etc.).
        window.setTimeout(()=>finish(el),1100);
      });
    },{rootMargin:"0px 0px -8% 0px",threshold:0.12});
    pending.forEach(el=>io.observe(el));

    return ()=>{io.disconnect();pending.forEach(finish);root.classList.remove("reveal-ready");};
  },[pathname]);

  useEffect(()=>{
    const bar=barRef.current;
    if(!bar)return;
    let frame=0;
    const update=()=>{
      frame=0;
      const max=document.documentElement.scrollHeight-window.innerHeight;
      const p=max>0?Math.min(1,window.scrollY/max):0;
      bar.style.transform=`scaleX(${p})`;
    };
    const onScroll=()=>{if(!frame)frame=window.requestAnimationFrame(update);};
    update();
    window.addEventListener("scroll",onScroll,{passive:true});
    window.addEventListener("resize",onScroll);
    return ()=>{window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll);if(frame)cancelAnimationFrame(frame);};
  },[pathname]);

  return <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1"><div ref={barRef} className="scroll-progress h-full origin-left"/></div>;
}
