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

## NODO · Jóvenes Cotopaxi (`/nodo`)

Sección de la plataforma de emprendimiento y tecnología para jóvenes de 16 a 30 años. Se presenta como plataforma de emprendimiento juvenil: ningún texto pide el voto, menciona listas o papeletas, ni ofrece premios, sorteos o beneficios a cambio del registro.

**Accesos (todos con `utm_source`):** botón amarillo en el menú de escritorio y móvil (`menu`), franja destacada bajo el hero de la portada (`home`), opción “Soy joven y quiero registrarme en NODO” del chatbot (`chatbot`, abre `/nodo#registro`) y aplicativo móvil (`app`). El QR de los afiches debe apuntar a `/nodo?utm_source=afiche&utm_medium=qr`.

**Archivos del kit (`public/nodo/`):** `nodo-propuesta.pdf`, `nodo-video-720.mp4`, `nodo-video-1080.mp4`, `nodo-video-poster.jpg`, `nodo-logo.svg`, `nodo-logo-blanco.svg`, `nodo-icono.svg` y, cuando exista, `nodo-video-es.vtt` (subtítulos). La página revisa en la compilación qué archivos existen: si falta alguno, muestra “Disponible pronto” en lugar de un enlace roto. `nodo-icono.svg` y `public/nodo/provisional/` son versiones provisionales hasta copiar el kit oficial; las provisionales nunca se ofrecen para descargar. El QR (`NODO_QR_afiches.png`, `NODO_QR_vector.svg`) no se publica.

**Videos:** se sirven desde `public/nodo/` si su peso es razonable para el repositorio. Si no, se suben a Supabase Storage (bucket público `nodo`) y se configuran `NEXT_PUBLIC_NODO_VIDEO_720_URL` y `NEXT_PUBLIC_NODO_VIDEO_1080_URL`. Decisión vigente: pendiente hasta recibir el kit (se documentará aquí el peso final y el alojamiento elegido).

**Registro para el piloto:** esquema Zod compartido en `lib/nodo/schema.ts`; ruta `POST /api/nodo/registro`. La edad se calcula en el servidor con la fecha de Ecuador; fuera de 16–30 no se guarda nada. Con 16 o 17 años se exige el consentimiento del art. 21 de la LOPDP (desde los 15 años el adolescente puede consentir de forma explícita si se le explican los fines). Incluye honeypot, límite de 5 envíos por IP por hora (en memoria) y un registro por correo (índice único `nodo_registros_correo_uq`). Al guardar se genera el código `NODO-XXXXXX` y se envía el correo de confirmación con Resend (`NODO_FROM_EMAIL` o los remitentes existentes).

**Separación de datos:** `nodo_registros` es una tabla propia, con RLS activa y sin políticas públicas; solo el servidor (service role) inserta, lee, actualiza y borra. No se mezcla con `community_members` ni con listas de difusión de campaña: los registros de NODO solo se usan para conformar el piloto y contactar sobre el programa. No se pide cédula, dirección exacta, afiliación ni preferencia política, ni datos de salud.

**Derecho de eliminación:** `/nodo/mis-datos` pide correo y código, envía un enlace de confirmación por Resend y el borrado se confirma con un botón (POST), para que los antivirus de correo no borren datos al abrir el enlace. El registro y sus tokens se eliminan por completo.

**Base de datos:** ejecutar `supabase/migrations/20261108_nodo.sql` en el editor SQL de Supabase (también está al final de `supabase/schema.sql`; no ejecutes los datos de ejemplo de ese archivo en producción).

**Dashboard:** pestaña “NODO · Jóvenes” en `/admin` (API `GET/PATCH /api/admin/nodo`, `?format=csv` para exportar). Requiere sesión de administrador; las gráficas muestran solo cifras agregadas y el CSV neutraliza fórmulas.

**Analítica:** eventos de Vercel Web Analytics sin datos personales: `nodo_boton_click` (ubicacion), `nodo_video_play`, `nodo_video_50`, `nodo_video_100`, `nodo_descarga` (archivo), `nodo_registro_inicio`, `nodo_registro_enviado`, `nodo_registro_rechazado_edad`, `nodo_compartir` (red). Los eventos personalizados requieren el plan de Vercel que los incluya.
