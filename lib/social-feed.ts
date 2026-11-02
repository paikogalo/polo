export type SocialUpdate={
  id:string;
  platform:string;
  title:string;
  excerpt:string;
  url:string;
  imageUrl?:string;
  publishedAt:string;
};

export const fallbackSocialUpdates:SocialUpdate[]=[
  {id:"welcome-1",platform:"Comunidad digital",title:"Todas las novedades, en un solo lugar",excerpt:"Conecta las cuentas oficiales para recibir aquí recorridos, videos, entrevistas y actividades de Hipólito Carrera.",url:"/redes",publishedAt:"2026-08-10T12:00:00-05:00"},
  {id:"welcome-2",platform:"YouTube",title:"Videoteca oficial",excerpt:"Mira entrevistas, propuestas y recorridos completos desde la nueva sección de videos.",url:"/redes#videos",publishedAt:"2026-08-09T12:00:00-05:00"},
  {id:"welcome-3",platform:"Participación",title:"Tu territorio tiene voz",excerpt:"Registra una necesidad o propuesta de tu comunidad de forma privada y sencilla.",url:"/#participa",publishedAt:"2026-08-08T12:00:00-05:00"},
];
