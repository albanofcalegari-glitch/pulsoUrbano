# Pulso Urbano — Especificacion MVP

## 1. Problema

En ciudades argentinas, los volquetes, escombros, obras y objetos utiles aparecen y desaparecen de la via publica sin registro comunitario. Los vecinos no saben que esta pasando en su barrio: donde hay un volquete lleno, una vereda bloqueada o un mueble disponible para retirar. No existe una herramienta vecinal que permita visualizar esta informacion de forma inmediata y colaborativa.

Los canales oficiales (miBA, BA 147) estan orientados a tramites, reclamos y expedientes gubernamentales. Pulso Urbano cubre un espacio distinto: la capa cotidiana del barrio, vista por vecinos.

## 2. Objetivo del MVP

Validar que existe una comunidad dispuesta a compartir y consultar avisos del barrio en un mapa colaborativo. El MVP NO es un marketplace, una app de denuncias, una app de transito ni un reemplazo de canales oficiales — es un mapa comunitario donde la informacion es aportada por los vecinos.

**Foco inicial fuerte: volquetes**, como categoria concreta que ancla el producto. El producto escala a avisos urbanos generales y objetos compartidos por vecinos.

**Metrica principal de exito:** >=100 avisos organicos en los primeros 30 dias en una zona piloto.

## 3. Usuarios principales

| Usuario | Descripcion | Motivacion |
|---------|-------------|------------|
| Vecino que publica | Persona que ve algo en el barrio y lo comparte | Contribuir a la comunidad, informar sobre situaciones visibles |
| Vecino que consulta | Persona que quiere saber que pasa cerca | Ver el estado de su cuadra, encontrar objetos disponibles |
| Moderador/Admin | Operador del sistema | Mantener calidad de datos, moderar contenido |

## 4. Casos de uso

### CU-1: Agregar aviso al mapa
1. El usuario abre la web y ve el mapa centrado en su ubicacion
2. Toca "Agregar al mapa"
3. Selecciona tipo (aviso urbano o compartido por vecinos)
4. Elige categoria y estado
5. Marca ubicacion (GPS, busqueda de direccion o toque en mapa)
6. Sube foto y opcionalmente agrega comentario
7. Envia el aviso -> aparece un pin nuevo en el mapa

### CU-2: Confirmar aviso
1. El usuario ve un pin, toca y ve la ficha
2. Toca "Sigue ahi"
3. Se incrementa el contador y se extiende la expiracion 24hs

### CU-3: Marcar como removido
1. El usuario ve un pin de algo que ya no esta
2. Toca "Ya no esta"
3. Si se acumulan >=3 marcas de remocion, el aviso pasa a "removed"

### CU-4: Senalar aviso
1. El usuario ve un aviso falso o inapropiado
2. Toca "Problema"
3. El aviso pasa a "under_review" si acumula >=3 senalizaciones

### CU-5: Moderar avisos
1. El admin entra al panel /admin
2. Ve listado de avisos (priorizando senalados)
3. Puede aprobar, ocultar, marcar spam o bloquear al vecino

## 5. Funciones incluidas en el MVP

- Mapa interactivo con OpenStreetMap + Leaflet
- Geolocalizacion del navegador (fallback a Buenos Aires)
- 14 categorias de aviso (8 urbanas + 6 compartidas por vecinos)
- Busqueda de direccion (Nominatim/OSM)
- Foto con upload a storage
- Confirmacion comunitaria ("Sigue ahi")
- Remocion comunitaria ("Ya no esta")
- Senalamiento para revision
- Expiracion automatica a las 72hs (extensible con confirmaciones)
- Sistema de confianza (trust score + estrellas)
- Sistema de confianza del aviso (confidence score)
- Validacion de ubicacion (GPS vs punto marcado, 150m)
- Auth con email verificado (JWT + httpOnly cookies)
- Panel admin con dashboard, moderacion, usuarios y feedback
- Rate limiting por nivel de confianza
- Diseno mobile-first responsive
- Interfaz en espanol
- Feedback de beta integrado

## 6. Funciones excluidas del MVP

- Marketplace, ventas, trueques, reservas
- Pagos o transacciones
- Chat entre usuarios
- App nativa movil
- Tracking en tiempo real
- Push notifications
- Feed cronologico del barrio
- Seguir zona
- Deteccion de duplicados
- Servicios del barrio (fletes, mudanzas, alquileres)
- Tramites, reclamos o denuncias formales
- Transito, accidentes, emergencias, delitos, politica
- Perfiles de prestador de servicios
- IA/ML
- PWA offline

## 7. Que NO es Pulso Urbano

- No es una app de transito (no es Waze)
- No es una app de denuncias ni policial
- No es una app de emergencias (no reemplaza 911)
- No es un marketplace ni clasificados
- No es un reemplazo de miBA ni BA Colaborativa
- No es un canal oficial de reclamos (no reemplaza BA 147)
- No es una app politica

## 8. Riesgos principales

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| Pocos avisos / baja adopcion | Alto | Lanzar en barrio especifico, seedear datos iniciales |
| Spam / avisos falsos | Medio | Rate limiting + moderacion + senalamiento comunitario + trust score |
| Datos desactualizados | Medio | Expiracion automatica 72hs + confirmaciones |
| Abuso de storage (fotos) | Bajo | Limite 5MB, validacion de MIME type |
| Problemas de geolocalizacion | Bajo | Fallback a seleccion manual en mapa + busqueda de direccion |
| Confusion con canal oficial | Medio | Disclaimer visible en el mapa |

## 9. Metricas de validacion

- **Avisos creados** por dia/semana
- **Confirmaciones** por aviso (engagement)
- **Usuarios registrados** y verificados
- **Tasa de expiracion** vs confirmacion (calidad de datos)
- **Avisos senalados** / spam (salud de la comunidad)
- **Retencion**: usuarios que vuelven en 7 dias
- **Feedback de beta**: volumen y tipo

## 10. Alcance primera version

Una web responsive que muestra un mapa comunitario del barrio. Los vecinos registrados agregan avisos con foto y ubicacion. Otros vecinos confirman o marcan como removidos. Los avisos expiran automaticamente. Un admin modera contenido. El foco inicial son volquetes, con soporte completo para avisos urbanos y objetos compartidos por vecinos.
