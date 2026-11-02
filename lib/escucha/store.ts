/**
 * Almacenamiento del módulo de Escucha Digital.
 * Usa Upstash Redis por REST (gratuito, se conecta desde Vercel → Storage → Upstash Redis,
 * que crea KV_REST_API_URL y KV_REST_API_TOKEN). Sin esas variables usa memoria del servidor:
 * sirve para la vista previa, pero los cambios se pierden al reiniciar.
 */

const url=()=>process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL||"";
const token=()=>process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN||"";
export const storeIsPersistent=()=>Boolean(url()&&token());

type Memory={values:Map<string,string>;expires:Map<string,number>;lists:Map<string,string[]>};
const memory:Memory=((globalThis as unknown as {__escuchaMemory?:Memory}).__escuchaMemory??={values:new Map(),expires:new Map(),lists:new Map()});

async function redis(command:(string|number)[]){
  const response=await fetch(url(),{method:"POST",headers:{Authorization:`Bearer ${token()}`,"Content-Type":"application/json"},body:JSON.stringify(command),cache:"no-store"});
  if(!response.ok)throw new Error(`Redis HTTP ${response.status}`);
  return (await response.json() as {result:unknown}).result;
}

const alive=(key:string)=>{const at=memory.expires.get(key);if(at&&at<Date.now()){memory.values.delete(key);memory.expires.delete(key);return false;}return memory.values.has(key);};

export async function getJson<T>(key:string,fallback:T):Promise<T>{
  const raw=storeIsPersistent()?await redis(["GET",key]) as string|null:(alive(key)?memory.values.get(key)!:null);
  if(!raw)return fallback;
  try{return JSON.parse(raw) as T;}catch{return fallback;}
}

export async function setJson(key:string,value:unknown){
  const raw=JSON.stringify(value);
  if(storeIsPersistent())await redis(["SET",key,raw]);
  else memory.values.set(key,raw);
}

/** Marca una clave una sola vez. Devuelve true si es nueva (sirve para no repetir alertas). */
export async function markOnce(key:string,ttlSeconds:number){
  if(storeIsPersistent())return (await redis(["SET",key,"1","NX","EX",ttlSeconds]))==="OK";
  if(alive(key))return false;
  memory.values.set(key,"1");memory.expires.set(key,Date.now()+ttlSeconds*1000);
  return true;
}

export async function pushLog(key:string,entry:unknown,max=60){
  const raw=JSON.stringify(entry);
  if(storeIsPersistent()){await redis(["LPUSH",key,raw]);await redis(["LTRIM",key,0,max-1]);return;}
  const list=memory.lists.get(key)||[];list.unshift(raw);memory.lists.set(key,list.slice(0,max));
}

export async function readLog<T>(key:string,max=60):Promise<T[]>{
  const raw=storeIsPersistent()?await redis(["LRANGE",key,0,max-1]) as string[]:(memory.lists.get(key)||[]).slice(0,max);
  return raw.flatMap(item=>{try{return [JSON.parse(item) as T];}catch{return [];}});
}
