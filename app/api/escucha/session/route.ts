import {authorizeEscuchaRequest,privateHeaders} from "@/lib/escucha/auth";

export async function GET(request:Request){
  const user=authorizeEscuchaRequest(request);
  if(!user)return Response.json({error:"No autorizado."},{status:401,headers:privateHeaders});
  return Response.json({ok:true,email:user.email},{headers:privateHeaders});
}
