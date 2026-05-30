# Pulso Urbano — Arquitectura Tecnica

## 1. Diagrama de arquitectura

```
+--------------------------------------------------+
|                   USUARIO                         |
|              (Browser movil/desktop)              |
+----------------------+---------------------------+
                       | HTTPS
                       v
+--------------------------------------------------+
|         VERCEL / VPS (Frontend + API)             |
|  +----------------------------------------------+|
|  |         Next.js 14 (App Router)               ||
|  |                                               ||
|  |  +------------------------------------------+ ||
|  |  |  Pages (SSR/Client)                      | ||
|  |  |  - / (mapa comunitario del barrio)       | ||
|  |  |  - /feedback (feedback de beta)          | ||
|  |  |  - /admin (panel de moderacion)          | ||
|  |  +------------------------------------------+ ||
|  |                                               ||
|  |  +------------------------------------------+ ||
|  |  |  API Routes (Route Handlers)             | ||
|  |  |  - GET/POST /api/reports                 | ||
|  |  |  - GET /api/reports/:id                  | ||
|  |  |  - POST /api/reports/:id/confirm         | ||
|  |  |  - POST /api/reports/:id/remove          | ||
|  |  |  - POST /api/reports/:id/flag            | ||
|  |  |  - POST /api/upload                      | ||
|  |  |  - POST /api/feedback                    | ||
|  |  |  - /api/admin/* (moderacion)             | ||
|  |  +------------------------------------------+ ||
|  |                                               ||
|  |  Leaflet + OpenStreetMap (mapas)              ||
|  |  Tailwind CSS (estilos mobile-first)          ||
|  +----------+-----------------------------------+||
+--------------+------------------------------------+
               | Prisma Client (TCP)
               v
+--------------------------------------------------+
|      PostgreSQL 16                                |
|  +----------------------------------------------+|
|  |  users, reports, report_confirmations,        ||
|  |  report_removals, report_flags,               ||
|  |  app_feedbacks                                ||
|  +----------------------------------------------+|
|  Dev: Docker local                                |
|  Prod: Neon / managed PostgreSQL                  |
+--------------------------------------------------+

+--------------------------------------------------+
|      Storage de Imagenes                          |
|  Dev: filesystem local (./uploads)                |
|  Prod: Cloudflare R2 (S3-compatible)              |
+--------------------------------------------------+
```

## 2. Stack detallado

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| Frontend | Next.js 14 + TypeScript | App Router, SSR para SEO, deploy simple en Vercel |
| Mapas | Leaflet + react-leaflet + OSM | Gratis, sin API key, ligero (~40KB) |
| Estilos | Tailwind CSS | Rapido para prototipar, mobile-first nativo |
| Backend | Next.js Route Handlers | API propia sin servidor separado, colocalizada |
| ORM | Prisma | Mejor DX, types auto-generados, migraciones |
| Base de datos | PostgreSQL 16 | Robusto, managed options gratis/baratas |
| Auth | JWT (jose) + bcryptjs | httpOnly cookies, sin dependencia de terceros |
| Storage imagenes | Local (dev) / R2 (prod) | Simple, S3-compatible, sin egress fees |
| Validaciones | Zod | Runtime schema validation, TypeScript-first |
| Email | Resend | Simple, buen free tier, API moderna |
| Deploy | Vercel + Neon PostgreSQL | Free tier generoso, zero-config para Next.js |

## 3. Decisiones tecnicas

### Por que Prisma y no Drizzle o node-postgres?
**Prisma** gana para este MVP por:
- Setup mas rapido (schema declarativo -> tipos auto-generados)
- Migraciones integradas
- Mejor DX para un equipo chico

### Por que Next.js Route Handlers y no Express/Fastify?
Un servidor separado agrega complejidad de deploy, CORS, y otro proceso. Next.js Route Handlers corren en el mismo deploy, comparten tipos, y son suficientes para la complejidad del MVP.

### Por que filesystem local + R2 para imagenes?
- Dev: escribir a disco es instantaneo, sin config
- Prod: R2 es S3-compatible con 10GB gratis y sin egress fees
- La abstraccion es un archivo de ~30 lineas que se swappea

### Por que JWT + email verificado?
Login con email verificado es el balance correcto para un mapa comunitario: suficiente friccion para evitar spam, suficientemente simple para no ahuyentar usuarios.

### Por que Neon para PostgreSQL en prod?
- Free tier: 0.5GB storage, 190 horas compute
- Branching para preview deploys
- Alternativas: Railway ($5/mes), Render (free tier limitado)

### Categorias en constants.ts, no en la base de datos
Las categorias y sus grupos se definen en `lib/constants.ts`. Esto simplifica queries, evita joins, y permite agregar categorias sin migraciones. El campo `category` en la tabla `reports` es un string libre.

### Modelo de datos sin tabla de servicios
La Capa 3 (servicios del barrio) esta en roadmap pero NO tiene tabla en la base de datos todavia. Cuando se implemente, requerira tablas nuevas (ServiceProvider, Service). No se agrega schema especulativo.

## 4. Alternativas consideradas

| Decision | Alternativa | Descartada porque |
|----------|-------------|-------------------|
| Prisma | Drizzle | Mas setup inicial, menos docs para principiantes |
| Next.js API | Express separado | Doble deploy, CORS, mas infra |
| Neon | Supabase | Usuario lo excluyo explicitamente |
| R2 | S3 | R2 no cobra egress, similar API |
| Leaflet | Mapbox | Requiere API key, mas pesado |
| JWT propio | NextAuth/Auth.js | Mas control, menos dependencia |

## 5. Riesgos tecnicos

| Riesgo | Prob. | Mitigacion |
|--------|-------|------------|
| Leaflet rompe en SSR (window undefined) | Alta | Dynamic import con `ssr: false` |
| Prisma cold starts en serverless | Media | Connection pooling |
| Imagenes llenan disco en dev | Baja | Limite 5MB, cleanup periodico |
| Rate limiting insuficiente | Media | Cookie + IP + limite por ventana de tiempo + trust |

## 6. Escalabilidad futura (no para MVP)

- **PWA + push notifications**: Alertas vecinales
- **Edge Functions / Middleware**: Rate limiting mas sofisticado
- **CDN de imagenes**: Cloudflare Image Resizing
- **Clustering de pins**: Cuando haya miles de avisos
- **Capa 3 — Servicios**: Tablas nuevas, perfiles de prestador, reputacion
- **Feed cronologico**: Timeline de avisos recientes cerca del usuario
- **Deteccion de duplicados**: Por proximidad geografica al crear
