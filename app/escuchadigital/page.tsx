"use client";
import {useEffect,useState} from "react";
import {EscuchaDashboard} from "@/components/escucha-dashboard";

export default function EscuchaDigital(){
  const [user,setUser]=useState<string|null>(null);
  const [checking,setChecking]=useState(true);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/escucha/session",{signal:controller.signal})
      .then(async response=>{if(response.ok){const data=await response.json();setUser(data.user.email);}})
      .catch(()=>{})
      .finally(()=>setChecking(false));
    return()=>controller.abort();
  },[]);

  const login=async(event:React.FormEvent)=>{
    event.preventDefault();setLoading(true);setError("");
    const response=await fetch("/api/escucha/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})}).catch(()=>null);
    const data=await response?.json().catch(()=>({}));
    if(response?.ok){setUser(data.user.email);setPassword("");}
    else setError(data?.error||"No se pudo validar el acceso.");
    setLoading(false);
  };

  const logout=async()=>{await fetch("/api/escucha/logout",{method:"POST"});setUser(null);};

  if(checking)return <main className="escucha-gradient grid min-h-screen place-items-center text-sm font-bold text-white/70">Comprobando acceso…</main>;
  if(user)return <EscuchaDashboard email={user} onLogout={logout}/>;
  return <main className="escucha-gradient relative grid min-h-screen place-items-center p-4">
    <div className="escucha-band absolute inset-x-0 top-0 h-1.5" aria-hidden="true"/>
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <img src="/escucha-logo.png" alt="Escucha Digital" width={260} height={72} className="mx-auto h-16 w-auto"/>
      <p className="mt-4 text-center text-xs font-extrabold uppercase tracking-widest text-esc-teal">De POLO a POLO · Monitor privado</p>
      <h1 className="mt-1 text-center text-2xl font-black text-esc-ink">Acceso restringido</h1>
      <p className="mt-1 text-center text-sm text-esc-ink/55">Solo cuentas autorizadas del equipo.</p>
      <form onSubmit={login} className="mt-7 space-y-4">
        <label className="block"><span className="label">Correo autorizado</span><input className="field" type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)}/></label>
        <label className="block"><span className="label">Contraseña</span><input className="field" type="password" autoComplete="current-password" minLength={8} required value={password} onChange={event=>setPassword(event.target.value)}/></label>
        {error?<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-esc-redDark">{error}</p>:null}
        <button disabled={loading} className="w-full rounded-2xl bg-esc-red py-3 font-extrabold text-white transition hover:bg-esc-redDark disabled:opacity-60">{loading?"Verificando…":"Ingresar"}</button>
      </form>
    </div>
  </main>;
}
