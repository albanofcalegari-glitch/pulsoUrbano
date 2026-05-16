# Pulso Urbano — Seguridad y Anti-Abuso

## 1. Principio general

El cliente NUNCA habla directo con PostgreSQL. Toda operación pasa por las API Routes de Next.js, que validan, sanitizan y autorizan cada request.

## 2. Niveles de acceso

### Usuario anónimo (cualquier visitante)
**Puede:**
- Ver el mapa y todos los reportes activos
- Crear un reporte (con rate limiting)
- Confirmar un reporte ("Sigue ahí")
- Marcar un reporte como removido ("Ya no está")
- Denunciar un reporte ("Reportar problema")
- Subir una foto al crear reporte

**No puede:**
- Acceder al panel /admin
- Editar o eliminar reportes de otros
- Ver datos internos (IPs, fingerprints)
- Hacer queries directas a la DB

### Admin (autenticado)
**Puede:**
- Todo lo del usuario anónimo
- Acceder al panel /admin
- Ocultar/aprobar/marcar spam reportes
- Eliminar imágenes
- Ver reportes denunciados con prioridad
- Ver metadata de moderación (contadores, IPs)

**No puede (MVP):**
- Crear otros admins (se hace por SQL directo)
- Eliminar reportes permanentemente (solo ocultar)

## 3. Seguridad a nivel API

### Validación de inputs
- Todos los payloads se validan con Zod en cada route handler
- latitude: number entre -90 y 90
- longitude: number entre -180 y 180
- status: enum restringido
- description: string max 500 chars, sanitizado
- Archivos: solo JPEG/PNG/WebP, máx 5MB

### Rate limiting
**MVP (simple, basado en cookie + IP):**
- Crear reporte: máx 5 por hora por IP
- Confirmar/remover/denunciar: máx 20 por hora por IP
- Una sola confirmación/remoción/denuncia por reporte por sesión

**Implementación:**
- Cookie `session_id` (UUID, httpOnly, sameSite: lax)
- Se guarda el `session_id` en cada acción para deduplicar
- Se guarda la IP para rate limiting
- En producción: agregar middleware con `@upstash/ratelimit` o similar

### Protección de endpoints admin
- Endpoint `/api/admin/*` protegido por cookie de sesión admin
- Login simple: email + password (bcrypt hash en DB)
- JWT o session cookie con httpOnly + secure + sameSite

## 4. Protección de imágenes

- Validar MIME type en el server (no confiar en la extensión)
- Limitar tamaño a 5MB
- Renombrar archivo a UUID (evitar path traversal)
- Servir desde ruta controlada `/api/uploads/[filename]`
- En producción: URL firmada de R2/S3 con expiración
- Stripear EXIF metadata antes de guardar (privacidad GPS)

## 5. Protección de datos personales

- No almacenar email/nombre del usuario anónimo
- IP se guarda solo para rate limiting, no se expone en la API pública
- session_id no se expone en la API pública
- Las fotos no deben contener metadata EXIF (se stripea al subir)
- El panel admin muestra IPs solo al admin autenticado

## 6. CORS

- Next.js API Routes: CORS automático (same-origin)
- Si se expone API a terceros (futuro), agregar headers explícitos
- Para MVP: no configurar CORS custom, todo es same-origin

## 7. Variables de entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/volquetes

# Upload
UPLOAD_DIR=./uploads          # Solo dev
R2_ENDPOINT=                  # Solo prod
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=

# Admin
ADMIN_JWT_SECRET=             # Para firmar cookies de sesión admin

# App
NEXT_PUBLIC_DEFAULT_LAT=-34.6037    # Buenos Aires
NEXT_PUBLIC_DEFAULT_LNG=-58.3816
NEXT_PUBLIC_DEFAULT_ZOOM=13
```

- Variables con `NEXT_PUBLIC_` son visibles en el cliente — NO poner secretos
- `DATABASE_URL` NUNCA se expone al cliente
- `.env.local` en `.gitignore`

## 8. Anti-spam

### MVP (suficiente para validar)
- Rate limiting por IP + cookie
- Deduplicación de confirmaciones/remociones por sesión
- Expiración automática a 72hs (datos basura desaparecen solos)
- Denuncias comunitarias: 2 flags → under_review
- Moderación manual por admin

### Fase posterior
- Captcha (hCaptcha/Turnstile) en el formulario de reporte
- Fingerprinting de browser
- Honeypot fields
- Bloqueo de IPs/rangos
- Shadow banning

## 9. Qué queda para después

| Feature de seguridad | Fase |
|---------------------|------|
| Auth real (email/OAuth) | Post-MVP |
| Captcha | Post-MVP |
| Fingerprinting avanzado | Post-MVP |
| Rate limiting distribuido (Redis) | Post-MVP |
| Moderación automática de imágenes | Post-MVP |
| Audit log de acciones admin | Post-MVP |
| 2FA para admin | Post-MVP |
| API keys para terceros | Post-MVP |
