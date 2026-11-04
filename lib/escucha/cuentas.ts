/**
 * Cuentas principales (administradores) del módulo de Escucha Digital.
 * Solo se guarda el hash scrypt con sal; las contraseñas no están en el código.
 * ESCUCHA_USERS en Vercel, si existe, reemplaza esta lista.
 */
export const CUENTAS_PRINCIPALES:{email:string;name:string;secret:string}[]=[
  {email:"galo@depoloapolo.ec",name:"Galo Ricaurte",secret:"scrypt$49d702c20b6200487a3f78a04d2bbcc1$e84d96bcdd69646a6ab79c692529663f7694f1edde0139138c113e81100b0313"},
  {email:"hipolito@depoloapolo.ec",name:"Hipólito Carrera",secret:"scrypt$85298d9e9c081f60b774d5fb505947f9$99e875ef5958d682e0da5d48e053c80fb43173471ce47f5eddc9ad52afa282d7"},
  {email:"ana@depoloapolo.ec",name:"Ana Belén Marín",secret:"scrypt$c72988e32193fdf55228ce646c8e6dfc$ae33b0d57da087b7c4e70fb57197ffe6318735a7e3089f18f95d14c3b18c8404"},
];
