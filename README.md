# Hipólito Carrera · Tu territorio tiene voz

Plataforma ciudadana responsive construida con Next.js App Router, TypeScript y Tailwind. Recibe reportes territoriales con ubicación e imágenes, y ofrece un panel administrativo con filtros, detalle y gráficos.

## Inicio rápido

1. Instala Node.js 20 o posterior.
2. Ejecuta `npm install`.
3. Copia `.env.example` como `.env.local`.
4. Ejecuta `npm run dev` y abre `http://localhost:3000`.

Sin credenciales de Supabase, el formulario territorial funciona automáticamente en modo demostración y entrega códigos simulados que no persisten. El Dashboard nunca publica credenciales de demostración: requiere un administrador configurado mediante Supabase Auth o las variables privadas descritas a continuación.

### Acceso privado alternativo al Dashboard

Para habilitar un único administrador sin depender de Supabase Auth, configura `ADMIN_EMAIL`, `ADMIN_PASSWORD_SHA256` y `ADMIN_SESSION_SECRET`. La contraseña no se guarda en texto plano. Puedes calcular su SHA-256 con Node.js y generar el secreto con OpenSSL:

```sh
node -e "console.log(require('node:crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" 'TU_CONTRASEÑA_SEGURA'
openssl rand -hex 32
```

El inicio de sesión crea una cookie `HttpOnly`, `Secure` y `SameSite=Strict` con ocho horas de duración. Este acceso permite abrir el Dashboard; para consultar registros y métricas demográficas también deben estar conectadas las tablas privadas de Supabase.

## Configurar Supabase

1. Crea un proyecto y ejecuta `supabase/schema.sql` en el editor SQL.
2. Copia URL, clave anónima y clave de servicio en `.env.local`.
3. En Authentication, crea los usuarios administrativos con correo y contraseña.
4. Asigna a cada administrador `app_metadata.role = "admin"` (o `"super_admin"`). Desde el editor SQL puedes usar, reemplazando el correo:

   `update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||'{"role":"admin"}'::jsonb where email='admin@ejemplo.com';`

5. Como respaldo, puedes definir `ADMIN_EMAILS` en Vercel con una lista separada por comas. La RLS sigue requiriendo el rol en `app_metadata`.
6. Verifica que el bucket privado `report-images` exista.

La clave de servicio solo se usa en el servidor. Nunca debe tener el prefijo `NEXT_PUBLIC_`. RLS permite al público crear reportes, pero solo a usuarios con rol administrativo consultar o modificar información. El bucket de fotografías no es público.

## Turnstile opcional

Configura `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`. La ruta del servidor valida el token cuando ambas existen. Para activar el widget visual, monta el componente oficial de Turnstile en el formulario y asigna el token al campo `turnstileToken`.

## Seguridad incluida

- Esquema Zod compartido, validación en cliente y servidor.
- Sanitización básica de texto; consultas gestionadas por Supabase.
- Honeypot invisible y límite de cinco envíos por IP cada diez minutos.
- Hasta tres imágenes JPG, PNG o WEBP de 5 MB cada una.
- Datos privados, bucket privado y políticas RLS basadas en rol administrativo.
- Cada registro permanece en `community_registration_requests` durante un máximo de 24 horas y solo pasa a `community_members` mediante una confirmación transaccional del correo.
- El rate limit en memoria es básico. En producción distribuida se recomienda Upstash Redis o Vercel KV.

## Despliegue en Vercel

Importa el repositorio en Vercel, agrega las variables de `.env.example` y despliega. Usa el dominio final como `NEXT_PUBLIC_SITE_URL`. La aplicación no necesita cambios de código.

### Chatbot y atención humana

El asistente flotante aparece en todas las páginas públicas y también dentro del aplicativo móvil, porque el aplicativo utiliza las mismas rutas web. Primero orienta entre “Contar una necesidad” y “Trabaja con nosotros”, responde preguntas frecuentes y dirige al formulario correspondiente. Nombre, correo, teléfono y mensaje se conservan únicamente en `sessionStorage` para prellenar el formulario elegido; se eliminan al leerlos y no se incluyen en la URL.

El chatbot no envía datos personales directamente por correo: la persona revisa y envía el formulario completo de necesidades o perfiles. Ambos formularios usan el mismo buzón administrativo descrito en la sección de correo, tanto desde la web como desde el WebView del aplicativo.

Para habilitar atención humana configura hasta tres números con código de país en `NEXT_PUBLIC_WHATSAPP_1`, `NEXT_PUBLIC_WHATSAPP_2` y `NEXT_PUBLIC_WHATSAPP_3`. Sus nombres visibles son opcionales mediante `NEXT_PUBLIC_WHATSAPP_LABEL_1`, `NEXT_PUBLIC_WHATSAPP_LABEL_2` y `NEXT_PUBLIC_WHATSAPP_LABEL_3`. Cada enlace `wa.me` se abre solo cuando la persona lo elige y precarga únicamente una frase genérica revisable: nunca incorpora nombre, correo, teléfono, CV u otros datos personales. Para este uso político no se integra WhatsApp Business Platform, Cloud API ni una bandeja de terceros basada en API.

## Estructura

- `app/`: landing, panel, metadata y ruta segura de recepción.
- `components/`: interfaz reutilizable, formulario, privacidad y panel.
- `lib/`: esquemas, tipos, cliente Supabase y datos simulados.
- `supabase/schema.sql`: tablas, índices, bucket, datos de ejemplo y RLS.

