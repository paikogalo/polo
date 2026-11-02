import {authorizeAdminRequest} from "@/lib/admin-session";

export async function GET(request:Request){
  const admin=await authorizeAdminRequest(request);
  const headers={"Cache-Control":"private, no-store","Vary":"Cookie, Authorization"};
  if(!admin)return Response.json({error:"No autorizado."},{status:401,headers});
  return Response.json({ok:true,email:admin.email},{headers});
}
