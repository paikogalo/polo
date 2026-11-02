import {alertLog} from "@/lib/escucha/alerts";
import {authorizeEscuchaRequest,denied,listUsers,privateHeaders} from "@/lib/escucha/auth";
import {getConfig} from "@/lib/escucha/config";
import {storeIsPersistent} from "@/lib/escucha/store";
import {telegramStatus} from "@/lib/escucha/telegram";

export const dynamic="force-dynamic";

export async function GET(request:Request){
  const user=await authorizeEscuchaRequest(request);
  if(!user)return denied();
  const [config,log,telegram]=await Promise.all([getConfig(),alertLog(),telegramStatus()]);
  return Response.json({user,config,log,telegram,persistent:storeIsPersistent(),users:user.role==="admin"?await listUsers():[]},{headers:privateHeaders});
}
