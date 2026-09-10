[ 🌐 عربي ](README.ar.md) | [ 🇪🇸 Español ](README.sp.md) | [ 🇬🇧 English ](README.md)

# Libro Mayor de Inventario para Retail y Maquila: Plantilla de Excel Multitienda y Rastreador Web
### Sistema de Seguimiento de Inventario Orientado a Eventos y Soporte para la Toma de Decisiones para Cadenas de Suministro de Retail, Comercio Electrónico e Indumentaria

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-success)
![Tool](https://img.shields.io/badge/Tool-Inventory%20Decision%20Support-orange)

**Automatiza el seguimiento de tus SKU y la conciliación de stock en almacén con esta plantilla de gestión de inventario orientada a eventos.** Rastrea cada movimiento de inventario—desde la recepción a granel y el desglose de fabricación hasta las ventas minoristas omnicanal y las transferencias de almacén—a través de un único flujo de trabajo. Disponible como un panel de cadena de suministro gratuito basado en navegador y una plantilla premium de seguimiento de inventario en Excel descargable. No requiere instalación compleja de ERP ni registro en software en la nube.

**Sin registro. Sin instalación. Listo para usar en tu navegador.**

Prueba la lógica orientada a eventos a través de la aplicación web gratuita. Para operaciones comerciales continuas y sin conexión, mejora a la versión de Excel totalmente personalizable (respaldada por una garantía de devolución de dinero de 30 días, sin preguntas).

> 🌐 **Prueba la Demostración en Vivo**  
> [*Inicia el Panel de Seguimiento de Inventario Retail Gratuito Basado en Web*](https://hyvoid.github.io/Retail-and-Maquila-Inventory-Ledger/)
>
> 📥 **Descarga la Hoja de Cálculo**  
> [*Descarga la Plantilla Premium del Libro Mayor de Inventario en Excel para Operaciones Multitienda*](https://www.theseusworkshop.com/l/zllojx?utm_source=github&utm_medium=GitHub%20README&utm_campaign=readme%20new%20launch&utm_content=multistore-retail-maquila-inventory)

---

## Puntos Críticos de la Gestión de Inventario y Soluciones de Libro Mayor Automatizado

En lugar de conciliar manualmente los saldos de inventario en múltiples hojas de cálculo desconectadas—lo que lleva a stock fantasma y errores de cumplimiento—este libro de Excel reconstruye continuamente **posiciones de inventario en tiempo real a partir de eventos operativos**.

Este sistema resuelve directamente los puntos ciegos comunes de la cadena de suministro proporcionando visibilidad instantánea de:

- **Disponibilidad de Stock en Almacén:** Rastrea el inventario utilizable restante tras el desglose de producción, las transferencias internas y la merma de almacén registrada (merma).
- **Seguimiento Minorista Multilocalización:** Monitorea los niveles de inventario actuales de cada SKU en cada tienda física de retail o ubicación POS desde un único panel consolidado.
- **Costo de Ventas (COGS) y Valoración Precisos:** Vincula el valor de tu inventario a los costos unitarios reales definidos en tus datos maestros, reemplazando los saldos financieros estimados.
- **Seguimiento de Merma y Pérdidas Accionable:** Categoriza las pérdidas de producto por causa raíz operativa, mapeando métricas exactas para defectos de producción, daños en tránsito y merma en tiendas minoristas.
- **Rendimiento y Velocidad de SKU:** Compara el rendimiento de ventas POS junto con las tasas de agotamiento de inventario para identificar instantáneamente los ganadores de movimiento rápido y el stock muerto.
- **Indicadores Predictivos de Salud de Inventario:** Resalta escaseces de stock de seguridad, situaciones de exceso de stock y excepciones de la cadena de suministro antes de que impacten tu flujo de caja.

---

## Para Quién es Esto: Roles Objetivo y Casos de Uso de la Cadena de Suministro

Este libro de Excel está diseñado específicamente para organizaciones que gestionan inventario en almacenes centralizados y ubicaciones minoristas descentralizadas, apoyándose en arquitecturas flexibles de Excel o datos operativos exportados en CSV en lugar de implementaciones rígidas y costosas de ERP empresarial.

**Perfiles de Usuario Objetivo y Escenarios Operativos:**

- 🛍️ **Gerentes de Cadena de Suministro de Retail que requieren una Plantilla de Operaciones de Inventario:** Para orquestar la redistribución estratégica de stock entre tiendas en lugar de emitir ciegamente órdenes de compra (PO) cuando el stock aislado del almacén se agota.
- 🏭 **Gerentes de Producción de Indumentaria y Maquila que necesitan una Herramienta de Desglose a Granel:** Para rastrear sin errores la conversión de recepción a granel (pallets/cajas) en SKUs individuales y vendibles (matriz Modelo-Color-Talla).
- 📦 **Supervisores de Almacén que buscan una Hoja de Cálculo de Conteo Cíclico y Merma:** Para documentar continuamente las pérdidas de producto por causa operativa en lugar de esperar a una caótica conciliación física de fin de mes.
- 📊 **Analistas de Operaciones de Comercio Electrónico y Omnicanal que construyen KPIs:** Para ingerir rápidamente exportaciones CSV de POS (Point of Sale) o Shopify en un panel de gestión consolidado para reportes diarios.
- 🏪 **Dueños de Pequeñas y Medianas Empresas (PYME) que buscan una Alternativa ERP Ligera:** Para gestionar el enrutamiento de inventario multitienda y la rentabilidad sin la sobrecarga, los costos de capacitación y los retrasos de integración de los WMS (Warehouse Management Systems) a gran escala.

*(Nota: Este libro de Excel **no** está destinado a reemplazar sistemas empresariales de alto volumen que requieren bloqueo de transacciones concurrente en tiempo real o APIs activas de escaneo de códigos de barras.)*

---

## Tutorial de Inicio Rápido: Automatiza tu Flujo de Trabajo de Inventario (Paso a Paso)

Obtener información accionable de la cadena de suministro requiere solo unos pocos pasos estandarizados. No es necesario editar fórmulas complejas después de tu configuración inicial.

### 1. Configura las Reglas de Negocio (Configuración de Datos Maestros)
Abre la hoja de cálculo **Parameters** para mapear tu huella operativa. Define tu red de ubicaciones de almacén y tiendas, personaliza las categorías de merma, importa tus registros maestros de producto (SKUs) y establece los costos unitarios estándar. *Acción: Configura esto una vez; actualiza solo al agregar nuevas líneas de producto o sucursales minoristas.*

### 2. Importa Datos Operativos (Ingesta de CSV de POS y WMS)
Copia los registros transaccionales existentes en las tablas de eventos designadas. Simplemente pega datos de tus exportaciones de ERP, archivos CSV de Shopify/POS, registros de recepción de proveedores o hojas de Excel heredadas. *Acción: Pega los datos en las hojas de transacciones. No se requiere recálculo manual de fórmulas.*

### 3. Revisa los KPIs Operativos (Analítica del Panel)
Navega directamente a los motores de inventario o al panel de gestión visual. El sistema recalcula automáticamente el stock de almacén, la distribución de SKU multitienda, la valoración de inventario, los ingresos por ventas y el análisis de merma. *Acción: Usa estas perspectivas para tomar decisiones inmediatas de reabastecimiento o transferencia.*

### 4. Actualiza y Repite (Ciclo de Reabastecimiento Continuo)
Repite el proceso de importación de datos diariamente, semanalmente o mensualmente según tu ciclo de cumplimiento. Sin rediseñar archivos. Sin reconstruir enlaces rotos. Simplemente añade nuevos eventos comerciales y actualiza.

> 🚀 **Toma Acción:** ¿Listo para estandarizar tus operaciones? Una vez que hayas validado tu lógica de negocio en la prueba gratuita del navegador, **[Descarga la Plantilla de Inventario en Excel](https://www.theseusworkshop.com/l/zllojx?utm_source=github&utm_medium=GitHub%20README&utm_campaign=readme%20new%20launch&utm_content=retail-maquila-inventory-ledger)**. Consérvala localmente para construir una base de datos de cadena de suministro sin conexión, segura, repetible y permanente para tu negocio.

---

## El Concepto Central: Por Qué Construí este Marco Orientado a Eventos

Muchas empresas minoristas creen tener un *problema de inventario* sistémico cuando, en realidad, sufren de un *problema de arquitectura de información*.

Tradicionalmente, el stock se mantiene sobrescribiendo directamente los saldos. La recepción actualiza una hoja de cálculo. La producción actualiza otra. Los gerentes de tienda registran los datos de punto de venta en otro lugar. Eventualmente, los conteos cíclicos dejan de coincidir y el negocio pasa más tiempo auditando discrepancias de stock que optimizando realmente el cumplimiento.

**Construí este libro de Excel en torno a un cambio de paradigma: El Libro Mayor de Inventario Orientado a Eventos.**

En lugar de mantener saldos estáticos, cada actividad física se convierte en un evento inmutable. Recibir carga a granel, transferir mercancías, registrar daños en tránsito y registrar ventas minoristas se registran de forma independiente. El saldo de inventario se **reconstruye automáticamente a partir de estos eventos históricos**.

### La Trampa de Reabastecimiento Multitienda (Un Ejemplo)
Antes de usar este marco, un gerente de almacén podría ver que **el SKU MD-01 tiene solo 18 unidades restantes** en la instalación central y disparar una PO urgente al proveedor.

Al reconstruir la historia de eventos completa en toda la red omnicanal, esta plantilla revela la verdad:
- 60 unidades fueron transferidas a tiendas regionales ayer.
- 42 unidades permanecen sin vender en ubicaciones minoristas.
- El stock de seguridad del almacén parece bajo, pero *el inventario a nivel de toda la empresa está completamente saludable*.

**La decisión cambia por completo:** En lugar de desperdiciar efectivo fabricando más inventario, la gerencia redistribuye el stock minorista existente para satisfacer la demanda. Esta lógica es universalmente aplicable, por lo que esta plantilla está estructurada como un activo reutilizable de soporte para la toma de decisiones.

---

## Comparación del Sistema: Hojas de Cálculo Manuales vs. Libro Mayor Orientado a Eventos

| Desafío Típico de la Cadena de Suministro Minorista | Limitaciones de Hojas de Cálculo Manuales | Solución de Libro Mayor Orientado a Eventos |
|-----------------------------------------------------|-------------------------------------------|---------------------------------------------|
| **Stock Fantasma y Deriva de Saldos** | Los ajustes manuales sobrescriben permanentemente el historial, haciendo imposible auditar las discrepancias de stock histórico. | Cada movimiento permanece rastreable como un evento comercial inmutable, creando una pista de auditoría a prueba de balas. |
| **Algoritmos de Reabastecimiento Defectuosos** | Las decisiones de compra dependen exclusivamente de saldos aislados del almacén, causando exceso de stock minorista. | El inventario del almacén central y de las tiendas descentralizadas se evalúa de manera holística antes de emitir POs. |
| **Detección Tardía de Merma** | La merma de inventario se acumula de forma invisible hasta el temido conteo cíclico físico de fin de mes. | La merma (Waste/Merma) se categoriza por causa operativa (daño, robo) y se cuantifica continuamente en tiempo real. |
| **Complejidad de Escalado Multitienda** | Agregar nuevas ubicaciones minoristas requiere construir nuevas pestañas de hoja de cálculo y vincular laboriosamente fórmulas frágiles. | Las nuevas ubicaciones POS se pueblan automáticamente en la matriz dinámica multitienda sin ningún rediseño de fórmulas. |
| **Seguimiento de COGS y Márgenes Impreciso** | Las cantidades de stock y los costos unitarios financieros se mantienen en archivos financieros separados y no sincronizados. | Los niveles de inventario y los datos de costo estándar permanecen perfectamente bloqueados mediante registros maestros de SKU estandarizados. |

---

## Detalles Técnicos

<details>
<summary><strong>Para Analistas de Datos, Practicantes de Excel y Arquitectos de Cadena de Suministro</strong></summary>

---

### Arquitectura de Datos del Libro Mayor

La plantilla impone una separación estricta entre la entrada de datos (insumos) y el cálculo de inventario (salidas).

```text
Parameters & Product Master Data
        │
        ▼
──────────────────────────────────────
Operational Event Data Ingestion
──────────────────────────────────────
Bulk Receiving Log
Production & SKU Breakdown
Shrinkage & Waste (Merma)
Warehouse to Store Transfers
POS Sales & Fulfillment
        │
        ▼
──────────────────────────────────────
Dynamic Calculation Engines
──────────────────────────────────────
Warehouse Inventory Array Engine
Retail Store Matrix Engine
        │
        ▼
──────────────────────────────────────
Management Dashboard UI
──────────────────────────────────────
Automated KPI Cards
Safety Stock & Inventory Health
Omnichannel Sales Performance
Financial Valuation & COGS

```

Los datos fluyen estrictamente en una dirección: **Configuración → Eventos de Negocio → Motor de Inventario → Panel**.

### Referencia de Fórmulas Técnicas (Motor de Excel)

* **Generación de SKU:** `Model & "-" & Color & "-" & Size` (Crea claves primarias únicas)
* **Recuperación de Costo:** `XLOOKUP()` (Vincula el costo estándar a los datos de transacción)
* **Estimación de Recepción:** `Box Qty × Pieces per Box`

* **Listas Dinámicas de SKU y Tiendas:** Utiliza `UNIQUE()` y `FILTER()` para expandir automáticamente la matriz de seguimiento a medida que se introducen nuevos productos o tiendas.
* **Matriz de Tabulación Cruzada:** Utiliza `TRANSPOSE()` para pivotar tiendas contra SKUs.
* **Agregación de Eventos:** Utiliza una lógica robusta de `SUMIFS()` para calcular combinaciones de `Production - Transfers - Waste - Sales` en intersecciones específicas de ubicación/SKU.

* **Aplicación de Clave Foránea:** Los SKUs, los ID de Tienda y los Tipos de Merma deben existir en los Datos Maestros/Parámetros, previniendo errores fatales de inventario por errores tipográficos.
* **Reglas de Tipo de Datos:** Las cantidades de Transferencia y Ventas se restringen a enteros positivos para prevenir rupturas de la lógica matemática (p. ej., stock físico negativo).

</details>

---

## La Lógica de Negocio y la Metodología

En su núcleo, esta herramienta abandona el hábito tradicional de "sobrescritura de saldos" común en la gestión de inventario de Excel, reemplazándolo con principios de **Contabilidad Orientada a Eventos (Event-Sourced Accounting)**. Al tratar los movimientos físicos de la cadena de suministro como eventos de datos inmutables, el sistema resuelve problemas comerciales estructurales que típicamente fuerzan a las empresas en crecimiento a realizar actualizaciones de ERP prematuras y costosas.

Aquí está la metodología exacta utilizada para resolver desafíos críticos de inventario de retail y maquila:

### 1. Metodología: Reconstrucción de Estado Orientada a Eventos
- **El Problema de Negocio (Stock Fantasma y Falla de Auditoría):** Cuando el personal de almacén sobrescribe manualmente las celdas de la hoja de cálculo para actualizar el stock actual, el contexto histórico de *por qué* cambió el número se destruye permanentemente. Esto crea discrepancias inrastreables entre el libro mayor y el conteo físico.
- **La Lógica:** Este sistema utiliza una arquitectura de solo adición (append-only). Cada movimiento físico—Recepción a Granel, Desglose de Producción, Transferencia de Almacén o Venta POS—se registra como un evento independiente e inmutable. El saldo de inventario actual nunca se escribe manualmente; se reconstruye dinámicamente calculando la suma neta de estos eventos históricos.
- **El Resultado (100% Auditabilidad):** Los gerentes de cadena de suministro obtienen una pista de auditoría a prueba de balas. Si un conteo físico de stock no coincide con el sistema, la gerencia puede rastrear cada transacción cronológicamente para localizar la falla operativa exacta (p. ej., un registro de transferencia faltante o una venta no registrada).

### 2. Metodología: Matriz de Agregación de Stock de Global a Local
- **El Problema de Negocio (Mala Asignación de Capital de Trabajo):** Los gerentes de compras a menudo emiten nuevas Órdenes de Compra (POs) simplemente porque el almacén central está vacío, ignorando completamente el exceso de stock ocioso en sucursales minoristas descentralizadas. Esto atrapa valioso capital de trabajo en exceso de stock innecesario.
- **La Lógica:** El motor de cálculo desacopla el *activo de inventario* de la *ubicación de almacenamiento*. Genera una matriz de tabulación cruzada en tiempo real que evalúa el inventario de tienda local (nivel de nodo) contra el inventario global de la empresa (nivel de red) simultáneamente.
- **El Resultado (Optimización Omnicanal):** Los equipos de operaciones pueden ejecutar un reequilibrio estratégico de inventario. Antes de desplegar efectivo para fabricar bienes totalmente nuevos, la gerencia puede activar transferencias laterales de tienda a tienda o liquidar stock muerto de ubicaciones de movimiento lento.

### 3. Metodología: Atribución de Merma por Causa Raíz (Merma)
- **El Problema de Negocio (Erosión Invisible del Margen):** La mayoría de las PYMEs tratan la pérdida de inventario como un "costo de hacer negocios" genérico, descubriendo el impacto financiero solo durante la conciliación de fin de mes cuando ya es demasiado tarde para corregirlo.
- **La Lógica:** La merma se saca de las sombras y se registra como eventos operativos específicos vinculados directamente a los costos unitarios estándar (COGS). Las pérdidas se categorizan explícitamente por causa raíz: Defectos de Producción (Maquila), Daño en Tránsito (Logística) o Robo Minorista (Operaciones de Tienda).
- **El Resultado (Prevención de Pérdidas Accionable):** En lugar de aceptar un impacto de margen genérico, los controladores financieros pueden identificar exactamente dónde se filtra el valor. Si un lote de producción específico genera defectos altos, o una ruta de transporte específica muestra daños en tránsito elevados, la gerencia puede intervenir de inmediato basándose en datos financieros cuantificados.

---

## Explora Más Marcos de Cadena de Suministro y Financieros

Si encontraste valioso este plantilla operativa, explora mis otros conjuntos de herramientas de soporte para la toma de decisiones diseñados para operadores y analistas:

* **Conjunto de Herramientas de Costo de Mano de Obra de Fabricación y Planificación de Capacidad** — Analiza la eficiencia de la fuerza laboral, los cuellos de botella de capacidad de producción y los costos unitarios de fabricación.
* **Consola de Gobernanza de Inventario DTC Transfronteriza** — Optimiza el enrutamiento de reabastecimiento y la asignación de stock global en redes de cumplimiento internacional.
* **Marco de Presupuesto Unificado Personal y Empresarial** — Gestiona la riqueza personal y el flujo de caja de la PYME dentro de un modelo financiero integrado.
* **Dimensionador y Fijador de Precios de Préstamos Transicionales Residenciales** — Evalúa escenarios de préstamos inmobiliarios, estructuras de capital y métricas de viabilidad de proyectos.

Sigue mi perfil de GitHub y visita nuestro [Sitio Web](https://www.theseusworkshop.com/) para próximos lanzamientos de productos.

---

## Licencia

Este proyecto de software y la documentación que lo acompaña se publican bajo la **Licencia Apache 2.0**. Eres libre de usar, modificar y distribuir este conjunto de herramientas de acuerdo con los términos de la licencia de código abierto Apache 2.0.