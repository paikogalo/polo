export type PlanEje={
  id:string;
  titulo:string;
  frase:string;
  problema:string;
  infografia:string;
  compromisos:{meta:string;detalle:string}[];
};

export const planIntro={
  titulo:"Plan de Trabajo 2027‑2031",
  bajada:"Lo que haremos por Cotopaxi, en claro y con metas que se pueden medir.",
  texto:"Este plan nace de recorrer la provincia y de escuchar a su gente. Se apoya en el Plan de Desarrollo y Ordenamiento Territorial de Cotopaxi y se concentra en lo que la Prefectura sí puede hacer: vías rurales, riego, producción, ambiente, gestión de riesgos y atención a quienes más lo necesitan.",
  vision:"Al 2031, Cotopaxi será un referente regional de producción e intercambio comercial, con vías y riego de calidad, preparada frente a los riesgos naturales y gobernada con transparencia, participación e interculturalidad.",
};

export const cifrasClave=[
  {valor:"100 km",texto:"de vías rurales pavimentadas"},
  {valor:"8.000 ha",texto:"con acceso a riego"},
  {valor:"560 km",texto:"de vías con mantenimiento"},
  {valor:"1.800 ha",texto:"de páramos y bosques protegidos"},
];

export const diagnostico=[
  "Casi la mitad de los hogares de Cotopaxi tiene necesidades básicas insatisfechas; en Sigchos y Pangua la situación es todavía más grave.",
  "Solo una de cada cuatro personas que trabajan tiene empleo pleno. El campo da trabajo a la mayoría, pero recibe la menor parte de los ingresos.",
  "Seis de cada diez adolescentes y mujeres han vivido algún tipo de violencia.",
  "Cerca del 60 % del territorio ha perdido su vegetación natural, y eso significa menos agua para todos.",
  "La Prefectura depende casi por completo de las transferencias del Estado, y por eso cada dólar debe invertirse con prioridad y control.",
];

