# Pulso Urbano — Plan de Desarrollo por Capas

## Vision general

Pulso Urbano es un mapa comunitario del barrio con tres capas progresivas:

1. **Avisos del barrio** — cosas fisicas y visibles en la via publica (IMPLEMENTADA)
2. **Compartido por vecinos** — objetos gratuitos disponibles para retirar (IMPLEMENTADA)
3. **Servicios del barrio** — prestadores locales utiles (FUTURO, no implementar todavia)

Cada capa se valida con usuarios reales antes de avanzar a la siguiente.

---

## Capa 1: Avisos del barrio — IMPLEMENTADA

Cosas fisicas, temporales y visibles en la via publica.

**Categorias:**
- Volquete (foco inicial fuerte)
- Escombros
- Materiales de obra
- Obra en via publica
- Vereda bloqueada
- Obstaculo en la calle
- Residuo voluminoso
- Otro aviso urbano

**Funcionalidades implementadas:**
- Crear aviso con foto + ubicacion + categoria + estado + comentario
- Busqueda de direccion (Nominatim/OSM)
- Validacion de ubicacion (GPS vs punto marcado, 150m)
- Confirmacion comunitaria ("Sigue ahi") — extiende expiracion 24hs
- Remocion comunitaria ("Ya no esta") — 3 removals = auto-removed
- Senalamiento para revision — 3 flags = under_review
- Expiracion automatica (72hs)
- Confidence score (foto + GPS + trust + confirmaciones)
- Trust score + estrellas por vecino
- Rate limiting diferenciado por nivel de confianza
- Moderacion admin completa

---

## Capa 2: Compartido por vecinos — IMPLEMENTADA

Cosas gratuitas o disponibles para retirar.

**Categorias:**
- Libros disponibles
- Mueble disponible
- Materiales reutilizables
- Plantas o macetas
- Objeto gratuito
- Otro aviso vecinal

**Reglas:**
- Sin venta
- Sin reserva
- Sin chat
- Sin pago
- Foto obligatoria
- Ubicacion validada
- "Sigue ahi" / "Ya no esta"
- Expiracion automatica

---

## Capa 3: Servicios del barrio — FUTURO

**NO implementar todavia.** Solo roadmap conceptual.

### Servicios posibles
- Fletes
- Mudanzas
- Mensajeria barrial
- Alquiler de herramientas
- Alquiler de objetos
- Retiro de escombros
- Limpieza post obra

### Requisitos futuros
- Perfiles de prestador (nombre, descripcion, foto)
- Reputacion independiente (no mezclada con trust de vecino)
- Zona de cobertura (radio en mapa)
- Disponibilidad (dias/horarios)
- Precio orientativo (sin transaccion in-app)
- Contacto (WhatsApp o telefono, no chat in-app)
- Moderacion comercial
- Terminos y condiciones especificos
- Posible verificacion adicional de prestadores
- Eventualmente pagos (muy futuro)

### Prerequisitos para implementar Capa 3
- Capas 1 y 2 validadas con usuarios reales
- Al menos 500 avisos organicos
- Al menos 50 usuarios activos
- Modelo de negocio definido
- Terminos legales redactados
- Capacidad de moderacion comercial

### Modelo de contacto futuro
- Boton "Contactar" -> WhatsApp o telefono
- Sin transaccion dentro de la app
- Sin intermediacion de pago
- Sin chat in-app

### Modelo de negocio potencial
- Gratis para listar
- Destacado pago (futuro)
- Comision si se agregan pagos (muy futuro)

---

## Fases de desarrollo (historico)

### Fase 0: Setup — COMPLETADA
Proyecto Next.js + TypeScript + Tailwind + Leaflet + PostgreSQL + Prisma.

### Fase 1: Mapa con pins — COMPLETADA
Mapa interactivo con pins de colores, filtros por categoria, geolocalizacion.

### Fase 2: API + PostgreSQL — COMPLETADA
API REST conectada a PostgreSQL, seed de datos, detalle de aviso.

### Fase 3: Crear avisos — COMPLETADA
Formulario de creacion con ubicacion + categoria + estado + comentario.

### Fase 4: Fotos — COMPLETADA
Upload de fotos (JPG/PNG/WebP, max 5MB), storage local/R2.

### Fase 5: Confirmaciones y colaboracion — COMPLETADA
"Sigue ahi", "Ya no esta", senalamiento. Logica comunitaria con umbrales.

### Fase 6: Expiracion automatica — COMPLETADA
72hs de vida, extensible con confirmaciones. Lazy cleanup + filtrado.

### Fase 7: Auth + moderacion — COMPLETADA
Registro con email verificado, JWT, panel admin con dashboard, moderacion, usuarios.

### Fase 8: Pulido y deploy — COMPLETADA
Mobile-first responsive, busqueda de direccion, trust/confidence, feedback beta, dark/light mode, deploy en pulsourbano.qngine.com.ar.

---

## Mejoras pendientes (siguiente beta)

- Feed del barrio (timeline cronologico de avisos cercanos)
- "Mis avisos" (perfil basico del vecino)
- Vencimiento diferenciado por tipo de categoria
- Deteccion basica de duplicados (por proximidad geografica)
- PWA con push notifications
- Seguir zona / radio
- Derivacion a canal oficial cuando corresponda
- EXIF stripping
- Moderacion automatica de imagenes
- Image optimization
- Clustering de pins (para alta densidad)
