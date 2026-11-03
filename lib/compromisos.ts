/**
 * Pestaña "Lo que haremos": compromisos de gestión de Hipólito Carrera.
 * Complementa el Plan de Trabajo inscrito. Cada dato público lleva su fuente.
 * Revisar y aprobar con el equipo antes de publicar en producción.
 */

export type Fuente={titulo:string;medio:string;fecha:string;url:string};
export type Dato={valor:string;texto:string;fuente:number};
export type Compromiso={
  id:string;
  etiqueta:string;
  titulo:string;
  frase:string;
  foto?:{src:string;alt:string};
  problema:string[];
  datos:Dato[];
  acciones:{titulo:string;texto:string;enPlan?:boolean}[];
  competencia:string;
};

export const fuentes:Fuente[]=[
  {titulo:"Constitución de la República del Ecuador, arts. 263 y 264",medio:"Asamblea Constituyente",fecha:"2008",url:"https://www.derecho-ambiental.org/Derecho/Legislacion/Constitucion_Asamblea_Ecuador_4.html"},
  {titulo:"Seis sectores de Latacunga no tendrán agua este miércoles",medio:"La Gaceta",fecha:"6 jul 2026",url:"https://lagaceta.com.ec/seis-sectores-de-latacunga-no-tendran-agua-este-miercoles/"},
  {titulo:"GAD Latacunga – Agua potable",medio:"La Gaceta",fecha:"14 may 2026",url:"https://lagaceta.com.ec/gad-latacunga-agua-potable/"},
  {titulo:"Campesinos marchan en Latacunga y exigen investigar la falta de lluvias",medio:"La Gaceta",fecha:"oct 2026",url:"https://lagaceta.com.ec/campesinos-marchan-en-latacunga-y-exigen-investigar-la-falta-de-lluvias/"},
  {titulo:"Sequía reduce los caudales de agua para riego y afecta al sector agrícola de Cotopaxi",medio:"La Gaceta",fecha:"4 oct 2026",url:"https://lagaceta.com.ec/sequia-reduce-los-caudales-de-agua-para-riego-y-afecta-al-sector-agricola-de-cotopaxi/"},
  {titulo:"Pugnas por el agua del sistema de riego en Cotopaxi",medio:"El Comercio",fecha:"2020",url:"https://www.elcomercio.com/actualidad/pugnas-agua-sistema-riego-cotopaxi/"},
  {titulo:"Estiaje: 40 % de la población de Latacunga podría quedarse sin agua",medio:"Expreso",fecha:"25 sep 2024",url:"https://www.expreso.ec/provincias/estiaje-latacunga-40-poblacion-quedarse-agua-214796"},
  {titulo:"El Gobierno busca reactivar el aeropuerto de Latacunga",medio:"Primicias",fecha:"may 2026",url:"https://www.primicias.ec/economia/gobierno-ecuador-busca-reactivacion-aeropuerto-latacunga-cotopaxi-vuelos-comerciales-122605/"},
  {titulo:"DGAC proyecta nuevas rutas desde el Aeropuerto de Cotopaxi para 2027",medio:"La Gaceta",fecha:"30 sep 2026",url:"https://lagaceta.com.ec/dgac-proyecta-nuevas-rutas-desde-el-aeropuerto-de-cotopaxi-para-2027/"},
  {titulo:"Vuelos internacionales desde el aeropuerto de Latacunga no han sido autorizados",medio:"Primicias",fecha:"15 sep 2026",url:"https://www.primicias.ec/economia/dgac-descarta-autorizacion-vuelos-internacionales-aeropuerto-latacunga-cotopaxi-132700/"},
  {titulo:"Aeropuerto Internacional de Cotopaxi fortalece la conectividad aérea",medio:"Ministerio de Infraestructura y Transporte",fecha:"datos 2013-2014",url:"https://www.mit.gob.ec/aeropuerto-internacional-de-cotopaxi-fortalece-la-conectividad-aerea/"},
  {titulo:"Cotopaxi International Airport (pista 01/19)",medio:"Wikipedia",fecha:"consulta nov 2026",url:"https://en.wikipedia.org/wiki/Cotopaxi_International_Airport"},
  {titulo:"Dirección de Riego y Drenaje",medio:"Prefectura de Cotopaxi",fecha:"2026",url:"https://cotopaxi.gob.ec/direcciones/direccion-riego-drenaje/"},
  {titulo:"Plan de Trabajo Prefectura de Cotopaxi 2027-2031",medio:"Alianza AVANZAMOS DE POLO A POLO",fecha:"ago 2026",url:"/plan-de-trabajo"},
];

