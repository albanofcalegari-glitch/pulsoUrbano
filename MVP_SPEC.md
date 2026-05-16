# Mapa de Volquetes — Especificación MVP

## 1. Problema

En ciudades argentinas, los volquetes (contenedores de obra/residuos) aparecen y desaparecen de la vía pública sin registro centralizado. Los vecinos no saben dónde hay volquetes disponibles, cuáles están llenos, mal ubicados o abandonados. No existe una herramienta comunitaria que permita visualizar esta información en tiempo real.

## 2. Objetivo del MVP

Validar que existe una comunidad dispuesta a reportar y consultar la ubicación de volquetes en un mapa colaborativo. El MVP NO es un marketplace ni un sistema de reservas — es un mapa comunitario donde la información es aportada por los usuarios.

**Métrica principal de éxito:** ≥100 reportes orgánicos en los primeros 30 días en una ciudad piloto.

## 3. Usuarios principales

| Usuario | Descripción | Motivación |
|---------|-------------|------------|
| Vecino reportador | Persona que ve un volquete y lo reporta | Contribuir a la comunidad, quejarse de mal ubicados |
| Vecino consultante | Persona que busca volquetes cerca | Necesita tirar escombros, verificar estado de su cuadra |
| Moderador/Admin | Operador del sistema | Mantener calidad de datos, eliminar spam |

## 4. Casos de uso

### CU-1: Reportar volquete
1. El usuario abre la web y ve el mapa centrado en su ubicación
2. Toca "Reportar volquete"
3. Selecciona ubicación (GPS o tap en mapa)
4. Elige estado (Visto, Lleno, Mal ubicado, Abandonado, En uso)
5. Opcionalmente sube foto y/o comentario
6. Envía el reporte → aparece un pin nuevo en el mapa

### CU-2: Confirmar volquete
1. El usuario ve un pin, toca y ve la ficha
2. Toca "Sigue ahí"
3. Se incrementa el contador y se extiende la expiración 24hs

### CU-3: Marcar como removido
1. El usuario ve un pin de un volquete que ya no está
2. Toca "Ya no está"
3. Si se acumulan ≥3 marcas de remoción, el reporte pasa a "removed"

### CU-4: Denunciar reporte
1. El usuario ve un reporte falso o inapropiado
2. Toca "Reportar problema"
3. El reporte pasa a "under_review" si acumula ≥2 denuncias

### CU-5: Moderar reportes
1. El admin entra al panel /admin
2. Ve listado de reportes (priorizando denunciados)
3. Puede aprobar, ocultar, marcar spam o eliminar imagen

## 5. Funciones incluidas en el MVP

- Mapa interactivo con OpenStreetMap + Leaflet
- Geolocalización del navegador (fallback a Buenos Aires)
- Reportar volquete con ubicación, estado, foto opcional y comentario
- Pins diferenciados por estado (colores)
- Filtro por estado
- Ficha de detalle del reporte
- Confirmación comunitaria ("Sigue ahí")
- Remoción comunitaria ("Ya no está")
- Denuncia de reportes
- Expiración automática a las 72hs (extensible con confirmaciones)
- Panel admin mínimo de moderación
- API propia conectada a PostgreSQL
- Diseño mobile-first responsive
- Interfaz en español

## 6. Funciones excluidas del MVP

- Login obligatorio / registro de usuarios
- Supabase
- Google Maps
- Pagos, marketplace, reservas
- App nativa móvil
- Chat entre usuarios
- Tracking en tiempo real
- Geocoding / búsqueda por dirección
- Ranking de empresas
- IA/ML
- Notificaciones push
- PWA offline

## 7. Riesgos principales

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Pocos reportes / baja adopción | Alto | Lanzar en barrio específico, seedear datos iniciales |
| Spam / reportes falsos | Medio | Rate limiting + moderación + denuncias comunitarias |
| Datos desactualizados | Medio | Expiración automática 72hs + confirmaciones |
| Abuso de storage (fotos) | Bajo | Límite 5MB, validación de MIME type |
| Problemas de geolocalización | Bajo | Fallback a selección manual en mapa |

## 8. Métricas de validación

- **Reportes creados** por día/semana
- **Confirmaciones** por reporte (engagement)
- **Usuarios únicos** (por fingerprint/cookie)
- **Tasa de expiración** vs confirmación (calidad de datos)
- **Reportes denunciados** / spam (salud de la comunidad)
- **Retención**: usuarios que vuelven en 7 días

## 9. Supuestos iniciales

- Los usuarios están dispuestos a reportar sin login
- La geolocalización del navegador es suficientemente precisa
- 72 horas es un tiempo razonable de expiración
- La moderación manual alcanza para la escala MVP
- Buenos Aires es la ciudad piloto

## 10. Alcance primera versión

Una web responsive que muestra un mapa con pins de volquetes reportados por la comunidad. Cualquier persona puede reportar, confirmar o marcar como removido sin crear cuenta. Los reportes expiran automáticamente. Un admin puede moderar contenido inapropiado. El backend es una API propia en Next.js conectada a PostgreSQL.
