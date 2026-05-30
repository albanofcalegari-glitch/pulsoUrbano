# Pulso Urbano

> Lo que pasa en tu barrio, visto por vecinos.

Pulso Urbano es un mapa comunitario del barrio. Los vecinos agregan al mapa cosas que ven en la via publica: volquetes, escombros, obras, obstaculos y objetos disponibles para otros.

No es una app de transito, denuncias, emergencias ni marketplace. Es la capa cotidiana del barrio, colaborativa e inmediata.

## Diferencia con canales oficiales

Pulso Urbano **no es un canal oficial**. Los avisos son publicados por vecinos y no estan verificados por ninguna autoridad.

| | miBA / BA 147 | Pulso Urbano |
|---|---|---|
| **Pregunta** | "Que tramite o reclamo queres hacerle al Gobierno?" | "Que esta pasando en tu barrio que otros vecinos deberian ver?" |
| **Flujo** | Ciudadano -> Gobierno -> Expediente | Vecino -> Mapa -> Otros vecinos |
| **Respuesta** | Dias o semanas (burocratico) | Inmediata (aparece al instante) |
| **Quien resuelve** | Gobierno | Nadie resuelve, se informa |
| **Identidad** | DNI + CUIT | Email verificado |
| **Contenido** | Reclamos, solicitudes, tramites | Avisos fisicos y geolocalizados |

