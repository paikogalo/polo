import {authorizeEscuchaRequest,denied,privateHeaders} from "@/lib/escucha/auth";

export async function GET(request:Request){
  const user=await authorizeEscuchaRequest(request);
  if(!user)return denied();
  return Response.json({ok:true,user},{headers:privateHeaders});
}
