/** Cédula ecuatoriana: provincia 01–24 o 30, tercer dígito ≤ 5 y dígito verificador módulo 10. */
export function cedulaValida(c:string){
  if(!/^\d{10}$/.test(c))return false;
  const p=Number(c.slice(0,2));
  if(!((p>=1&&p<=24)||p===30)||Number(c[2])>5)return false;
  let suma=0;
  for(let i=0;i<9;i++){let v=Number(c[i])*(i%2?1:2);if(v>9)v-=9;suma+=v;}
  return (10-suma%10)%10===Number(c[9]);
}