Antes de publicar, reemplaza la fotografía provisional, la biografía, el canal de privacidad y los datos oficiales de campaña.

## Comunidad, métricas y novedades sociales

La portada incluye registro voluntario para mayores de 18 años, confirmación por correo, acceso permanente a redes, novedades sincronizables y consentimiento separado para alertas. El panel administrativo distingue entre:

- visitas anónimas y agregadas en Vercel Analytics;
- personas que se registraron voluntariamente y confirmaron su correo;
- dispositivos que aceptaron recibir notificaciones.

No se infiere afinidad política ni se crean perfiles sensibles. Género, rango de edad, cantón, parroquia y barrio son opcionales y el panel los presenta únicamente de forma agregada. La lista individual privada se limita a nombre, correo y origen del registro. Las visitas anónimas solo generan analítica agregada y nunca completan estos campos por inferencia.

Para activar estas funciones en producción:

1. Ejecutar `supabase/schema.sql` en el proyecto Supabase.
2. Configurar las credenciales de Supabase en Vercel.
3. Configurar `RESEND_API_KEY` y `COMMUNITY_FROM_EMAIL` con un remitente verificado.
4. Crear `SOCIAL_WEBHOOK_SECRET` y conectar Make, Zapier u otra automatización al endpoint `POST /api/social-feed`.
5. Configurar Expo/EAS para las notificaciones nativas del aplicativo.

El webhook recibe `externalId`, `platform`, `title`, `excerpt`, `url`, `imageUrl` y `publishedAt`. Debe incluir el secreto en la cabecera `x-social-webhook-secret`.

## Correo de formularios y comunidad

Todos los avisos administrativos se envían al buzón definido en `CONTACT_TO_EMAIL`. Si la variable está vacía o no existe, la plataforma usa `info@depoloapoloavanzamoscotopaxi.com`. `APPLICATIONS_TO_EMAIL` se conserva únicamente como compatibilidad para instalaciones anteriores y tiene menor prioridad.

- Las necesidades territoriales generan un aviso con sus datos y fotografías cuando Resend está configurado; el registro en Supabase continúa siendo la fuente persistente principal cuando está disponible.
- Los perfiles de “Trabaja con nosotros” y sus documentos se envían al mismo buzón central.
- El registro de comunidad envía el enlace de confirmación a la dirección de la persona —necesario para validar su consentimiento— y, por separado, un aviso administrativo al buzón central.
- El aplicativo móvil usa estas mismas rutas API mediante la web integrada, por lo que no requiere otra dirección de correo.

Para habilitar los envíos configura `RESEND_API_KEY` y al menos un remitente verificado: `APPLICATIONS_FROM_EMAIL` para formularios y/o `COMMUNITY_FROM_EMAIL` para comunidad. El destinatario no necesita ser el mismo dominio que el remitente verificado.

Los reenvíos del buzón deben configurarse en el proveedor que recibe el correo según los registros MX públicos. Crear un reenviador en cPanel no tendrá efecto si los MX del dominio apuntan a GoDaddy, Microsoft 365, Google Workspace u otro servicio. Antes de cambiar el enrutamiento, confirma el proveedor activo para no interrumpir la recepción existente.

## Escucha digital (módulo privado)

Ruta privada: `/escuchadigital` (sin enlaces públicos, `noindex`, inicio de sesión propio).

**Semáforo** (configurable desde el panel, pestaña “Palabras clave”):
- 🔴 Rojo → alerta inmediata al grupo de Telegram (GitHub Actions revisa cada 10 minutos).
- 🟠 Naranja → resumen del mediodía (Vercel Cron, 12:00–12:59 Ecuador).
- 🟢 Verde → resumen de la noche (Vercel Cron, 20:00–20:59 Ecuador).
- Excluir → descarta notas con ese término. Un término con “+” exige todas sus partes (`Tibán + denuncia`).

**Panel:** resumen con semáforo, menciones con filtros y reenvío a WhatsApp, palabras clave (alta, nivel, pausa, baja), cuentas y medios a seguir (web, RSS y YouTube se leen solos; Facebook, Instagram, TikTok y X quedan para revisión manual), conexión con Telegram con prueba e historial, y usuarios con roles (administrador/analista).

**Fuentes gratuitas:** Google News RSS armado con las palabras rojas y naranjas, RSS de los sitios del directorio de 71 medios de Cotopaxi, cuentas agregadas en el panel y `ESCUCHA_EXTRA_FEEDS`.

**Variables en Vercel:**
- `ESCUCHA_USERS`: cuentas principales (administradores), `correo:SHA256` separadas por comas.
- `ESCUCHA_SESSION_SECRET` y `CRON_SECRET`: `openssl rand -hex 32`.
- Almacenamiento: Vercel → Storage → Upstash Redis (gratis) crea `KV_REST_API_URL` y `KV_REST_API_TOKEN`. Sin esto los cambios del panel no se guardan.
- `ESCUCHA_TELEGRAM_BOT_TOKEN`: token del bot creado con @BotFather. El grupo se elige desde el panel.
- GitHub → Settings → Secrets → Actions: `ESCUCHA_CRON_SECRET` con el mismo valor de `CRON_SECRET`.

```sh
node -e "console.log(require('node:crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" 'CONTRASEÑA_SEGURA'
```

WhatsApp no se automatiza: la política de WhatsApp Business prohíbe su plataforma a candidatos y campañas. Solo se monitorea información pública de medios, figuras públicas e instituciones.
