type AdminIdentity={email?:string|null;app_metadata?:Record<string,unknown>};

export function isAdminIdentity(user:AdminIdentity){
  const role=typeof user.app_metadata?.role==="string"?user.app_metadata.role:"";
  if(role==="admin"||role==="super_admin")return true;
  const allowed=(process.env.ADMIN_EMAILS||"").split(",").map(value=>value.trim().toLowerCase()).filter(Boolean);
  return Boolean(user.email&&allowed.includes(user.email.toLowerCase()));
}
