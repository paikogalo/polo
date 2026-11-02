const {createServer}=require("node:http");
const next=require("next");

const port=Number.parseInt(process.env.PORT||"3000",10);
const hostname="0.0.0.0";
const application=next({dev:false,dir:__dirname,hostname,port});
const handle=application.getRequestHandler();

application.prepare().then(()=>{
  createServer((request,response)=>handle(request,response)).listen(port,hostname,()=>{
    console.log(`Hipólito Territorio disponible en el puerto ${port}`);
  });
}).catch(error=>{
  console.error("No fue posible iniciar la aplicación",error);
  process.exit(1);
});
