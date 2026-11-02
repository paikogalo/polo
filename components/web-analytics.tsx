"use client";
import Script from "next/script";
import {usePathname} from "next/navigation";
export function WebAnalytics(){const pathname=usePathname();if(pathname.startsWith("/escuchadigital"))return null;if(pathname.startsWith("/admin"))return <a href="https://vercel.com/polo14/hipolito-territorio/analytics" target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-[80] rounded-full bg-ocean px-5 py-3 text-sm font-extrabold text-white shadow-2xl">Ver métricas privadas</a>;return <Script src="/_vercel/insights/script.js" strategy="afterInteractive" data-sdkn="next.js"/>}
