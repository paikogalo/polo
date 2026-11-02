import {z} from "zod";
import {addUser,authorizeEscuchaRequest,denied,listUsers,privateHeaders,removeUser,resetUserPassword} from "@/lib/escucha/auth";

const password=z.string().min(10,"La contraseña debe tener al menos 10 caracteres.").max(200);
const schema=z.discriminatedUnion("action",[
  z.object({action:z.literal("add"),email:z.string().email().max(200),name:z.string().trim().max(80).default(""),role:z.enum(["admin","analista"]),password}),
  z.object({action:z.literal("reset"),email:z.string().email(),password}),
  z.object({action:z.literal("delete"),email:z.string().email()}),
]);

export async function POST(request:Request){
  const user=await authorizeEscuchaRequest(request);
  if(!user)return denied();
  if(user.role!=="admin")return denied(403,"Solo un administrador puede gestionar usuarios.");
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message||"Datos no válidos."},{status:400,headers:privateHeaders});
  const input=parsed.data;
  try{
    if(input.action==="add")await addUser(input);
    else if(input.action==="reset")await resetUserPassword(input.email,input.password);
    else{if(input.email.toLowerCase()===user.email)throw new Error("No puedes eliminar tu propia cuenta.");await removeUser(input.email);}
  }catch(error){return Response.json({error:error instanceof Error?error.message:"No se pudo completar."},{status:400,headers:privateHeaders});}
  return Response.json({ok:true,users:await listUsers()},{headers:privateHeaders});
}
