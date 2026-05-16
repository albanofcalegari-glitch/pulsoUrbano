# Pulso Urbano

> Lo que pasa en tu barrio, visto por vecinos.

Un mapa colaborativo del barrio donde vecinos pueden compartir avisos urbanos, reportes físicos y cosas útiles que aparecen en la vía pública.

**MVP enfocado en volquetes**, con arquitectura preparada para avisos urbanos y objetos compartidos por vecinos.

## Qué es Pulso Urbano

Pulso Urbano es un mapa comunitario. Los vecinos agregan al mapa cosas que ven en la vía pública:

**Avisos urbanos** — cosas que afectan o informan sobre el espacio público:
- Volquetes, escombros, obras, veredas bloqueadas, obstáculos, residuos voluminosos

**Compartido por vecinos** — cosas útiles dejadas para otros:
- Libros disponibles, muebles, materiales reutilizables, plantas, objetos gratuitos

### Qué NO es Pulso Urbano

- No es Waze ni una app de tránsito
- No es una app de denuncias ni policial
- No es una app de emergencias
- No es un marketplace ni clasificados
- No reemplaza servicios de emergencia

## Reglas de comunidad

- Publicá solo cosas visibles y localizadas en el barrio.
- No publiques personas, datos personales ni patentes.
- No publiques emergencias.
- No publiques ventas ni pedidos.
- No publiques objetos peligrosos, comida, medicamentos o animales.
- Si algo ya no está, marcá "Ya no está".
- La información es colaborativa y puede no estar verificada oficialmente.

> Si hay riesgo inmediato, contactá al servicio de emergencias correspondiente.

## Reglas de acceso

| Acción | Anónimo | Registrado sin verificar | Verificado | Bloqueado | Admin |
|--------|---------|--------------------------|------------|-----------|-------|
| Ver mapa, pins, filtros, detalle | ✅ | ✅ | ✅ | ✅ | ✅ |
| Agregar aviso al mapa | ❌ | ❌ | ✅ | ❌ | ✅ |
| Confirmar "Sigue ahí" | ❌ | ❌ | ✅ | ❌ | ✅ |
| Marcar "Ya no está" | ❌ | ❌ | ✅ | ❌ | ✅ |
| Señalar para revisión | ❌ | ❌ | ✅ | ❌ | ✅ |
| Subir fotos | ❌ | ❌ | ✅ | ❌ | ✅ |
| Panel admin / moderar | ❌ | ❌ | ❌ | ❌ | ✅ |

- **Ver el mapa no requiere registro.** Cualquier persona puede visualizar avisos.
- **Agregar o colaborar requiere cuenta con email verificado.**
- **Usuarios bloqueados solo pueden visualizar.** Ven el mapa pero no pueden interactuar.
- **Admin requiere rol admin** y cuenta verificada.
- **Datos privados** (email completo, coordenadas del reportador, IP) nunca se exponen en endpoints públicos.

## Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Mapas:** Leaflet + react-leaflet + OpenStreetMap
- **Backend:** Next.js API Routes
- **Base de datos:** PostgreSQL 16 + Prisma 5
- **Auth:** JWT (jose) + bcryptjs, httpOnly cookies
- **Email:** Resend (en dev se loguea a consola)
- **Storage:** Cloudflare R2 (beta/prod) o filesystem local (dev)
- **Validaciones:** Zod

## Categorías

### Avisos urbanos (`urban_notice`)

| Clave | Label |
|-------|-------|
| `dumpster` | Volquete |
| `construction_debris` | Escombros |
| `construction_materials` | Materiales de obra |
| `roadwork_obstruction` | Obra en vía pública |
| `sidewalk_blocked` | Vereda bloqueada |
| `street_obstruction` | Obstáculo en la calle |
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

### Categorías excluidas explícitamente

Esta app NO incluye ni incluirá: accidentes, emergencias, robos, delitos, manifestaciones, política, controles policiales, seguimiento de personas, tráfico en tiempo real, rutas alternativas, ventas, trueques, reservas, chat, marketplace ni pagos. Tampoco animales, comida, medicamentos ni sustancias peligrosas.

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

