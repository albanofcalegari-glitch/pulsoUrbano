# Mapa de Volquetes — Plan de Desarrollo por Fases

## Fase 0: Setup del proyecto
**Objetivo:** Tener el entorno de desarrollo listo para programar.

**Tareas:**
- Crear proyecto Next.js con TypeScript
- Instalar y configurar Tailwind CSS
- Instalar Leaflet + react-leaflet
- Configurar docker-compose con PostgreSQL + PostGIS
- Configurar Prisma y conexión a DB
- Crear .env.example y .gitignore
- Ejecutar migración SQL inicial
- Verificar que `npm run dev` levanta sin errores

**Resultado:** Proyecto que compila, DB corriendo en Docker, Prisma conectado.

**Criterio de aceptación:** `npm run dev` muestra página en blanco sin errores. `npx prisma db push` crea tablas.

---

## Fase 1: Mapa con pins mockeados
**Objetivo:** Mostrar un mapa interactivo con datos estáticos.

**Tareas:**
- Crear componente Map con Leaflet (SSR-safe via dynamic import)
- Crear array de reportes mockeados
- Renderizar pins con colores según estado
- Centrar mapa en Buenos Aires o geolocalización
- Crear hook useGeolocation
- Crear componente StatusFilter
- Diseño mobile-first básico

**Resultado:** Mapa visible con pins de colores que se pueden filtrar.

**Criterio de aceptación:** Se ve el mapa, hay pins de distintos colores, el filtro funciona, en mobile se ve bien.

---

## Fase 2: API conectada a PostgreSQL
**Objetivo:** Leer reportes reales desde la base de datos.

**Tareas:**
- Crear API GET /api/reports (con filtros por estado y bounding box)
- Crear API GET /api/reports/[id] (detalle)
- Crear servicio de consulta con Prisma
- Reemplazar datos mockeados por fetch a la API
- Crear script de seed con reportes de prueba
- Crear componente ReportDetail (ficha al tocar pin)

**Resultado:** El mapa muestra reportes que vienen de PostgreSQL.

**Criterio de aceptación:** Correr seed → ver pins reales en el mapa → tocar pin → ver detalle.

---

## Fase 3: Crear reportes reales
**Objetivo:** Permitir que un usuario cree un reporte desde la web.

**Tareas:**
- Crear API POST /api/reports
- Crear componente ReportForm (ubicación + estado + comentario)
- Permitir selección de ubicación por GPS o tap en mapa
- Validar payload con Zod
- Generar session cookie anónima
- Guardar session_id e IP en el reporte
- Refrescar mapa después de crear

**Resultado:** El usuario puede reportar un volquete y verlo en el mapa.

**Criterio de aceptación:** Crear reporte → pin aparece en el mapa → detalle muestra datos correctos.

---

## Fase 4: Subir fotos
**Objetivo:** Permitir adjuntar una foto al reporte.

**Tareas:**
- Crear API POST /api/upload
- Validar MIME type y tamaño (≤5MB, solo JPG/PNG/WebP)
- Guardar en filesystem local (dev) con nombre UUID
- Crear API GET /api/uploads/[filename] para servir imágenes
- Integrar upload en ReportForm
- Mostrar foto en ReportDetail
- Stripear EXIF metadata

**Resultado:** Los reportes pueden tener foto visible en la ficha.

**Criterio de aceptación:** Subir foto → se ve en el detalle → sin metadata EXIF.

---

## Fase 5: Confirmaciones y "Ya no está"
**Objetivo:** Implementar la lógica colaborativa.

**Tareas:**
- Crear API POST /api/reports/[id]/confirm
- Crear API POST /api/reports/[id]/remove
- Crear API POST /api/reports/[id]/flag
- Deduplicar por session_id (una acción por reporte por sesión)
- Incrementar contadores en reports
- Confirmar → extender expires_at 24hs
- ≥3 removals → status = 'removed'
- ≥2 flags → status = 'under_review'
- Agregar botones en ReportDetail
- Feedback visual al usuario

**Resultado:** Los usuarios pueden interactuar con los reportes.

**Criterio de aceptación:** Confirmar → contador sube → expiración se extiende. 3x "Ya no está" → pin desaparece.

---

## Fase 6: Expiración automática
**Objetivo:** Que los reportes viejos se archiven solos.

**Tareas:**
- Crear script/endpoint que marque como 'removed' reportes con expires_at < NOW()
- Opción A: Vercel Cron (cron job cada hora)
- Opción B: API route + cron externo (cron-job.org)
- Opción C: Query al cargar el mapa (lazy cleanup)
- Para MVP: usar opción C (lazy) + opción B como respaldo
- Filtrar reportes expirados en GET /api/reports

**Resultado:** Los reportes se archivan automáticamente.

**Criterio de aceptación:** Reporte con expires_at pasado no aparece en el mapa.

---

## Fase 7: Moderación admin
**Objetivo:** Panel mínimo para que un admin modere.

**Tareas:**
- Crear tabla admin_users con hash bcrypt
- Crear API POST /api/admin/login
- Crear middleware de autenticación admin (JWT cookie)
- Crear página /admin con listado de reportes
- Filtrar por: todos, denunciados, pendientes, spam
- Acciones: aprobar, ocultar, marcar spam
- Eliminar imagen de un reporte
- Ver metadata de moderación

**Resultado:** Un admin puede moderar reportes desde la web.

**Criterio de aceptación:** Login admin → ver lista → ocultar reporte → desaparece del mapa.

---

## Fase 8: Pulido y deploy
**Objetivo:** Versión 1.0 deployada y usable.

**Tareas:**
- Pulir responsive (mobile, tablet, desktop)
- Mejorar UX de formulario y ficha
- Loading states y error handling
- SEO básico (title, meta, OG tags)
- Crear cuenta Neon (PostgreSQL) y ejecutar migraciones
- Configurar Cloudflare R2 para imágenes en prod
- Deploy en Vercel
- Configurar variables de entorno en Vercel
- Crear admin inicial por SQL
- Smoke test en producción
- Compartir URL

**Resultado:** Mapa colaborativo de volquetes en producción.

**Criterio de aceptación:** URL pública → crear reporte → confirmar → moderación funciona → fotos cargan.
