import {AtSign,Facebook,Images,Instagram,Linkedin,MessageCircle,Music2,Youtube} from "lucide-react";

export const socialNetworks=[
  {name:"Facebook",href:process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK||"",icon:Facebook,color:"from-blue-600 to-blue-800",description:"Noticias, recorridos y encuentros ciudadanos"},
  {name:"Instagram",href:process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM||"",icon:Instagram,color:"from-purple via-pink to-yellow",description:"Historias, fotografías y actividades del territorio"},
  {name:"TikTok",href:process.env.NEXT_PUBLIC_SOCIAL_TIKTOK||"",icon:Music2,color:"from-deep to-navy",description:"Videos breves y mensajes del candidato"},
  {name:"YouTube",href:process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE||"",icon:Youtube,color:"from-red-500 to-coral",description:"Entrevistas, propuestas y videos completos"},
  {name:"X",href:process.env.NEXT_PUBLIC_SOCIAL_X||"",icon:AtSign,color:"from-slate-700 to-black",description:"Actualizaciones y agenda pública"},
  {name:"WhatsApp",href:process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP||"",icon:MessageCircle,color:"from-green-500 to-emerald-700",description:"Canal directo de información ciudadana"},
  {name:"LinkedIn",href:process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN||"",icon:Linkedin,color:"from-sky-600 to-blue-800",description:"Experiencia, gestión y trayectoria profesional"},
  {name:"Flickr",href:process.env.NEXT_PUBLIC_SOCIAL_FLICKR||"",icon:Images,color:"from-fuchsia-500 to-blue-600",description:"Archivo fotográfico de recorridos y actividades"},
];

export const youtubeVideoIds=(process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_IDS||"").split(",").map(id=>id.trim()).filter(Boolean).slice(0,12);
