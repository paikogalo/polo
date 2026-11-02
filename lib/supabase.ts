import {createClient} from "@supabase/supabase-js";
export const hasSupabase=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export function browserSupabase(){if(!hasSupabase)return null;return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)}
export function adminSupabase(){if(!hasSupabase||!process.env.SUPABASE_SERVICE_ROLE_KEY)return null;return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})}
