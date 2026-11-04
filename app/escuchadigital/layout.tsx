import type {Metadata} from "next";

export const metadata:Metadata={
  title:{absolute:"Escucha Digital · De POLO a POLO"},
  icons:{icon:"/escucha-icono.png",apple:"/escucha-icono.png"},
  robots:{index:false,follow:false,nocache:true,googleBot:{index:false,follow:false}},
};

export default function EscuchaLayout({children}:{children:React.ReactNode}){return children;}
