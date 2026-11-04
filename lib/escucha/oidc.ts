import {createPublicKey,verify,type JsonWebKey} from "node:crypto";

/**
 * Autorización de las tareas automáticas sin claves manuales:
 * GitHub Actions firma cada ejecución con un token OIDC (JWT RS256). Aquí se verifica
 * la firma con las llaves públicas de GitHub y que venga del repositorio y rama esperados.
 */

const ISSUER="https://token.actions.githubusercontent.com";
export const OIDC_AUDIENCE="escucha-digital";
const REPOSITORY=process.env.ESCUCHA_GITHUB_REPO||"paikogalo/polo";
const REF="refs/heads/main";

type Jwk=JsonWebKey&{kid?:string};
let cache:{keys:Jwk[];at:number}|null=null;

async function keys(){
  if(cache&&Date.now()-cache.at<60*60*1000)return cache.keys;
  const response=await fetch(`${ISSUER}/.well-known/jwks`,{cache:"no-store"});
  if(!response.ok)throw new Error("No se pudieron leer las llaves de GitHub.");
  cache={keys:(await response.json() as {keys:Jwk[]}).keys,at:Date.now()};
  return cache.keys;
}

const decode=(part:string)=>JSON.parse(Buffer.from(part,"base64url").toString("utf8"));

export async function verifyGithubOidc(token:string){
  const [header,payload,signature]=token.split(".");
  if(!header||!payload||!signature)return false;
  try{
    const head=decode(header) as {alg?:string;kid?:string};
    if(head.alg!=="RS256")return false;
    const jwk=(await keys()).find(key=>key.kid===head.kid);
    if(!jwk)return false;
    const ok=verify("RSA-SHA256",Buffer.from(`${header}.${payload}`),createPublicKey({key:jwk,format:"jwk"}),Buffer.from(signature,"base64url"));
    if(!ok)return false;
    const claims=decode(payload) as {iss?:string;aud?:string|string[];exp?:number;nbf?:number;repository?:string;ref?:string};
    const now=Math.floor(Date.now()/1000);
    const audiences=Array.isArray(claims.aud)?claims.aud:[claims.aud];
    return claims.iss===ISSUER&&audiences.includes(OIDC_AUDIENCE)&&Boolean(claims.exp&&claims.exp>now)&&(!claims.nbf||claims.nbf<=now+60)&&claims.repository===REPOSITORY&&claims.ref===REF;
  }catch{return false;}
}
