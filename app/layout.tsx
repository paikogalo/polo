import type { Metadata } from "next";
import "./globals.css";
import {InstantChatbot} from "@/components/instant-chatbot";
import {WebAnalytics} from "@/components/web-analytics";
import {ScrollReveal} from "@/components/scroll-reveal";
export const metadata:Metadata={title:{default:"Hipólito Carrera | Tu territorio tiene voz",template:"%s | Hipólito Carrera"},description:"Plataforma ciudadana para registrar necesidades y propuestas de cada territorio.",keywords:["Hipólito Carrera","participación ciudadana","territorio","prefectura"],openGraph:{title:"Tu territorio tiene voz",description:"Construyamos una propuesta provincial real, cercana y útil.",type:"website",locale:"es_EC"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body className="font-sans antialiased">{children}<ScrollReveal/><InstantChatbot/><WebAnalytics/></body></html>}
