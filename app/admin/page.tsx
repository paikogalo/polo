"use client";
import {LockKeyhole} from "lucide-react";
import {useEffect,useState} from "react";
import {AdminDashboard} from "@/components/admin-dashboard";
import {NodoAdmin} from "@/components/nodo/nodo-admin";
import {browserSupabase} from "@/lib/supabase";

export default function Admin(){
  const [logged,setLogged]=useState(false);
  const [checking,setChecking]=useState(true);
  const [accessToken,setAccessToken]=useState<string>();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState<"territorio"|"nodo">("territorio");

  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/admin/session",{signal:controller.signal}).then(response=>{if(response.ok)setLogged(true);}).finally(()=>setChecking(false));
    return()=>controller.abort();
  },[]);

  const login=async(event:React.FormEvent)=>{
    event.preventDefault();setLoading(true);setError("");
    const passwordResponse=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
    if(passwordResponse.ok){setLogged(true);setLoading(false);return;}
    const passwordResult=await passwordResponse.json().catch(()=>({error:"No se pudo validar el acceso."}));
    const supabase=browserSupabase();
    if(passwordResult.code==="PASSWORD_AUTH_NOT_CONFIGURED"&&supabase){
      const {data,error:loginError}=await supabase.auth.signInWithPassword({email,password});
      if(loginError)setError("Usuario o contraseña incorrectos.");
      else if(data.session?.access_token){
        const response=await fetch("/api/admin/session",{headers:{Authorization:`Bearer ${data.session.access_token}`}});
        if(!response.ok){await supabase.auth.signOut();const result=await response.json();setError(result.error||"Esta cuenta no tiene permisos administrativos.");}
        else{setAccessToken(data.session.access_token);setLogged(true);}
      }
    }else setError(passwordResult.error||"Usuario o contraseña incorrectos.");
    setLoading(false);
  };

  const logout=async()=>{
    await fetch("/api/admin/logout",{method:"POST"});
    const supabase=browserSupabase();if(supabase)await supabase.auth.signOut();
    setAccessToken(undefined);setLogged(false);setPassword("");
  };

  if(checking)return <main className="grid min-h-screen place-items-center bg-deep text-sm font-bold text-white/70">Comprobando acceso seguro…</main>;
  if(logged)return <div className="bg-sand/60">
    <nav aria-label="Secciones del Dashboard" className="sticky top-0 z-40 border-b border-navy/10 bg-navy">
      <div className="section flex gap-2 py-2" role="tablist">
        {([["territorio","Territorio y comunidad"],["nodo","NODO · Jóvenes"]] as const).map(([id,label])=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>setTab(id)} className={`min-h-11 rounded-full px-4 text-sm font-extrabold transition ${tab===id?(id==="nodo"?"bg-yellow text-navy":"bg-white text-navy"):"text-white hover:bg-white/10"}`}>{label}</button>)}
        {tab==="nodo"&&<button type="button" onClick={logout} className="ml-auto min-h-11 rounded-full px-4 text-sm font-bold text-white hover:bg-white/10">Salir</button>}
      </div>
    </nav>
    {tab==="territorio"?<AdminDashboard accessToken={accessToken} onLogout={logout}/>:<main className="section pb-16"><NodoAdmin accessToken={accessToken}/></main>}
  </div>;
  return <main className="grid min-h-screen place-items-center bg-deep p-4"><div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mist text-ocean"><LockKeyhole/></span><h1 className="mt-5 text-center font-serif text-2xl font-black">Acceso administrativo</h1><p className="mt-2 text-center text-sm text-navy/55">Dashboard privado del equipo territorial</p><form onSubmit={login} className="mt-7 space-y-4"><label><span className="label">Usuario administrador</span><input className="field" type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)}/></label><label><span className="label">Contraseña</span><input className="field" type="password" autoComplete="current-password" minLength={8} required value={password} onChange={event=>setPassword(event.target.value)}/></label>{error?<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>:null}<button disabled={loading} className="w-full rounded-2xl bg-gold py-3 font-extrabold text-deep disabled:opacity-60">{loading?"Verificando…":"Ingresar al Dashboard"}</button></form><p className="mt-5 rounded-xl bg-sand p-3 text-center text-xs text-navy/60">Acceso exclusivo para el administrador autorizado.</p><a href="/" className="mt-5 block text-center text-xs font-bold text-ocean">Volver al sitio público</a></div></main>;
}