export const intro={
  titulo:"Lo que vamos a hacer",
  bajada:"Agua, riego y aeropuerto: tres decisiones para que Cotopaxi produzca, se conecte y no vuelva a quedarse sin agua.",
  texto:"Recorrimos la provincia y escuchamos lo mismo en cada parroquia: falta agua, falta riego y falta conexión con el país y el mundo. Aquí explicamos qué haremos, qué le corresponde a la Prefectura y qué impulsaremos junto al Gobierno nacional, los municipios, las juntas de agua y el sector productivo.",
};

/** Cotopaxi en datos: cifras verificadas para entender la provincia. */
export const cotopaxi:Dato[]=[
  {valor:"470.210",texto:"habitantes en 7 cantones (Censo 2022)",fuente:13},
  {valor:"48,6 %",texto:"de pobreza por necesidades básicas insatisfechas",fuente:13},
  {valor:"47.790 ha",texto:"regadas por los 4 canales estatales de la provincia",fuente:5},
  {valor:"147.486 ha",texto:"sin riego, según el Ministerio de Agricultura",fuente:5},
  {valor:"3.712 m",texto:"de pista en Latacunga, una de las más largas del país",fuente:11},
  {valor:"Desde 2017",texto:"sin vuelos comerciales regulares en el aeropuerto",fuente:7},
];