Para reclamos formales usa [BA 147](https://www.buenosaires.gob.ar/147). Para emergencias llama al 911.

Pulso Urbano no reemplaza miBA, BA Colaborativa, BA 147 ni ningun servicio de emergencia.

## Que es Pulso Urbano

Un mapa comunitario donde los vecinos comparten lo que ven en el barrio.

**Avisos urbanos** — cosas que afectan o informan sobre el espacio publico:
- Volquetes, escombros, obras, veredas bloqueadas, obstaculos, residuos voluminosos

**Compartido por vecinos** — cosas utiles dejadas para otros:
- Libros disponibles, muebles, materiales reutilizables, plantas, objetos gratuitos

### Que NO es Pulso Urbano

- No es una app de transito
- No es una app de denuncias ni policial
- No es una app de emergencias
- No es un marketplace ni clasificados
- No es una app politica
- No reemplaza miBA ni BA Colaborativa
- No reemplaza servicios de emergencia

## Que se puede publicar

- Volquetes, escombros, obras, veredas bloqueadas, obstaculos
- Residuos voluminosos en la via publica
- Libros, muebles, materiales, plantas u objetos disponibles para retirar gratis
- Cualquier cosa fisica, visible y localizable en el barrio

## Que NO se puede publicar

- Ventas, trueques o pedidos de dinero
- Emergencias (llama al 911)
- Reclamos al gobierno (usa BA 147)
- Denuncias formales o policiales
- Personas, datos personales o patentes
- Animales, comida, medicamentos o sustancias peligrosas
- Contenido politico, religioso o discriminatorio
- Publicidad o spam
- Accidentes, delitos o manifestaciones

## Reglas de comunidad

- Publica solo cosas visibles y localizadas en el barrio.
- No publiques personas, datos personales ni patentes.
- No publiques emergencias.
- No publiques ventas ni pedidos.
- No publiques objetos peligrosos, comida, medicamentos o animales.
- Si algo ya no esta, marca "Ya no esta".
- La informacion es colaborativa y puede no estar verificada oficialmente.
- Si hay riesgo inmediato, contacta al servicio de emergencias correspondiente.

## Reglas de acceso

| Accion | Anonimo | Registrado sin verificar | Verificado | Bloqueado | Admin |
|--------|---------|--------------------------|------------|-----------|-------|
| Ver mapa, pins, filtros, detalle | SI | SI | SI | SI | SI |
| Agregar aviso al mapa | NO | NO | SI | NO | SI |
| Confirmar "Sigue ahi" | NO | NO | SI | NO | SI |
| Marcar "Ya no esta" | NO | NO | SI | NO | SI |
| Senalar para revision | NO | NO | SI | NO | SI |
| Subir fotos | NO | NO | SI | NO | SI |
| Panel admin / moderar | NO | NO | NO | NO | SI |

- **Ver el mapa no requiere registro.** Cualquier persona puede visualizar avisos.
- **Agregar o colaborar requiere cuenta con email verificado.**
- **Usuarios bloqueados solo pueden visualizar.** Ven el mapa pero no pueden interactuar.
- **Admin requiere rol admin** y cuenta verificada.
- **Datos privados** (email completo, coordenadas del reportador, IP) nunca se exponen en endpoints publicos.

## Roadmap por capas

### Capa 1: Avisos del barrio — IMPLEMENTADA

Cosas fisicas, temporales y visibles en la via publica.

Categorias: volquetes, escombros, materiales de obra, obras en via publica, veredas bloqueadas, obstaculos en la calle, residuos voluminosos, otro aviso urbano.

Funcionalidades: foto, ubicacion, confirmaciones comunitarias, senalamiento, expiracion automatica, moderacion admin.

### Capa 2: Compartido por vecinos — IMPLEMENTADA

Cosas gratuitas o disponibles para retirar.

Categorias: libros disponibles, muebles, materiales reutilizables, plantas o macetas, objetos gratuitos, otro aviso vecinal.

Reglas: sin venta, sin reserva, sin chat, sin pago. Foto obligatoria, ubicacion, "Sigue ahi" / "Ya no esta".

### Capa 3: Servicios del barrio — FUTURO

No implementada todavia. Roadmap conceptual.

Servicios posibles: fletes, mudanzas, mensajeria barrial, alquiler de herramientas, retiro de escombros, limpieza post obra.

Requisitos futuros: perfiles de prestador, reputacion independiente, zona de cobertura, disponibilidad, precio orientativo, contacto, moderacion comercial, terminos y condiciones.

Prerequisitos para implementar Capa 3:
- Validar adopcion de Capas 1 y 2 con usuarios reales
- Al menos 500 avisos organicos
- Al menos 50 usuarios activos
- Modelo de negocio definido
- Terminos legales

## Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Mapas:** Leaflet + react-leaflet + OpenStreetMap
- **Backend:** Next.js API Routes
- **Base de datos:** PostgreSQL 16 + Prisma 5
- **Auth:** JWT (jose) + bcryptjs, httpOnly cookies
- **Email:** Resend (en dev se loguea a consola)
- **Storage:** Cloudflare R2 (beta/prod) o filesystem local (dev)
- **Validaciones:** Zod

## Categorias

### Avisos urbanos (`urban_notice`)

| Clave | Label |
|-------|-------|
| `dumpster` | Volquete |
| `construction_debris` | Escombros |
| `construction_materials` | Materiales de obra |
| `roadwork_obstruction` | Obra en via publica |
| `sidewalk_blocked` | Vereda bloqueada |
| `street_obstruction` | Obstaculo en la calle |
| `large_waste` | Residuo voluminoso |
| `other` | Otro aviso urbano |

### Compartido por vecinos (`neighborhood_share`)

| Clave | Label |
|-------|-------|
| `books` | Libros disponibles |
| `furniture` | Mueble disponible |
| `reusable_materials` | Materiales reutilizables |
| `plants` | Plantas o macetas |
| `free_object` | Objeto gratuito |
| `other_share` | Otro aviso vecinal |

### Categorias excluidas explicitamente

Esta app NO incluye ni incluira: accidentes, emergencias, robos, delitos, manifestaciones, politica, controles policiales, seguimiento de personas, trafico en tiempo real, rutas alternativas, ventas, trueques, reservas, chat, marketplace ni pagos. Tampoco animales, comida, medicamentos ni sustancias peligrosas.

---

## Setup local (desarrollo)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Crear tambien un `.env` con solo el `DATABASE_URL` (Prisma CLI lo necesita):

```
DATABASE_URL="postgresql://volquetes:volquetes123@localhost:5434/volquetes"
```

### 3. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

### 4. Sincronizar schema y generar cliente

```bash
npx prisma db push
```

### 5. Cargar datos de prueba

```bash
npm run db:seed
```

Credenciales locales:
- **Admin:** admin@pulsourbano.com / admin1234
- **Demo:** demo@pulsourbano.com / demo1234

### 6. Levantar el servidor de desarrollo

```bash
npm run dev
# o en otro puerto si 3000 esta ocupado:
npx next dev -p 3001
```

---

## Deploy beta en pulsourbano.qngine.com.ar

### Arquitectura

| Componente | Servicio | Tier | Costo |
|------------|----------|------|-------|
| **App (Next.js)** | Vercel | Hobby (gratis) | $0 |
| **Base de datos** | Neon PostgreSQL | Free (0.5 GB) | $0 |
| **Storage fotos** | Cloudflare R2 | Free (10 GB, sin egress) | $0 |
| **Email** | Resend | Free (100/dia) | $0 |
| **DNS/SSL** | Cloudflare | Free | $0 |

### Paso 1: Neon (PostgreSQL)

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear proyecto "pulso-urbano", region us-east-2
3. Copiar el connection string (formato: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
4. Aplicar migraciones desde tu maquina local:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" npx prisma migrate deploy
```

5. Crear admin de produccion:

```bash
DATABASE_URL="postgresql://..." ADMIN_EMAIL="tu@email.com" ADMIN_PASSWORD="contrasena-segura-min-8" npx tsx scripts/create-admin.ts
```

6. Verificar que las 6 tablas se crearon: users, reports, report_confirmations, report_removals, report_flags, app_feedback.

Nota: en desarrollo se usa `prisma db push` (sync sin migraciones). En beta/produccion se usa `prisma migrate deploy` (aplica migraciones SQL versionadas).

### Paso 2: Cloudflare R2 (Storage de fotos)

1. Ir a [Cloudflare R2](https://dash.cloudflare.com) -> R2 Object Storage
2. Crear bucket: `pulso-urbano-photos`
3. En el bucket -> Settings -> Public access -> habilitar R2.dev subdomain
4. Copiar la URL publica (formato: `https://pub-xxx.r2.dev`)
5. Ir a R2 -> Manage R2 API tokens -> Create API token:
   - Permissions: Object Read & Write
   - Specify bucket: `pulso-urbano-photos`
6. Copiar: Account ID, Access Key ID, Secret Access Key

Como funciona:
- El upload (POST /api/upload) sube a R2 via S3 SDK y devuelve la URL publica
- Las imagenes se sirven directamente desde la URL de R2 (no pasan por Next.js)
- En desarrollo, las fotos se guardan en disco local (./uploads) y se sirven via /api/uploads/[filename]
- El switch es automatico segun STORAGE_PROVIDER (local o r2)

### Paso 3: Resend (Email)

1. Crear cuenta en [resend.com](https://resend.com)
2. Crear API key
3. (Recomendado) Verificar dominio qngine.com.ar en Resend para enviar desde `noreply@qngine.com.ar`
4. Sin dominio verificado: se puede usar `noreply@resend.dev` (llega pero puede ir a spam)

Como funciona:
- En dev sin RESEND_API_KEY, los codigos de verificacion se imprimen en consola
- En produccion con API key real, se envia email HTML con el codigo de 6 digitos
- El codigo expira en 15 minutos

### Paso 4: Vercel (App)

1. Importar repositorio en [vercel.com](https://vercel.com) -> New Project
2. Framework: Next.js (autodetectado)
3. Root directory: `.` (default)
4. Build command: `npm run build` (default)
5. Output directory: `.next` (default)

#### Variables de entorno en Vercel

Ir a Settings -> Environment Variables y agregar todas:

```
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<valor generado con: openssl rand -base64 32>
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Pulso Urbano <noreply@qngine.com.ar>
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=tu-account-id
R2_ACCESS_KEY_ID=tu-access-key-id
R2_SECRET_ACCESS_KEY=tu-secret-access-key
R2_BUCKET_NAME=pulso-urbano-photos
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev
NEXT_PUBLIC_APP_URL=https://pulsourbano.qngine.com.ar
NEXT_PUBLIC_DEFAULT_LAT=-34.6037
NEXT_PUBLIC_DEFAULT_LNG=-58.3816
NEXT_PUBLIC_DEFAULT_ZOOM=13
```

Importante:
- JWT_SECRET debe ser unico y secreto. Generarlo con `openssl rand -base64 32`.
- NEXT_PUBLIC_APP_URL debe ser exactamente `https://pulsourbano.qngine.com.ar` (sin trailing slash).
- Las variables NEXT_PUBLIC_* se embeben en el build. Despues de cambiarlas hay que re-deployar.

### Paso 5: DNS (Cloudflare)

En el panel DNS de qngine.com.ar en Cloudflare:

| Tipo | Nombre | Destino | Proxy |
|------|--------|---------|-------|
| CNAME | `pulsourbano` | `cname.vercel-dns.com` | DNS only (no proxy) |

Nota: usar "DNS only" (nube gris), no "Proxied". Vercel necesita manejar SSL directamente.

En Vercel -> Settings -> Domains -> agregar `pulsourbano.qngine.com.ar`. Vercel provisionara certificado SSL automaticamente.

### Paso 6: Verificar deploy

1. Abrir https://pulsourbano.qngine.com.ar
2. Verificar que carga el mapa con "Pulso Urbano" en el header
3. Verificar HTTPS (candado verde)
4. Registrar usuario con email real y confirmar que llega el codigo

### Cookies en produccion

La cookie de auth (`pu_token`) esta configurada para produccion:

| Atributo | Valor en produccion |
|----------|---------------------|
| httpOnly | true (no accesible desde JavaScript) |
| secure | true (solo HTTPS, automatico cuando NODE_ENV=production) |
| sameSite | lax (proteccion CSRF) |
| path | / |
| maxAge | 7 dias |
| domain | no especificado (usa el dominio del request automaticamente) |

No requiere configuracion adicional. Vercel setea NODE_ENV=production automaticamente.

### Troubleshooting

| Problema | Causa probable | Solucion |
|----------|----------------|----------|
| Login no persiste | JWT_SECRET no configurado | Verificar variable en Vercel |
| Fotos no cargan | R2 no configurado o bucket sin public access | Verificar R2_PUBLIC_BASE_URL y public access |
| Email no llega | RESEND_API_KEY invalida o dominio no verificado | Verificar API key, revisar logs en Resend dashboard |
| Error 500 en API | DATABASE_URL incorrecta | Verificar connection string de Neon, incluir ?sslmode=require |
| "JWT_SECRET must be set" | Variable faltante | Agregar JWT_SECRET en Vercel env vars |
| Dominio no resuelve | DNS no propagado | Esperar 5-10 min, verificar CNAME en Cloudflare |
| SSL error | Proxy de Cloudflare activo | Cambiar a "DNS only" (nube gris) en Cloudflare |

---

## API Endpoints

### Publicos
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/reports | Listar avisos (filtros: status, category, categoryGroup, bounds) |
| GET | /api/reports/:id | Detalle de aviso |

### Auth
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/auth/register | Crear cuenta |
| POST | /api/auth/login | Login |
| POST | /api/auth/verify-email | Verificar email |
| GET | /api/auth/me | Vecino actual |
| POST | /api/auth/logout | Cerrar sesion |

### Requieren auth + email verificado
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/reports | Crear aviso |
| POST | /api/reports/:id/confirm | Confirmar "sigue ahi" |
| POST | /api/reports/:id/remove | Marcar "ya no esta" |
| POST | /api/reports/:id/flag | Senalar para revision |
| POST | /api/upload | Subir foto (JPG/PNG/WebP, max 5MB) |

### Feedback de beta (publico)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/feedback | Enviar feedback (rate limit: 5/hora/IP) |

### Admin
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/admin/reports | Listar todos los avisos |
| PATCH | /api/admin/reports/:id | Moderar: aprobar/ocultar/spam/removido |
| POST | /api/admin/users/:id/block | Bloquear vecino |
| GET | /api/admin/feedback | Listar feedback (filtros: status, type) |
| PATCH | /api/admin/feedback/:id | Actualizar estado/notas de feedback |
| GET | /api/admin/feedback/export | Exportar feedback a CSV |

## Reglas de negocio

- **Categorias:** 14 tipos de aviso (8 urbanos + 6 compartidos). Default: `dumpster`.
- **Estados por categoria:** cada categoria tiene estados validos especificos.
- **Expiracion:** 72hs. Cada confirmacion extiende 24hs.
- **Removals:** 3 -> status "removed".
- **Flags:** 3 -> "under_review". 10 acumulados -> auto-block del vecino.
- **Rate limiting:** 3 avisos/dia (nuevos), 15/dia (trust >= 2 estrellas).
- **Trust score:** base 10 + confirmed*5 + reports*2 - flags*10 - rejected*15.
- **Estrellas:** 1(<=15), 2(<=40), 3(<=80), 4(<=150), 5(151+).
- **Confidence:** foto(+20) + GPS_cerca(+25) + estrellas*5 + confirmaciones*10(max30) - flags*15 - removals*10 - viejo(>48h:-10). Rango 0-100.
- **Ubicacion:** GPS del vecino vs punto marcado, umbral 150m.

---

## Checklist post-deploy beta

### Acceso y mapa
- [ ] Abrir https://pulsourbano.qngine.com.ar
- [ ] Verificar HTTPS (candado verde)
- [ ] Ver mapa sin login — pins visibles, filtros funcionan
- [ ] Disclaimer visible: "Pulso Urbano no es un canal oficial..."
- [ ] Header muestra "Pulso Urbano"

### Registro y auth
- [ ] Registrar usuario con email real
- [ ] Recibir email de verificacion con codigo de 6 digitos
- [ ] Verificar email con el codigo
- [ ] Login funciona despues de verificar
- [ ] Logout borra cookie y redirige
- [ ] Login persiste al recargar pagina (cookie pu_token activa)

### Avisos
- [ ] Crear aviso urbano (volquete) con foto
- [ ] Crear aviso "compartido por vecinos" (libros) con foto
- [ ] Foto sube correctamente a R2 y se ve en el aviso
- [ ] Foto persiste despues de recargar pagina
- [ ] Aviso aparece en el mapa con pin del color correcto
- [ ] Probar todos los filtros (incluido "Compartido")
- [ ] Abrir detalle del aviso — foto, categoria, estado, usuario
- [ ] Confirmar "Sigue ahi" — contador sube
- [ ] Marcar "Ya no esta" — feedback visual
- [ ] Senalar para revision — feedback visual

### Admin
- [ ] Login como admin en /admin
- [ ] Dashboard: stats, graficos, usuarios recientes
- [ ] Moderacion: ver avisos senalados, aprobar, ocultar, spam
- [ ] Bloquear usuario demo
- [ ] Confirmar que usuario bloqueado no puede crear avisos ni interactuar
- [ ] Desbloquear usuario demo

### Feedback beta
- [ ] Acceder a /feedback desde "Ayudanos a mejorar"
- [ ] Enviar feedback sin estar logueado
- [ ] Enviar feedback estando logueado (asocia usuario)
- [ ] Admin: ver feedback en /admin/feedback
- [ ] Admin: cambiar estado, exportar CSV

### Seguridad y privacidad
- [ ] GET /api/reports no expone email completo de usuarios
- [ ] GET /api/reports no expone coordenadas del reportador (reporterLatitude/reporterLongitude)
- [ ] GET /api/reports no expone IP
- [ ] GET /api/admin/reports sin cookie de admin -> 401
- [ ] PATCH /api/admin/reports/:id sin cookie de admin -> 401
- [ ] POST /api/upload con archivo de 10MB -> rechazado
- [ ] POST /api/upload con archivo .exe -> rechazado
- [ ] /api/uploads/../../etc/passwd -> 404 (path traversal bloqueado)

---

## Limitaciones conocidas (beta)

- EXIF stripping pendiente
- Rate limiting solo por usuario (no por IP en todos los endpoints)
- Sin captcha
- Sin deteccion de duplicados
- Sin moderacion automatica de imagenes
- Sin image optimization
- Sin "Mis avisos" (perfil)
- Sin push notifications
- Sin feed cronologico del barrio
- Sin seguir zona
- Sin derivacion a canal oficial

## Scripts

```bash
npm run dev            # Servidor de desarrollo
npm run build          # Build de produccion
npm run start          # Servidor de produccion
npm run lint           # ESLint
npm run typecheck      # TypeScript check
npm run db:generate    # Generar Prisma client
npm run db:push        # Sincronizar schema a DB (dev)
npm run db:migrate     # Aplicar migraciones (beta/prod)
npm run db:studio      # Prisma Studio (GUI)
npm run db:seed        # Seed de datos de prueba
npm run db:create-admin # Crear admin (ADMIN_EMAIL + ADMIN_PASSWORD)
```

## Feedback de beta

Durante la beta, los usuarios pueden compartir comentarios sobre la app desde `/feedback` (link "Ayudanos a mejorar" en el header). Este sistema es **independiente** de los avisos del mapa:

- No requiere login
- No aparece como pin en el mapa
- Tipos: bug, confuso, sugerencia, lentitud, visual, otro
- Rate limited: 5 envios/hora por IP
- Si el usuario esta logueado, se asocia automaticamente

### Workflow para el admin

1. Usuarios prueban la app -> envian feedback desde `/feedback`
2. Admin revisa en `/admin/feedback` -> filtra por estado
3. Admin cambia estado: Revisado -> Planeado -> Resuelto (o Descartado)
4. Admin exporta CSV desde el link "Exportar CSV" para analisis

## Naming

**Pulso Urbano** — "Lo que pasa en tu barrio, visto por vecinos."