Crear también un `.env` con solo el `DATABASE_URL` (Prisma CLI lo necesita):

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
# o en otro puerto si 3000 está ocupado:
npx next dev -p 3001
```

---

## Deploy beta en subdominio qngine

### Arquitectura recomendada

| Componente | Servicio | Tier | Costo |
|------------|----------|------|-------|
| **App (Next.js)** | Vercel | Hobby (gratis) | $0 |
| **Base de datos** | Neon PostgreSQL | Free (0.5 GB) | $0 |
| **Storage fotos** | Cloudflare R2 | Free (10 GB) | $0 |
| **Email** | Resend | Free (100/día) | $0 |

### Paso a paso

#### 1. Crear proyecto en Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

#### 2. Configurar Neon (PostgreSQL)

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear proyecto "pulso-urbano"
3. Copiar el connection string
4. Aplicar migraciones:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

5. Crear admin:

```bash
DATABASE_URL="postgresql://..." ADMIN_EMAIL="tu@email.com" ADMIN_PASSWORD="contraseña-segura" npm run db:create-admin
```

#### 3. Configurar Cloudflare R2 (Storage)

1. Crear bucket `pulso-urbano-photos` en [Cloudflare R2](https://dash.cloudflare.com)
2. Habilitar "Public access" (R2.dev subdomain)
3. Crear API token con permiso Object Read & Write

#### 4. Configurar Resend (Email)

1. Crear API key en [resend.com](https://resend.com)
2. (Opcional) Verificar dominio para enviar desde `@qngine.com`

#### 5. Variables de entorno en Vercel

```
DATABASE_URL=postgresql://...
JWT_SECRET=<openssl rand -base64 32>
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Pulso Urbano <noreply@qngine.com>
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=pulso-urbano-photos
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev
NEXT_PUBLIC_APP_URL=https://pulso.qngine.com
NEXT_PUBLIC_DEFAULT_LAT=-34.6037
NEXT_PUBLIC_DEFAULT_LNG=-58.3816
NEXT_PUBLIC_DEFAULT_ZOOM=13
```

#### 6. Configurar DNS

En el panel DNS de qngine.com:

| Tipo | Nombre | Valor |
|------|--------|-------|
| CNAME | `pulso` | `cname.vercel-dns.com` |

Luego en Vercel → Settings → Domains → agregar `pulso.qngine.com`.

---

## API Endpoints

### Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/reports | Listar avisos (filtros: status, category, categoryGroup, bounds) |
| GET | /api/reports/:id | Detalle de aviso |

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Crear cuenta |
| POST | /api/auth/login | Login |
| POST | /api/auth/verify-email | Verificar email |
| GET | /api/auth/me | Vecino actual |
| POST | /api/auth/logout | Cerrar sesión |

### Requieren auth + email verificado
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/reports | Crear aviso (categoría + foto obligatoria) |
| POST | /api/reports/:id/confirm | Confirmar "sigue ahí" |
| POST | /api/reports/:id/remove | Marcar "ya no está" |
| POST | /api/reports/:id/flag | Señalar problema |
| POST | /api/upload | Subir foto (JPG/PNG/WebP, max 5MB) |

### Feedback de beta (público)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/feedback | Enviar feedback (rate limit: 5/hora/IP) |

### Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/admin/reports | Listar todos los avisos |
| PATCH | /api/admin/reports/:id | Moderar: aprobar/ocultar/spam/removido |
| POST | /api/admin/users/:id/block | Bloquear vecino |
| GET | /api/admin/feedback | Listar feedback (filtros: status, type) |
| PATCH | /api/admin/feedback/:id | Actualizar estado/notas de feedback |
| GET | /api/admin/feedback/export | Exportar feedback a CSV |

## Reglas de negocio

- **Categorías:** 14 tipos de aviso (8 urbanos + 6 compartidos). Default: `dumpster`.
- **Estados por categoría:** cada categoría tiene estados válidos específicos.
- **Expiración:** 72hs. Cada confirmación extiende 24hs.
- **Removals:** 3 → status "removed".
- **Flags:** 3 → "under_review". 10 acumulados → auto-block del vecino.
- **Rate limiting:** 3 avisos/día (nuevos), 15/día (trust >= 2 estrellas).
- **Trust score:** base 10 + confirmed×5 + reports×2 - flags×10 - rejected×15.
- **Estrellas:** 1(≤15), 2(≤40), 3(≤80), 4(≤150), 5(151+).
- **Confidence:** foto(+20) + GPS_cerca(+25) + estrellas×5 + confirmaciones×10(max30) - flags×15 - removals×10 - viejo(>48h:-10). Rango 0-100.
- **Ubicación:** GPS del vecino vs punto marcado, umbral 150m.

---

## Checklist post-deploy beta

### Funcionalidad
- [ ] Abrir pulso.qngine.com — mapa con header "Pulso Urbano"
- [ ] Ver mapa sin login
- [ ] HTTPS funciona
- [ ] Registrar vecino con email real
- [ ] Verificar email
- [ ] Crear aviso urbano con foto
- [ ] Crear aviso "compartido por vecinos" con foto
- [ ] Foto persiste después de recargar
- [ ] Ver aviso en el mapa
- [ ] Probar filtros (incluido "Compartido")
- [ ] Probar detalle
- [ ] Confirmar ("Sigue ahí")
- [ ] Marcar removido ("Ya no está")
- [ ] Señalar problema

### Admin
- [ ] Login como admin en /admin
- [ ] Ver todos los avisos (incluido hidden/expired)
- [ ] Moderar: aprobar, ocultar, spam
- [ ] Bloquear vecino
- [ ] Vecino bloqueado no puede crear avisos

### Feedback beta
- [ ] Acceder a /feedback desde link "Ayudanos a mejorar" en header
- [ ] Enviar feedback sin estar logueado
- [ ] Enviar feedback estando logueado (asocia usuario)
- [ ] Validación: tipo obligatorio, mensaje mínimo 10 caracteres
- [ ] Rate limit: no permite más de 5 envíos por hora
- [ ] Admin: ver feedback en /admin/feedback
- [ ] Admin: cambiar estado (Revisado/Planeado/Resuelto/Descartar)
- [ ] Admin: exportar CSV desde /api/admin/feedback/export

### Seguridad
- [ ] No se expone email en API pública
- [ ] No se exponen coordenadas del reportador
- [ ] No se expone IP
- [ ] /api/admin/reports sin auth → 401
- [ ] Path traversal bloqueado

---

## Limitaciones conocidas (beta)

- EXIF stripping pendiente
- Rate limiting solo por usuario (no por IP)
- Sin captcha
- Sin detección de duplicados
- Sin moderación automática de imágenes
- Sin image optimization
- Sin "Mis avisos" (perfil)

## Scripts

```bash
npm run dev            # Servidor de desarrollo
npm run build          # Build de producción
npm run start          # Servidor de producción
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

Durante la beta, los usuarios pueden reportar problemas o sugerencias sobre la propia app desde `/feedback` (link "Ayudanos a mejorar" en el header). Este sistema es **independiente** de los reportes urbanos del mapa:

- No requiere login
- No aparece como pin en el mapa
- Tipos: bug, confuso, sugerencia, lentitud, visual, otro
- Rate limited: 5 envíos/hora por IP
- Si el usuario está logueado, se asocia automáticamente

### Workflow para el admin

1. Usuarios prueban la app → envían feedback desde `/feedback`
2. Admin revisa en `/admin/feedback` → filtra por estado
3. Admin cambia estado: Revisado → Planeado → Resuelto (o Descartado)
4. Admin exporta CSV desde el link "Exportar CSV" para análisis

## Naming

Working name: **Pulso Urbano**

Tagline: **"Lo que pasa en tu barrio, visto por vecinos."**