export const ejes:PlanEje[]=[
  {
    id:"vialidad",
    infografia:"03-vias",
    titulo:"Vías que conectan Cotopaxi",
    frase:"Caminos dignos para sacar la producción y llegar a tiempo a la salud y a la escuela.",
    problema:"Las vías rurales en mal estado encarecen el transporte, aíslan a las comunidades y frenan la economía.",
    compromisos:[
      {meta:"100 km",detalle:"de vías rurales con pavimento flexible y articulado en los 7 cantones."},
      {meta:"22",detalle:"puentes y otras estructuras viales para unir comunidades."},
      {meta:"560 km",detalle:"de vías con mantenimiento, señalética y rehabilitación."},
      {meta:"+30 %",detalle:"de conectividad vial en las zonas con mayor déficit, con un plan vial provincial y maquinaria propia."},
    ],
  },
  {
    id:"produccion",
    infografia:"04-agua-produccion",
    titulo:"Agua y producción para el campo",
    frase:"Riego, mercados y apoyo técnico para que producir en Cotopaxi sea rentable.",
    problema:"El agro sostiene a la mayoría de familias, pero con riego sin tecnificar y poco acceso a mercados.",
    compromisos:[
      {meta:"8.000 ha",detalle:"incorporadas a sistemas de riego, con un plan de riego y drenaje actualizado."},
      {meta:"+20 %",detalle:"de superficie productiva atendida con plantas, insumos y acompañamiento técnico."},
      {meta:"4",detalle:"cadenas productivas fortalecidas con capacitación, innovación y tecnología."},
      {meta:"Red",detalle:"de innovación productiva para la agricultura familiar campesina y la soberanía alimentaria."},
      {meta:"Ferias",detalle:"y eventos para que productores y artesanos vendan directamente."},
    ],
  },
  {
    id:"turismo",
    infografia:"05-turismo",
    titulo:"Cotopaxi, destino que se visita",
    frase:"Convertir nuestros paisajes y tradiciones en ingresos para las comunidades.",
    problema:"La provincia tiene 467 atractivos turísticos, pero poca infraestructura y promoción.",
    compromisos:[
      {meta:"Infraestructura",detalle:"turística para potenciar los atractivos de la provincia."},
      {meta:"Promoción",detalle:"digital del destino Cotopaxi a nivel nacional e internacional."},
    ],
  },
  {
    id:"ambiente",
    infografia:"06-ambiente-riesgos",
    titulo:"Ambiente y prevención de riesgos",
    frase:"Cuidar el páramo es cuidar el agua; prevenir es proteger vidas.",
    problema:"Pérdida de páramos y bosques, ríos contaminados y amenazas de dos volcanes activos, deslaves, sequías e inundaciones.",
    compromisos:[
      {meta:"1.800 ha",detalle:"de ecosistemas frágiles conservados, restaurados o con manejo sostenible."},
      {meta:"2.500",detalle:"jóvenes formados en cambio climático, con campañas en comunidades vulnerables."},
      {meta:"Mapa",detalle:"provincial de amenazas naturales y 200 personas capacitadas cada año en gestión de riesgos."},
      {meta:"Viveros",detalle:"forestales con especies nativas en los 7 cantones, en alianza con municipios y parroquias."},
    ],
  },
  {
    id:"familias",
    infografia:"07-familias-derechos",
    titulo:"Familias y derechos",
    frase:"Ninguna familia se queda atrás.",
    problema:"Desnutrición infantil por encima de la media nacional, violencia contra mujeres y embarazo adolescente.",
    compromisos:[
      {meta:"600",detalle:"familias atendidas para reducir la malnutrición."},
      {meta:"400",detalle:"mujeres víctimas de violencia y sus hijos con acogida y atención integral."},
      {meta:"4.200",detalle:"personas capacitadas en derechos y prevención del embarazo temprano, con enfoque intercultural."},
    ],
  },
  {
    id:"gestion",
    infografia:"08-gestion-transparente",
    titulo:"Gestión transparente",
    frase:"Cuentas claras, obras con prioridad y la ciudadanía como veedora.",
    problema:"La ejecución presupuestaria histórica ha estado entre el 30 % y el 40 % de lo planificado.",
    compromisos:[
      {meta:"100 días",detalle:"para ordenar la Prefectura, transparentar obras y convenios y priorizar proyectos con los alcaldes."},
      {meta:"1 año",detalle:"para completar estudios, firmar convenios y actualizar el plan de desarrollo provincial."},
      {meta:"Indicadores",detalle:"de cumplimiento publicados en línea, con audiencias públicas y rendición de cuentas anual."},
      {meta:"Seguridad",detalle:"un sistema provincial de coordinación para la seguridad ciudadana y la convivencia."},
    ],
  },
];

export const ruta=[
  {etapa:"Primeros 100 días",texto:"Diagnóstico real de la Prefectura, revisión pública de obras y convenios, y priorización con alcaldes y comunidades."},
  {etapa:"Primer año",texto:"Estudios definitivos, convenios con otros niveles de gobierno y actualización del plan de desarrollo provincial."},
  {etapa:"Años 2 a 4",texto:"Ejecución de obras, seguimiento físico y financiero, evaluación de resultados y ampliación de lo que funciona."},
];

export const nota="Resumen del Plan de Trabajo inscrito por la Alianza AVANZAMOS DE POLO A POLO, listas 8-1-21, para la Prefectura de Cotopaxi 2027-2031. Las metas y su ejecución dependen de la disponibilidad de financiamiento y de los estudios técnicos, como establece el propio plan.";

export type Infografia={slug:string;titulo:string};
export const infografias={
  portada:{slug:"01-portada",titulo:"Plan de Trabajo 2027‑2031"},
  diagnostico:{slug:"02-diagnostico",titulo:"Lo que encontramos en territorio"},
  ruta:{slug:"09-hoja-de-ruta",titulo:"Cómo lo vamos a cumplir"},
} satisfies Record<string,Infografia>;

export const descargas={
  plan:{href:"/plan-de-trabajo/Plan_de_Trabajo_Prefectura_Cotopaxi_2027-2031.pdf",peso:"PDF · 12 MB"},
  resumen:{href:"/plan-de-trabajo/Plan_de_Trabajo_Resumen_Infografias.pdf",peso:"PDF · 1,8 MB"},
};
