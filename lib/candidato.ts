export type FacetaSlug="humano"|"politico"|"empresario";

export type Faceta={
  slug:FacetaSlug;
  etiqueta:string;
  menu:string;
  resumen:string;
  titulo:string;
  frase:string;
  intro:string[];
  datos:{valor:string;texto:string}[];
  claves:{titulo:string;texto:string}[];
  cierre:string;
  /** Clases de color de la faceta (paleta de la marca). */
  tema:{fondo:string;texto:string;acento:string;suave:string;chip:string};
  fotos:{src:string;alt:string;posicion?:string}[];
};

export const facetas:Faceta[]=[
  {
    slug:"humano",
    etiqueta:"El lado humano",
    menu:"El lado humano",
    resumen:"Familia, raíces y cercanía con la gente.",
    titulo:"El lado humano",
    frase:"Nació en La Maná y nunca se alejó de su gente.",
    intro:[
      "Antes que cargos o títulos, Polo es un hijo de La Maná. Su vida ha estado ligada al campo y a la comunidad, y de ahí aprendió que las respuestas se encuentran caminando, escuchando y compartiendo con la gente.",
      "Ama profundamente a su familia y la reconoce como el motor que impulsa cada paso de su vida.",
    ],
    datos:[
      {valor:"La Maná",texto:"su tierra natal, en el subtrópico de Cotopaxi"},
      {valor:"Familia",texto:"el motor de su vida"},
      {valor:"Calle",texto:"donde prefiere trabajar: cerca de la gente"},
    ],
    claves:[
      {titulo:"La familia primero",texto:"Su familia es su base y su principal razón para trabajar por un futuro mejor para Cotopaxi."},
      {titulo:"Cercanía de verdad",texto:"Prefiere el recorrido a la oficina: conversar en la calle, en el mercado o en la fiesta del barrio."},
      {titulo:"Orgullo por nuestras tradiciones",texto:"Vive las fiestas y la cultura de Cotopaxi junto a su gente: el poncho, la comparsa y la música también son parte de su identidad."},
      {titulo:"Recorrer, escuchar y convertir",texto:"Su forma de trabajar: recorrer cada territorio, escuchar a la gente y convertir cada necesidad en una prioridad."},
    ],
    cierre:"Un candidato que conoce Cotopaxi porque la vive todos los días.",
    tema:{fondo:"bg-coral",texto:"text-white",acento:"text-coralDark",suave:"bg-coral/10",chip:"bg-coral text-white"},
    fotos:[
      {src:"/candidato/humano-01.webp",alt:"Hipólito Carrera abraza a una ciudadana durante una celebración popular",posicion:"60% 40%"},
      {src:"/candidato/humano-02.webp",alt:"Hipólito Carrera junto a una niña durante un evento comunitario",posicion:"40% 50%"},
      {src:"/candidato/humano-03.webp",alt:"Hipólito Carrera comparte con una comerciante en un mercado",posicion:"50% 40%"},
      {src:"/candidato/humano-04.webp",alt:"Hipólito Carrera conversa con un adulto mayor en su comunidad",posicion:"50% 60%"},
      {src:"/candidato/humano-05.webp",alt:"Hipólito Carrera se toma una foto con asistentes a un concierto",posicion:"50% 40%"},
      {src:"/candidato/humano-06.webp",alt:"Hipólito Carrera con poncho tradicional durante una fiesta popular",posicion:"50% 30%"},
    ],
  },
  {
    slug:"politico",
    etiqueta:"El político",
    menu:"El político",
    resumen:"Experiencia de gobierno local para toda la provincia.",
    titulo:"El político",
    frase:"Experiencia de gobierno local para servir a toda la provincia.",
    intro:[
      "Polo es alcalde del cantón La Maná: fue elegido en 2019 y reelegido para el período 2023-2027. Esa experiencia le dio algo que no se aprende en un escritorio: saber cómo se planifica, se gestiona y se rinde cuentas.",
      "Hoy es candidato a la Prefectura de Cotopaxi por la Alianza AVANZAMOS DE POLO A POLO, con un Plan de Trabajo para el período 2027-2031.",
    ],
    datos:[
      {valor:"2",texto:"períodos como alcalde de La Maná"},
      {valor:"2027–2031",texto:"Plan de Trabajo para la Prefectura"},
      {valor:"6",texto:"ejes de trabajo con metas medibles"},
    ],
    claves:[
      {titulo:"Gestión municipal",texto:"Al frente del GAD de La Maná ha liderado procesos de planificación, desarrollo territorial y fortalecimiento institucional."},
      {titulo:"Obra en territorio",texto:"Vías, mantenimiento y atención en emergencias: una gestión que se mide en lo que la gente ve y usa."},
      {titulo:"Cuentas claras",texto:"Presenta los resultados de su gestión a la ciudadanía y propone indicadores públicos para la Prefectura."},
      {titulo:"Visión de ciudad y provincia",texto:"Ha participado en el Foro Urbano Nacional 2025 y en el Quinto Foro Global de Ciudades Sostenibles, en México."},
    ],
    cierre:"Del cantón a la provincia: la misma forma de trabajar, ahora para toda Cotopaxi.",
    tema:{fondo:"bg-ocean",texto:"text-deep",acento:"text-oceanDark",suave:"bg-ocean/15",chip:"bg-ocean text-deep"},
    fotos:[
      {src:"/candidato/politico-01.webp",alt:"Hipólito Carrera durante una rendición de cuentas",posicion:"50% 40%"},
      {src:"/candidato/politico-02.webp",alt:"Hipólito Carrera interviene en un evento institucional",posicion:"30% 50%"},
      {src:"/candidato/politico-03.webp",alt:"Hipólito Carrera atiende una entrevista con medios de comunicación",posicion:"60% 40%"},
      {src:"/candidato/politico-04.webp",alt:"Hipólito Carrera revisa documentos en una reunión de trabajo",posicion:"60% 40%"},
      {src:"/candidato/politico-05.webp",alt:"Hipólito Carrera inspecciona una zona afectada junto a equipos de emergencia",posicion:"50% 40%"},
      {src:"/candidato/politico-06.webp",alt:"Hipólito Carrera supervisa trabajos de asfaltado en una vía",posicion:"50% 40%"},
    ],
  },
  {
    slug:"empresario",
    etiqueta:"El empresario",
    menu:"El empresario",
    resumen:"Más de 20 años produciendo desde el campo.",
    titulo:"El empresario",
    frase:"Sabe lo que cuesta producir, porque lo ha hecho.",
    intro:[
      "Ingeniero zootecnista y máster en Dirección y Administración de Empresas, Polo tiene más de 20 años de experiencia en el sector agropecuario, especialmente en banano, cacao y ganadería.",
      "Desde el campo ha generado empleo y oportunidades para muchas familias. Esa experiencia es la que quiere llevar a la Prefectura: riego, cadenas productivas y caminos para sacar la producción.",
    ],
    datos:[
      {valor:"+20 años",texto:"de experiencia en el sector agropecuario"},
      {valor:"3",texto:"cadenas que conoce: banano, cacao y ganadería"},
      {valor:"MBA",texto:"en Dirección y Administración de Empresas"},
    ],
    claves:[
      {titulo:"Productor del subtrópico",texto:"Fue gerente general de Agrícola Bananera Carrera Benites y conoce de primera mano el esfuerzo del campo."},
      {titulo:"Generador de empleo",texto:"Desde el sector agropecuario ha creado trabajo y oportunidades para familias de la zona."},
      {titulo:"Formación técnica y gerencial",texto:"Ingeniero Zootecnista por la Universidad Técnica Estatal de Quevedo y MBA por la Universidad Internacional de La Rioja (España)."},
      {titulo:"Visión productiva",texto:"Su Plan de Trabajo propone 8.000 hectáreas con riego, 4 cadenas productivas fortalecidas y apoyo a la agricultura familiar campesina."},
    ],
    cierre:"Producir riqueza desde el campo, con orden, técnica y oportunidades para todos.",
    tema:{fondo:"bg-yellow",texto:"text-deep",acento:"text-deep",suave:"bg-yellow/25",chip:"bg-yellow text-deep"},
    fotos:[
      {src:"/candidato/empresario-01.webp",alt:"Retrato de Hipólito Carrera en una plaza",posicion:"50% 30%"},
      {src:"/campaign-produccion.webp",alt:"Hipólito Carrera conversa con un productor en una plantación de banano",posicion:"50% 52%"},
      {src:"/candidato/empresario-02.webp",alt:"Hipólito Carrera recorre un cultivo de banano",posicion:"50% 50%"},
      {src:"/candidato/empresario-03.webp",alt:"Hipólito Carrera en una zona rural de Cotopaxi",posicion:"40% 40%"},
      {src:"/candidato/empresario-05.webp",alt:"Hipólito Carrera recibe un reconocimiento",posicion:"50% 40%"},
      {src:"/candidato/empresario-07.webp",alt:"Hipólito Carrera durante un foro institucional",posicion:"50% 40%"},
    ],
  },
];

export const getFaceta=(slug:string)=>facetas.find(f=>f.slug===slug);
