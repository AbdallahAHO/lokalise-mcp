

# Servidor MCP de Lokalise

> **⚠️ Aviso Legal**: Este es un proyecto personal no oficial y no está afiliado, respaldado ni asociado con Lokalise Inc. Utiliza el SDK de Node.js de código abierto [Lokalise Node.js SDK](https://github.com/lokalise/node-api) para proporcionar la integración MCP. Todo el código y la implementación son mi propio trabajo.

<div align="center">
  <b>Lleva el poder de Lokalise a tu asistente de IA</b>

  [![smithery badge](https://smithery.ai/badge/@AbdallahAHO/lokalise-mcp)](https://smithery.ai/server/@AbdallahAHO/lokalise-mcp)
  [![NPM Version](https://img.shields.io/npm/v/lokalise-mcp)](https://www.npmjs.com/package/lokalise-mcp)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
</div>

## 🎯 ¿Qué es esto?

El Servidor MCP de Lokalise conecta asistentes de IA como Claude con [Lokalise](https://lokalise.com), la plataforma líder de gestión de traducciones. A través de conversaciones naturales, puedes gestionar proyectos de traducción, actualizar contenido y automatizar flujos de trabajo de localización, sin necesidad de programar.

**Perfecto para:** Gerentes de Producto • Desarrolladores • Equipos de Localización • Equipos de Contenido

---

## 🚀 Características y Capacidades Principales

Transforma tu flujo de trabajo de localización con **59 herramientas** en **11 dominios** y **17 plantillas de automatización predefinidas**:

| Categoría de Funcionalidad | Capacidades | Lo que Obtienes |
|-----------------|-------------|--------------|
| **🎯 Gestión Estratégica** | Análisis de portafolio, monitoreo de salud del proyecto, coordinación de equipos | Perspectivas ejecutivas, identificación de cuellos de botella, optimización de recursos |
| **🔤 Operaciones Inteligentes de Contenido** | Operaciones masivas de claves (1000+ a la vez), filtrado por nombre de archivo, etiquetado por plataforma | Gestión de contenido listo para lanzamiento, coordinación iOS/Android/Web |
| **🌍 Expansión Global** | Adición de idiomas, seguimiento de progreso, análisis de finalización | Automatización de entrada al mercado, métricas de velocidad de traducción |
| **👥 Orquestación de Equipos** | Grupos de usuarios, permisos, distribución de carga de trabajo, asignación de revisores | Estructura de equipo óptima, asignaciones conscientes de zonas horarias |
| **🔄 Automatización de Flujos de Trabajo** | Procesamiento de archivos, integración TM+MT, pipelines de revisión multinivel | Automatización de extremo a extremo, controles de calidad, reglas de escalación |
| **📊 Monitoreo en Tiempo Real** | Dashboards de procesos, registros de auditoría, seguimiento de operaciones masivas | Visibilidad operativa, detección de fallos, métricas de rendimiento |
| **🔒 Seguridad Empresarial** | Autenticación multicapa, manejo seguro de tokens, límite de tasa | Seguridad lista para producción, soporte de cumplimiento |

### 🎯 **¿Por qué usar Lokalise MCP?**

| **Enfoque Tradicional** | **Con Lokalise MCP** |
|--------------------------|----------------------|
| Análisis manual de proyectos en múltiples pantallas | "Analiza mi portafolio" → Perspectivas estratégicas instantáneas |
| Horas configurando flujos de trabajo de revisión | "Crea tareas de revisión para el archivo cargado" → Listo en segundos |
| Gestión compleja de permisos de equipo | "Configura equipos para 3 nuevos mercados" → Estructura automatizada |
| Resolución reactiva de problemas | Identificación proactiva de cuellos de botella y recomendaciones |
| Operaciones herramienta por herramienta | Flujos de trabajo orquestados con múltiples herramientas con un solo prompt |

## ✨ Ve el Proyecto en Acción

Copia estos prompts para experimentar una orquestación sofisticada de múltiples herramientas. Desde solicitudes simples hasta patrones avanzados: Claude maneja la complejidad automáticamente:


### 💻 **Flujo de Trabajo de Desarrollo React i18n (IDE Cursor)**
*MCP Tools: `lokalise_list_projects` → `lokalise_list_keys` → `lokalise_create_keys` → `lokalise_list_usergroups` → `lokalise_create_task`*

```
Prompt: "Estoy trabajando en un nuevo flujo de pago en React. Por favor, analiza mis componentes 
actuales, extrae todas las cadenas codificadas que necesitan internacionalización, 
conviértelas en claves i18n usando nuestra convención de nomenclatura (checkout.step1.title),
refactoriza el JSX para usar nuestros hooks i18next, luego sincroniza las nuevas claves con nuestro
proyecto 'Mobile App' en Lokalise y crea tareas de traducción para nuestros mercados de la UE usando las herramientas relevantes en el Lokalise MCP configurado.

Usa estas herramientas exactas de Lokalise MCP:
- lokalise_list_projects (para encontrar el proyecto Mobile App)
- lokalise_list_keys (para verificar claves existentes)
- lokalise_create_keys (para cargar nuevas claves i18n)
- lokalise_list_usergroups (para encontrar los equipos de traducción de la UE)
- lokalise_create_task (para crear tareas de traducción)"

// Before: components/checkout/PaymentStep.tsx
const PaymentStep = () => (
  <div>
    <h2>Payment Information</h2>
    <p>Enter your card details below</p>
    <button>Continue to Review</button>
  </div>
);

Lo que Claude orquesta con las herramientas MCP:
✓ `lokalise_list_projects` - Localiza el proyecto 'Mobile App'
✓ `lokalise_list_keys` - Valida contra claves existentes para prevenir duplicados
✓ `lokalise_create_keys` - Carga masiva de nuevas claves i18n con etiquetas de plataforma:
  [{
    key_name: "checkout.payment.title",
    platforms: ["web", "ios", "android"],
    translations: [{ language_iso: "en", translation: "Payment Information" }]
  }]
✓ `lokalise_list_usergroups` - Resuelve "mercados de la UE" a equipos de traducción específicos
✓ `lokalise_create_task` - Crea tareas de traducción para DE, FR, ES, IT con asignaciones de equipo
✓ Refactoriza automáticamente el JSX para usar hooks useTranslation
✓ Actualiza los archivos JSON i18n locales con la nueva estructura de claves

// After: Automatically refactored
const PaymentStep = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t('checkout.payment.title')}</h2>
      <p>{t('checkout.payment.subtitle')}</p>
      <button>{t('checkout.payment.continue')}</button>
    </div>
  );
};

Resultado: Código internacionalizado, 12 nuevas claves sincronizadas a través de las herramientas de Lokalise MCP,
tareas de traducción creadas para 4 idiomas, todo sin salir de tu IDE.
El flujo de trabajo de desarrollo permanece ininterrumpido mientras la configuración de localización ocurre
automáticamente a través de la integración directa con MCP de Lokalise.
```


### 📊 **Automatización de Carga de Traducciones CSV**
*Triggers: `lokalise_list_projects` → Análisis CSV → `lokalise_create_keys` (masivo) → `lokalise_list_project_languages` → `lokalise_create_task` (por idioma)*

```
Prompt: "Adjunto nuestra última exportación de cadenas de funciones desde Producto. Es un CSV con
columnas: key_id, context, en_source, es_draft, fr_draft. Usando las herramientas relevantes en el Lokalise MCP configurado; Por favor, carga estas 50 nuevas claves en nuestro proyecto 'E-commerce Platform', crea tareas de traducción para los idiomas
faltantes (alemán, italiano, portugués) y asígnalas a nuestros equipos regionales relevantes.
El equipo de Producto quiere esto lanzado antes de finales del sprint (15 de marzo)."

[Adjunto: feature_v3_strings.csv]

Lo que Claude orquesta:
✓ Analiza el CSV y valida la estructura de columnas
✓ Localiza el proyecto E-commerce Platform
✓ Crea 50 claves con fuente en inglés + borradores en español/francés
✓ Identifica idiomas objetivo faltantes (DE, IT, PT)
✓ Resuelve automáticamente las asignaciones de equipos regionales
✓ Crea tareas de traducción separadas por idioma/equipo
✓ Establece el plazo del 15 de marzo con margen para revisión
✓ Proporciona resumen de carga + URLs de seguimiento de tareas

Resultado: 50 claves cargadas, 3 tareas de traducción creadas, equipos notificados—
lo que antes tomaba 2 horas de importaciones manuales de CSV, creación de claves y configuración de tareas
ahora ocurre en 30 segundos con registro de auditoría completo y coordinación de equipo.
```

### 🎯 **Dashboard Estratégico de Portafolio**
*Triggers: `lokalise_list_projects` → `lokalise_get_project` (paralelo) → `lokalise_list_project_languages` → `lokalise_list_tasks`*

```
Prompt: "Necesito una visión general estratégica de mi portafolio de localización. Usando las herramientas relevantes en el Lokalise MCP configurado;
Muéstrame qué proyectos necesitan atención inmediata, identifica cuellos de botella entre equipos y dame recomendaciones
basadas en datos para la asignación de recursos. Incluye tasas de finalización, backlogs de tareas y
cualquier proyecto que no haya tenido actividad en los últimos 30 días."

Lo que Claude hace automáticamente:
✓ Obtiene todos los proyectos con estadísticas
✓ Analiza la salud de cada proyecto en paralelo
✓ Cruza referencias de carga de trabajo de equipos
✓ Identifica proyectos estancados y tareas vencidas
✓ Genera recomendaciones estratégicas

Resultado: Perspectivas de nivel ejecutivo en las que puedes actuar inmediatamente
```

### 🔄 **Flujo de Trabajo Inteligente de Procesamiento de Archivos**
*Triggers: `lokalise_list_projects` → `lokalise_list_keys` (filtrar por nombre de archivo) → `lokalise_list_usergroups` + `lokalise_list_contributors` → `lokalise_list_project_languages` → `lokalise_create_task` (múltiples)*

```
Prompt: "Acabo de cargar 'user-onboarding-v2.json' en mi proyecto Mobile App a través de la interfaz de Lokalise.
El procesamiento TM+MT está listo. Ahora crea tareas de revisión para aseguramiento de calidad - asigna
el contenido en español a nuestro equipo de traducción EMEA, el francés a Marie (marie@ourcompany.com),
y el alemán a quien esté disponible en el equipo DACH. Establece el plazo para el próximo viernes."

Lo que Claude orquesta:
✓ Localiza tu proyecto Mobile App
✓ Encuentra todas las claves del archivo cargado
✓ Resuelve "equipo de traducción EMEA" → ID de grupo de usuarios
✓ Resuelve "marie@ourcompany.com" → ID de colaborador
✓ Encuentra miembros del equipo DACH y asigna de manera óptima
✓ Crea tareas de revisión separadas por idioma
✓ Establece plazos apropiados y descripciones de tareas

Resultado: Flujo de trabajo de revisión completo listo en segundos, no minutos de configuración manual
```


### 🚀 **Operaciones Masivas con Validación Inteligente**
*Triggers: `lokalise_list_projects` → `lokalise_list_keys` (filtradas) → `lokalise_bulk_update_keys` → `lokalise_list_tasks` → `lokalise_create_task`*

```
Prompt: "Necesito limpiar nuestro lanzamiento de iOS. Encuentra todas las claves etiquetadas con 'onboarding' en todos
los proyectos, asegúrate de que tengan la designación de plataforma iOS, verifica que todas estén traducidas a
español y francés, y crea tareas de recuperación para cualquier traducción faltante. También verifica
si alguna de estas claves ha sido modificada en los últimos 7 días y podría necesitar una nueva revisión."

Lo que Claude coordina:
✓ Busca en todos los proyectos claves con etiqueta 'onboarding'
✓ Audita etiquetas de plataforma y añade iOS donde falte
✓ Cruza verificaciones de completitud de traducciones para español/francés
✓ Identifica claves modificadas recientemente que necesitan nueva revisión
✓ Crea tareas específicas para traducciones faltantes
✓ Proporciona resumen de cambios y trabajo restante

Resultado: Contenido listo para lanzamiento con registro de auditoría completo y plan de finalización
```

> **💡 Consejo Experto**: Cuanto más contexto y restricciones proporciones, más inteligente será la orquestación de Claude. Incluye plazos, prioridades, limitaciones del equipo y objetivos comerciales para maximizar el aprovechamiento de la IA.

---

## 🎯 Prompts de Flujo de Trabajo Integrados

Más allá de estos ejemplos, el servidor MCP incluye **17 plantillas de prompts sofisticadas** que orquestan flujos de trabajo complejos de múltiples herramientas automáticamente. Estos no son solo ejemplos, son plantillas listas para producción que puedes usar inmediatamente.

### 📋 **Suite de Gestión de Proyectos**
Prompts listos para usar para la supervisión estratégica de proyectos:

| Plantilla de Prompt | Qué Hace | Herramientas Orquestadas |
|----------------|--------------|-------------------|
| **`project_portfolio_overview`** | Análisis estratégico de todos los proyectos con identificación de cuellos de botella | 4-6 herramientas en paralelo |
| **`project_deep_dive`** | Análisis exhaustivo de salud de un proyecto específico | 6-8 herramientas coordinadas |
| **`new_project_setup`** | Creación completa de proyecto con idiomas y estructura inicial | 5-7 herramientas secuenciadas |
| **`project_cleanup`** | Eliminación segura de contenido obsoleto con análisis de impacto | 3-5 herramientas con validación |

### 🌍 **Suite de Flujo de Trabajo de Localización**
Expansión automatizada de idiomas y monitoreo de progreso:

| Plantilla de Prompt | Qué Hace | Herramientas Orquestadas |
|----------------|--------------|-------------------|
| **`language_expansion`** | Añade nuevos mercados con configuración y establecimiento de equipos adecuados | 4-6 herramientas coordinadas |
| **`translation_progress_check`** | Análisis exhaustivo de progreso con perspectivas accionables | 3-5 herramientas en paralelo |
| **`bulk_key_creation`** | Organización inteligente de contenido para nuevas funciones | 3-4 herramientas secuenciadas |

### 🔄 **Automatización Avanzada de Flujos de Trabajo**
Orquestación sofisticada multinivel:

| Plantilla de Prompt | Qué Hace | Herramientas Orquestadas |
|----------------|--------------|-------------------|
| **`post_upload_review_workflow`** | Pipeline completo de revisión para archivos cargados con asignación de equipo | 6-8 herramientas orquestadas |
| **`document_extraction_review_workflow`** | Extrae contenido CSV/JSON cargado como claves + crea tareas de traducción | 5-7 herramientas coordinadas |
| **`automated_review_pipeline`** | Revisión multinivel con controles de calidad y escalación | 8-10 herramientas orquestadas |
| **`team_translation_setup`** | Organiza equipos con distribución óptima de carga de trabajo | 6-8 herramientas coordinadas |

### 🚀 **Suite de Automatización Empresarial**
Flujos de trabajo listos para producción para operaciones complejas:

| Plantilla de Prompt | Qué Hace | Herramientas Orquestadas |
|----------------|--------------|-------------------|
| **`process_monitoring_dashboard`** | Monitoreo en tiempo real entre proyectos con detección de fallos | 4-6 herramientas en paralelo |
| **`user_group_audit`** | Análisis exhaustivo de equipos con recomendaciones de seguridad | 5-7 herramientas coordinadas |
| **`translation_memory_import`** | Integración inteligente de TM con resolución de conflictos | 6-8 herramientas orquestadas |
| **`bulk_operations_monitor`** | Rastrea y audita cambios a gran escala con información de rollback | 4-6 herramientas coordinadas |
| **`team_onboarding_workflow`** | Configuración completa de nuevos miembros con permisos y capacitación | 5-7 herramientas secuenciadas |

### 🎭 **Cómo Usar las Plantillas de Prompts**

```bash
# En Claude, simplemente referencia el nombre del prompt:
"Usa el prompt project_portfolio_overview del Lokalise MCP configurado para analizar mi portafolio de localización"

# O activa directamente con parámetros:
"Ejecuta el post_upload_review_workflow del Lokalise MCP configurado para 'user-guide.pdf' en el proyecto Mobile App,
asigna español al Equipo EMEA y francés a marie@company.com"

# Personaliza para tus necesidades:
"Usa el prompt team_translation_setup del Lokalise MCP configurado pero enfócate en la optimización de zona horaria
para nuestro equipo distribuido en 4 continentes"
```

**Beneficios de las Plantillas:**
- 🎯 **Curva de Aprendizaje Cero**: Flujos de trabajo predefinidos listos para usar
- 🚀 **Orquestación Multi-Herramienta**: Cada plantilla coordina 3-10 herramientas automáticamente
- 🧠 **Consciencia de Contexto**: Resolución inteligente de parámetros y manejo de errores
- 📊 **Salidas Ricas**: Informes formateados con perspectivas accionables
- ⚡ **Listo para Producción**: Probado en proyectos reales de localización

---


## 📦 Inicio Rápido

Ponlo en marcha en menos de 60 segundos:

### 🚀 **Recomendado: Instalación con un Clic**

[![smithery badge](https://smithery.ai/badge/@AbdallahAHO/lokalise-mcp)](https://smithery.ai/server/@AbdallahAHO/lokalise-mcp)

```bash
# Instalar para Claude Desktop (el más popular)
npx -y @smithery/cli install @AbdallahAHO/lokalise-mcp --client claude

# Otros clientes: cursor, vscode, raycast, gemini
```

**Qué ocurre:** Se instala automáticamente, configura los permisos, solicita tu clave API de Lokalise y está listo para usar.

### 🎯 **Métodos de Instalación Alternativos**

<details>
<summary><b>Extensión Claude Desktop (.dxt)</b></summary>

**Instalación local rápida, no requiere Node.js:**

1. Descarga el último `.dxt` desde [Releases](https://github.com/AbdallahAHO/lokalise-mcp/releases)
2. Haz doble clic o arrastra a Claude Desktop → Configuración → Extensiones
3. Ingresa tu `LOKALISE_API_KEY` cuando se solicite
4. Verifica: "¿Puedes listar mis proyectos de Lokalise?"

</details>

<details>
<summary><b>NPX (Sin Instalación)</b></summary>

**Ejecuta directamente sin instalar:**

```bash
# Ejecución directa
npx lokalise-mcp
```

**Configuración Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "lokalise": {
      "command": "npx",
      "args": ["-y", "lokalise-mcp"],
      "env": {"LOKALISE_API_KEY": "your-api-key-here"}
    }
  }
}
```

</details>

<details>
<summary><b>Instalación Global</b></summary>

```bash
npm install -g lokalise-mcp
lokalise-mcp  # Ejecutar el servidor
```

</details>

### 🔑 **Obtén tu Clave API**

1. Inicia sesión en [Lokalise](https://app.lokalise.com)
2. Ve a **Perfil** → **Tokens API** ([https://app.lokalise.com/profile#apitokens](https://app.lokalise.com/profile#apitokens))
3. Haz clic en **Generar nuevo token**
4. Copia y guarda de forma segura

## ⚙️ Configuración

### Configuración de la Clave API

La clave API de Lokalise se puede configurar de varias formas (en orden de prioridad):

1. **Variable de Entorno** (Recomendado por seguridad):
   ```bash
   export LOKALISE_API_KEY="your-api-key-here"
   ```

2. **Archivo `.env`** (Para desarrollo local):
   ```bash
   cp .env.example .env
   # Edita .env y añade tu clave API
   ```

3. **Configuración Global MCP** (`~/.mcp/configs.json`):
   ```json
   {
     "lokalise-mcp": {
       "LOKALISE_API_KEY": "your-api-key-here"
     }
   }
   ```

### Obtención de tu Token API

1. Inicia sesión en [Lokalise](https://app.lokalise.com)
2. Navega a **Perfil** → **Tokens API** ([https://app.lokalise.com/profile#apitokens](https://app.lokalise.com/profile#apitokens))
3. Haz clic en **Generar nuevo token**
4. Copia el token y guárdalo de forma segura

## 🚀 Ejecución del Servidor

```bash
# Modo HTTP (recomendado para desarrollo)
npm run mcp:http

# Modo STDIO (para integración con Claude Desktop)
npm run mcp:stdio

# Modo CLI (comandos directos)
npm run cli -- list-projects
```

## 🤖 Uso con Claude Desktop

### Verificación Rápida

Una vez instalado, puedes verificar la conexión preguntando a Claude:

> "¿Puedes listar mis proyectos de Lokalise?"

Claude usará la herramienta `lokalise_list_projects` para obtener y mostrar tus proyectos.

### Configuración de Claude Desktop

Si se instaló a través de Smithery, no se necesita configuración manual. Verifica buscando el icono 🔌 y preguntando a Claude: "¿Puedes listar mis proyectos de Lokalise?"

### ✅ **Verificación**

Una vez instalado, prueba la conexión:
```
"¿Puedes listar mis proyectos de Lokalise?"
```

Claude usará la herramienta `lokalise_list_projects` y mostrará tus proyectos con estadísticas.

## 📚 Herramientas Disponibles

El servidor proporciona **59 herramientas MCP** que cubren todas las operaciones principales de Lokalise en **11 dominios**:

<details>
<summary><b>Haz clic para ver todas las herramientas disponibles</b></summary>

### Proyectos (6 herramientas)
- `lokalise_list_projects` - Lista todos los proyectos con estadísticas
- `lokalise_get_project` - Obtiene información detallada del proyecto
- `lokalise_create_project` - Crea un nuevo proyecto
- `lokalise_update_project` - Actualiza la configuración del proyecto
- `lokalise_delete_project` - Elimina un proyecto
- `lokalise_empty_project` - Elimina todas las claves de un proyecto

### Claves (7 herramientas) - **Mejoradas con filtrado por archivos**
- `lokalise_list_keys` - Lista claves con **NUEVO: soporte filterFilenames**
- `lokalise_get_key` - Obtiene información detallada de la clave
- `lokalise_create_keys` - Crea múltiples claves a la vez (hasta 1000)
- `lokalise_update_key` - Actualiza una sola clave
- `lokalise_bulk_update_keys` - Actualiza múltiples claves
- `lokalise_delete_key` - Elimina una sola clave
- `lokalise_bulk_delete_keys` - Elimina múltiples claves

### Idiomas (6 herramientas)
- `lokalise_list_system_languages` - Lista todos los idiomas disponibles
- `lokalise_list_project_languages` - Lista idiomas del proyecto
- `lokalise_add_project_languages` - Añade idiomas al proyecto
- `lokalise_get_language` - Obtiene detalles del idioma
- `lokalise_update_language` - Actualiza la configuración del idioma
- `lokalise_remove_language` - Elimina un idioma

### Grupos de Usuarios (8 herramientas) - **NUEVO**
- `lokalise_list_usergroups` - Lista todos los grupos de usuarios
- `lokalise_get_usergroup` - Obtiene detalles del grupo
- `lokalise_create_usergroup` - Crea nuevo grupo
- `lokalise_update_usergroup` - Actualiza configuración del grupo
- `lokalise_delete_usergroup` - Elimina grupo
- `lokalise_add_members_to_group` - Añade miembros al grupo
- `lokalise_remove_members_from_group` - Elimina miembros del grupo
- `lokalise_add_projects_to_group` - Asigna proyectos al grupo

### Traducciones (4 herramientas)
- `lokalise_list_translations` - Lista con paginación por cursor
- `lokalise_get_translation` - Obtiene detalles de la traducción
- `lokalise_update_translation` - Actualiza una traducción
- `lokalise_bulk_update_translations` - Actualizaciones masivas con límite de tasa

### Colecciones Adicionales
- **Colaboradores** (6 herramientas) - Gestiona miembros del equipo del proyecto
- **Tareas** (5 herramientas) - Crea y gestiona tareas de traducción
- **Comentarios** (5 herramientas) - Maneja comentarios de claves y discusiones
- **Glosario** (5 herramientas) - Mantiene consistencia de terminología
- **Usuarios de Equipo** (4 herramientas) - **NUEVO** - Gestión de usuarios del espacio de trabajo
- **Procesos en Cola** (2 herramientas) - **NUEVO** - Monitorea operaciones en segundo plano

</details>

## 🛠️ Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Predeterminado |
|----------|-------------|---------|
| `LOKALISE_API_KEY` | Tu token API de Lokalise (requerido) | - |
| `TRANSPORT_MODE` | Modo del servidor: `http` o `stdio` | `http` |
| `PORT` | Puerto del servidor HTTP | `3000` |
| `DEBUG` | Habilitar registro de depuración | `false` |

## 🐛 Solución de Problemas

**"Autenticación fallida"**
- Verifica que tu token API sea correcto
- Revisa los permisos del token en la configuración de Lokalise
- Asegúrate de que el token tenga acceso apropiado al proyecto

**"Límite de tasa excedido"**
- El servidor incluye limitación de tasa automática
- Para operaciones de alto volumen, considera agruparlas
- Espera 60 segundos antes de reintentar

**"Conexión rechazada"**
- Para modo HTTP: Asegúrate de que el servidor se esté ejecutando (`npm run mcp:http`)
- Para modo STDIO: Revisa la configuración de Claude Desktop
- Verifica la configuración del firewall para el puerto 3000

### Ubicaciones de Archivos de Configuración

**Configuración Claude Desktop:**
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuración Global MCP:**
- Todas las plataformas: `~/.mcp/configs.json`

### Modo Depuración

Habilita registro detallado:
```bash
# Para desarrollo
DEBUG=true npm run mcp:http

# En configuración de Claude Desktop
"env": {
  "LOKALISE_API_KEY": "your-key",
  "DEBUG": "true"
}
```

### Obtener Ayuda

1. Revisa esta sección de solución de problemas
2. Consulta [GitHub Issues](https://github.com/AbdallahAHO/lokalise-mcp/issues)
3. Habilita el modo depuración para mensajes de error detallados
4. Contacta a soporte con los registros de depuración

## 📄 Licencia

Licencia MIT - consulta [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

¡Aceptamos contribuciones! Consulta nuestra [Guía de Contribución](CONTRIBUTING.md) para detalles sobre:
- Configuración del entorno de desarrollo
- Arquitectura y organización del código
- Verificaciones automatizadas CI/CD en todos los PRs
- Proceso de lanzamiento y flujo de trabajo
- Creación de nuevas herramientas y dominios
- Envío de pull requests


## 🙏 Agradecimientos

- Construido sobre el [Model Context Protocol](https://modelcontextprotocol.io) de Anthropic
- Utiliza el SDK de código abierto [Lokalise Node.js SDK](https://github.com/lokalise/node-api)

---

<div align="center">
  <a href="https://github.com/AbdallahAHO/lokalise-mcp">⭐ Danos una estrella en GitHub</a> •
  <a href="https://github.com/AbdallahAHO/lokalise-mcp/issues">Reportar un Problema</a> •
  <a href="https://lokalise.com">Aprende sobre Lokalise</a>
</div>
