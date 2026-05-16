# Mapa de Volquetes — Arquitectura Técnica

## 1. Diagrama de arquitectura

```
┌─────────────────────────────────────────────────┐
│                   USUARIO                        │
│              (Browser móvil/desktop)             │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│         VERCEL / RAILWAY (Frontend + API)        │
│  ┌───────────────────────────────────────────┐  │
│  │         Next.js 14 (App Router)           │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Pages (SSR/Client)                 │  │  │
│  │  │  • / (mapa principal)               │  │  │
│  │  │  • /admin (panel moderación)        │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  API Routes (Route Handlers)        │  │  │
│  │  │  • GET/POST /api/reports            │  │  │
│  │  │  • GET /api/reports/:id             │  │  │
│  │  │  • POST /api/reports/:id/confirm    │  │  │
│  │  │  • POST /api/reports/:id/remove     │  │  │
│  │  │  • POST /api/reports/:id/flag       │  │  │
│  │  │  • POST /api/upload                 │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  Leaflet + OpenStreetMap (mapas)          │  │
│  │  Tailwind CSS (estilos mobile-first)      │  │
│  └──────────┬────────────────────────────────┘  │
└─────────────┼───────────────────────────────────┘
              │ Prisma Client (TCP)
              ▼
┌─────────────────────────────────────────────────┐
│      PostgreSQL 16 + PostGIS                     │
│  ┌───────────────────────────────────────────┐  │
│  │  reports, report_confirmations,           │  │
│  │  report_removals, report_flags,           │  │
│  │  admin_users                              │  │
│  │  + índices geoespaciales (GiST)           │  │
│  └───────────────────────────────────────────┘  │
│  Dev: Docker local                               │
│  Prod: Neon / Railway / Render managed           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│      Storage de Imágenes                         │
│  Dev: filesystem local (./uploads)               │
│  Prod: Cloudflare R2 (S3-compatible)             │
└─────────────────────────────────────────────────┘
```

## 2. Stack detallado

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js 14 + TypeScript | App Router, SSR para SEO, deploy simple en Vercel |
| Mapas | Leaflet + react-leaflet + OSM | Gratis, sin API key, ligero (~40KB) |
| Estilos | Tailwind CSS | Rápido para prototipar, mobile-first nativo |
| Backend | Next.js Route Handlers | API propia sin servidor separado, colocalizada |
| ORM | Prisma | Mejor DX, types auto-generados, migraciones |
| Base de datos | PostgreSQL 16 + PostGIS | Robusto, geo nativo, managed options gratis/baratas |
| Storage imágenes | Local (dev) / R2 (prod) | Simple, S3-compatible, sin egress fees |
| Deploy | Vercel + Neon PostgreSQL | Free tier generoso, zero-config para Next.js |

## 3. Decisiones técnicas

### ¿Por qué Prisma y no Drizzle o node-postgres?
**Prisma** gana para este MVP por:
- Setup más rápido (schema declarativo → tipos auto-generados)
- Migraciones integradas
- Mejor DX para un equipo chico
- Para las 2-3 queries PostGIS, usamos `$queryRaw` (aceptable)

Drizzle sería buena opción si quisiéramos más control SQL. node-postgres requiere demasiado boilerplate.

### ¿Por qué Next.js Route Handlers y no Express/Fastify?
Un servidor separado agrega complejidad de deploy, CORS, y otro proceso. Next.js Route Handlers corren en el mismo deploy, comparten tipos, y son suficientes para la complejidad del MVP.

### ¿Por qué PostGIS si Prisma no lo soporta nativamente?
PostGIS queda habilitado y el índice GiST creado. Para el MVP, las queries de bounding box usan lat/lng simples con Prisma. Cuando necesitemos "reportes en radio de 2km", usamos `$queryRaw` con `ST_DWithin`. Costo de tenerlo: cero. Beneficio futuro: alto.

### ¿Por qué filesystem local + R2 para imágenes?
- Dev: escribir a disco es instantáneo, sin config
- Prod: R2 es S3-compatible con 10GB gratis y sin egress fees
- La abstracción es un archivo de ~30 líneas que se swappea

### ¿Por qué sin autenticación en el MVP?
Login obligatorio mata la adopción de un mapa comunitario. Para rate limiting usamos:
- Cookie anónima (session ID)
- IP del request
- Fingerprint del browser (futuro)

Si crece, agregamos auth con email/magic link.

### ¿Por qué Neon para PostgreSQL en prod?
- Free tier: 0.5GB storage, 190 horas compute
- Soporta PostGIS
- Branching para preview deploys
- Alternativas: Railway ($5/mes), Render (free tier limitado)

## 4. Alternativas consideradas

| Decisión | Alternativa | Descartada porque |
|----------|-------------|-------------------|
| Prisma | Drizzle | Más setup inicial, menos docs para principiantes |
| Prisma | node-postgres | Demasiado boilerplate para MVP |
| Next.js API | Express separado | Doble deploy, CORS, más infra |
| Neon | Supabase | Usuario lo excluyó explícitamente |
| R2 | S3 | R2 no cobra egress, similar API |
| Leaflet | Mapbox | Requiere API key, más pesado |

## 5. Riesgos técnicos

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| Leaflet rompe en SSR (window undefined) | Alta | Dynamic import con `ssr: false` |
| Prisma cold starts en serverless | Media | Connection pooling, `@prisma/client` en edge |
| Imágenes llenan disco en dev | Baja | Límite 5MB, cleanup periódico |
| Rate limiting insuficiente sin auth | Media | Cookie + IP + límite por ventana de tiempo |
| PostGIS no disponible en Neon free | Baja | Neon soporta PostGIS en free tier |

## 6. Escalabilidad futura (no para MVP)

- **Auth real**: Login con email/Google cuando haya comunidad
- **Edge Functions / Middleware**: Para rate limiting más sofisticado
- **CDN de imágenes**: Cloudflare Image Resizing
- **API pública**: REST o tRPC para terceros
- **Clustering de pins**: Cuando haya miles de reportes
- **WebSockets**: Para updates en tiempo real del mapa
- **PWA**: Service worker para offline
- **Cron job externo**: Para expiración automática (Vercel Cron o pg_cron)