export const compromisos:Compromiso[]=[
  {
    id:"agua",
    etiqueta:"Agua",
    titulo:"Agua para todos los días",
    frase:"Cuidar el páramo es cuidar el agua de cada casa.",
    foto:{src:"/campaign-ambiente.webp",alt:"Hipólito Carrera en un recorrido por zonas verdes de Cotopaxi"},
    problema:[
      "En 2026, barrios de Latacunga pasaron más de diez días sin agua potable, y en mayo más de 6.000 familias y cuatro escuelas se quedaron sin servicio por daños en la red.",
      "La sequía de este año redujo los caudales de vertientes y canales; comunidades campesinas marcharon hasta la Prefectura y la Gobernación para exigir respuestas.",
      "Cerca del 60 % del territorio provincial ha perdido su vegetación natural, y sin páramo no hay agua.",
    ],
    datos:[
      {valor:"+10 días",texto:"sin agua potable en sectores de Latacunga (2026)",fuente:1},
      {valor:"6.000",texto:"familias sin suministro en mayo de 2026",fuente:2},
      {valor:"40 %",texto:"de Latacunga en riesgo de quedarse sin agua en la sequía de 2024",fuente:6},
    ],
    acciones:[
      {titulo:"Proteger las fuentes",texto:"Conservar y restaurar 1.800 hectáreas de páramos y bosques, empezando por las zonas que alimentan las captaciones de agua potable y de riego.",enPlan:true},
      {titulo:"Obras en cuencas con las juntas de agua",texto:"Protección de vertientes, cercado de fuentes y reforestación con especies nativas de los viveros provinciales en los 7 cantones.",enPlan:true},
      {titulo:"Convenios para agua potable rural",texto:"Cofinanciar estudios y obras con municipios y juntas de agua, como el sistema San José–Chipe Hamburgo en La Maná.",enPlan:true},
      {titulo:"Mesa provincial del agua",texto:"Una instancia permanente con municipios, juntas de agua y de riego, comunidades y el Ministerio del Ambiente para medir caudales, publicar los datos y actuar antes de que llegue la sequía."},
    ],
    competencia:"El servicio de agua potable lo prestan los municipios (Constitución, art. 264, num. 4). A la Prefectura le corresponden las obras en cuencas y microcuencas y la gestión ambiental provincial (art. 263, num. 3 y 4). Por eso protegeremos las fuentes y trabajaremos con convenios, sin reemplazar a los municipios.",
  },
  {
    id:"riego",
    etiqueta:"Riego",
    titulo:"Riego para producir más",
    frase:"Agua en la parcela es comida en la mesa y trabajo en el campo.",
    foto:{src:"/campaign-produccion.webp",alt:"Hipólito Carrera junto a productores en una parcela de Cotopaxi"},
    problema:[
      "Los cuatro canales estatales —Latacunga-Salcedo-Ambato, Alumíes, Canal Norte y Jiménez-Cevallos— riegan cerca de 47.800 hectáreas, mientras más de 147.000 siguen sin riego.",
      "En la sequía de 2026 el canal Jiménez-Cevallos bajó de 629 a 541 litros por segundo en su bocatoma y el Alumíes, de 629 a 503; muchas familias prepararon la tierra y no pudieron sembrar.",
      "Los canales sufren contaminación en los tramos urbanos y el reparto del agua genera conflictos entre comunidades, haciendas y empresas.",
    ],
    datos:[
      {valor:"147.486 ha",texto:"sin riego en la provincia",fuente:5},
      {valor:"−20 %",texto:"de caudal en el canal Alumíes durante la sequía de 2026",fuente:4},
      {valor:"4",texto:"canales estatales a cargo de la Prefectura",fuente:5},
    ],
    acciones:[
      {titulo:"8.000 hectáreas nuevas con riego",texto:"Nuevos sistemas de riego en los 7 cantones, priorizando a la agricultura familiar campesina y las zonas más secas.",enPlan:true},
      {titulo:"Plan provincial de riego y drenaje actualizado",texto:"Saber cuánta agua hay, quién la usa y dónde se pierde, para invertir con datos y no con favores.",enPlan:true},
      {titulo:"Riego tecnificado",texto:"Aspersión y goteo que rinden más con menos agua, con capacitación a las juntas de riego."},
      {titulo:"Canales que no pierdan agua",texto:"Revestimiento, limpieza y mantenimiento de los canales estatales junto a las juntas, y control de las descargas contaminantes con los municipios."},
      {titulo:"Reservorios comunitarios",texto:"Cosecha y almacenamiento de agua de lluvia para enfrentar los meses secos."},
    ],
    competencia:"Planificar, construir, operar y mantener sistemas de riego es una competencia exclusiva de la Prefectura (Constitución, art. 263, num. 5). Es una responsabilidad directa y la asumiremos con metas medibles.",
  },
  {
    id:"aeropuerto",
    etiqueta:"Aeropuerto",
    titulo:"El aeropuerto de Cotopaxi, a trabajar",
    frase:"Una de las pistas más largas del país no puede seguir esperando.",
    problema:[
      "El Aeropuerto Internacional Cotopaxi, en Latacunga, no tiene vuelos comerciales regulares desde 2017 y hoy lo usan sobre todo la Fuerza Aérea y vuelos privados.",
      "En 2014 por esta terminal salieron más de 26.000 toneladas de carga, casi todas flores, y viajaron más de 53.000 pasajeros.",
      "La DGAC, que administra el aeropuerto, lo orienta a carga y tráfico regional; antes debe resolver la pista, el cerco, las bandas y los equipos de seguridad, con una inversión cercana a USD 500.000. Hasta hoy no hay rutas autorizadas.",
    ],
    datos:[
      {valor:"3.712 m",texto:"de pista asfaltada",fuente:11},
      {valor:"26.296 t",texto:"de carga exportada en 2014, sobre todo flores",fuente:10},
      {valor:"2017",texto:"último año con vuelos comerciales regulares",fuente:7},
    ],
    acciones:[
      {titulo:"Carga primero",texto:"Reunir a floricultores, brocoleros y exportadores con la DGAC y las aerolíneas de carga para que Cotopaxi exporte desde Cotopaxi."},
      {titulo:"Mesa técnica permanente",texto:"Prefectura, DGAC, Ministerio de Infraestructura y Transporte, Municipio de Latacunga, cámaras de producción y turismo, con avances publicados para que la ciudadanía haga seguimiento."},
      {titulo:"Vías que lleguen al aeropuerto",texto:"Priorizar en el plan vial provincial las vías rurales que unen las zonas productivas con el aeropuerto y la Panamericana.",enPlan:true},
      {titulo:"Turismo que aterrice",texto:"Vincular la promoción del destino Cotopaxi —Quilotoa, Parque Nacional Cotopaxi y nuestras fiestas— con las rutas que se abran.",enPlan:true},
      {titulo:"Anuncios con permisos en firme",texto:"Solo comunicaremos rutas y vuelos cuando tengan autorización de la DGAC. La gente merece certezas, no expectativas."},
    ],
    competencia:"El aeropuerto lo administra la Dirección General de Aviación Civil y las rutas las autorizan la DGAC y el Ministerio de Infraestructura y Transporte. La Prefectura no lo opera, pero sí puede fomentar la producción, gestionar cooperación y construir vías (Constitución, art. 263, num. 2, 7 y 8). Ese es el camino que tomaremos.",
  },
];

export const nota="Estos compromisos complementan el Plan de Trabajo 2027-2031 inscrito para la Prefectura de Cotopaxi. Las acciones marcadas como «En el plan» constan en ese documento; las demás son compromisos de gestión que se impulsarán mediante convenios con el Gobierno nacional, los municipios, las juntas de agua y el sector productivo. Su ejecución depende de estudios técnicos y financiamiento.";
