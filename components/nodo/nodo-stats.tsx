"use client";

import {useEffect,useRef,useState} from "react";

const datos=[
  {valor:7,texto:"nodos, uno por cantón",color:"bg-yellow text-navy"},
  {valor:200,texto:"jóvenes por cantón",color:"bg-white text-navy"},
  {valor:1400,texto:"jóvenes formados en 4 años",color:"bg-white text-navy"},
  {valor:100,texto:"empresas rurales juveniles con fondo semilla",color:"bg-white text-navy"},
];

const formato=(n:number)=>n.toLocaleString("es-EC");

/** Cifras de la propuesta. Cuentan hacia arriba al entrar en pantalla; con movimiento reducido se muestran fijas. */
export function NodoStats(){
  const ref=useRef<HTMLUListElement>(null);
  const [progreso,setProgreso]=useState(1);
  const [animar,setAnimar]=useState(false);

  useEffect(()=>{
    const reducir=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodo=ref.current;
    if(reducir||!nodo||!("IntersectionObserver" in window))return;
    setAnimar(true);setProgreso(0);
    let frame=0;
    const observer=new IntersectionObserver(([entrada])=>{
      if(!entrada.isIntersecting)return;
      observer.disconnect();
      const inicio=performance.now();
      const paso=(ahora:number)=>{
        const t=Math.min(1,(ahora-inicio)/1300);
        setProgreso(1-Math.pow(1-t,3));
        if(t<1)frame=requestAnimationFrame(paso);
      };
      frame=requestAnimationFrame(paso);
    },{threshold:.35});
    observer.observe(nodo);
    return()=>{observer.disconnect();cancelAnimationFrame(frame);};
  },[]);

  return <ul ref={ref} data-no-reveal className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    {datos.map(d=><li key={d.texto} className={`rounded-3xl p-5 shadow-soft sm:p-6 ${d.color}`} style={animar?{transform:`translateY(${(1-progreso)*16}px)`}:undefined}>
      <b className="block text-4xl font-extrabold tabular-nums sm:text-5xl" aria-hidden="true">{formato(Math.round(d.valor*progreso))}</b>
      <span className="sr-only">{formato(d.valor)} </span>
      <span className="mt-2 block text-sm font-semibold leading-5">{d.texto}</span>
    </li>)}
  </ul>;
}
