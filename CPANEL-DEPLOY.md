# Publicación en cPanel

Esta plataforma requiere un proceso Node.js permanente. No puede publicarse como un conjunto de archivos HTML porque utiliza rutas API, autenticación administrativa, cookies seguras, formularios, carga de documentos y conexiones con Supabase y Resend.

## Requisitos del hosting

- cPanel con **Setup Node.js App**, **Application Manager** o Passenger habilitado.
- Node.js 20 LTS recomendado. Next.js admite desde Node 18.18, pero para esta instalación se recomienda Node 20 o 22.
- Acceso a Terminal o a las acciones de instalación y ejecución de scripts NPM de cPanel.
- Salida HTTPS hacia Supabase, Resend, Cloudflare Turnstile y Expo cuando se activen esas funciones.
- HTTPS activo en el dominio. La sesión administrativa usa una cookie `Secure` en producción.
- Memoria suficiente para compilar Next.js; se recomienda al menos 1 GB durante la compilación.

Si el plan solo ofrece File Manager, PHP y bases MySQL, la plataforma no funcionará allí sin una migración tecnológica. En ese caso debe mantenerse en Vercel o utilizar un hosting con Node.js.

## Instalación

1. Crea la aplicación Node.js en un directorio privado, por ejemplo `~/apps/hipolito`. No coloques el código fuente ni secretos directamente dentro de `public_html`.
2. Selecciona Node.js 20 y asigna el dominio o subdominio desde la herramienta de aplicaciones Node.js.
3. Descomprime el ZIP fuente dentro del directorio de la aplicación.
4. Desde la terminal de la aplicación ejecuta `npm install --include=dev`. En Application Manager, **Ensure dependencies** instala las dependencias, pero no compila Next.js por sí solo.
5. Configura las variables descritas en `.env.example`. Las variables `NEXT_PUBLIC_*` deben existir antes de compilar.
6. Ejecuta `npm run build` antes de iniciar o reiniciar la aplicación. Si el hosting no ofrece Terminal ni una acción de compilación, utiliza Git Deployment con una tarea explícita de build o solicita esa acción al proveedor.
7. Establece `NODE_ENV=production`.
8. Inicia con `npm start` si cPanel permite ejecutar scripts NPM. Passenger detecta `app.js`, que carga el servidor preparado en `cpanel-server.cjs`.
9. Reinicia la aplicación desde cPanel y abre el dominio asignado.

cPanel define normalmente la variable `PORT`; no debe fijarse manualmente. Después de modificar una variable `NEXT_PUBLIC_*`, vuelve a ejecutar `npm run build` y reinicia la aplicación.

## Variables por función

### Sitio público

- `NEXT_PUBLIC_SITE_URL`: URL HTTPS definitiva.
- Variables `NEXT_PUBLIC_SOCIAL_*`, `NEXT_PUBLIC_WHATSAPP_*` y `NEXT_PUBLIC_YOUTUBE_VIDEO_IDS`: enlaces oficiales opcionales.
- `NEXT_PUBLIC_CAMPAIGN_VIDEO_URL`: opcional; si está vacío se usa el video local incluido.

### Dashboard

- `ADMIN_EMAIL`, `ADMIN_PASSWORD_SHA256` y `ADMIN_SESSION_SECRET`: acceso administrativo mediante contraseña.
- `ADMIN_EMAILS`: lista opcional de administradores autorizados mediante Supabase Auth.

### Datos persistentes y métricas privadas

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`: secreto exclusivo del servidor.
- Ejecuta `supabase/schema.sql` una sola vez en el proyecto Supabase.

### Correos y perfiles laborales

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`: buzón central para necesidades, perfiles y avisos de comunidad. Si se omite, se usa `info@depoloapoloavanzamoscotopaxi.com`.
- `APPLICATIONS_TO_EMAIL`: compatibilidad opcional para instalaciones anteriores; solo se usa si `CONTACT_TO_EMAIL` está vacío.
- `APPLICATIONS_FROM_EMAIL`
- `COMMUNITY_FROM_EMAIL`

El remitente debe estar verificado en Resend. Sin estas variables, el formulario laboral y la confirmación comunitaria responderán que el canal todavía no está configurado.

El reenviador del buzón debe crearse en el proveedor indicado por los registros MX públicos. Un reenviador creado en cPanel solo procesa mensajes si el dominio entrega su correo a ese servidor; si los MX apuntan a GoDaddy, Microsoft 365, Google Workspace u otro servicio, el reenvío se configura allí. No cambies los MX solo para activar un reenviador sin preparar primero la migración del buzón.

### Opcionales

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`: protección Turnstile.
- `SOCIAL_WEBHOOK_SECRET`: sincronización de publicaciones oficiales.

## Verificación posterior

1. Comprueba `/`, `/redes` y `/trabaja`.
2. Inicia sesión en `/admin` y confirma que la cookie funciona sobre HTTPS.
3. Envía un reporte de prueba con una imagen pequeña.
4. Envía un perfil laboral de prueba y verifica la recepción en el correo configurado.
5. Registra un correo de prueba en Comunidad y confirma el enlace recibido.
6. Revisa los registros de la aplicación Node.js en cPanel si una API devuelve un error.

## Limitaciones al salir de Vercel

El script `/_vercel/insights/script.js` y el enlace de Vercel Analytics son específicos de Vercel. En cPanel no recopilarán nuevas visitas. El Dashboard basado en datos voluntarios de Supabase sí puede funcionar. Para analítica web en cPanel se deberá elegir posteriormente una solución compatible y actualizar la política de privacidad antes de activarla.

Los límites de solicitudes se mantienen en memoria y se reinician cuando cPanel reinicia el proceso. Revisa también los límites de carga y tiempo de espera del proxy de cPanel: el sitio admite hasta tres imágenes de 5 MB cada una y hasta 4 MB de documentos por candidatura.
