# 🔧 Low Code Platform - Documentación Completa

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Formularios Dinámicos](#formularios-dinámicos)
4. [Workflows](#workflows)
5. [Endpoints Dinámicos](#endpoints-dinámicos)
6. [API Reference](#api-reference)
7. [Guías de Uso](#guías-de-uso)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [Integración Frontend](#integración-frontend)
10. [Mejores Prácticas](#mejores-prácticas)
11. [Troubleshooting](#troubleshooting)
12. [Limitaciones y Próximas Mejoras](#limitaciones-y-próximas-mejoras)

---

## Introducción

### ¿Qué es Low Code?

El sistema Low Code de EcoSave Market es una plataforma que permite crear formularios, workflows y endpoints dinámicos **sin escribir código**, mediante una interfaz de administración y APIs REST. Está diseñado para que usuarios no técnicos puedan extender la funcionalidad de la aplicación sin necesidad de modificar el código fuente.

### Características Principales

- ✅ **Formularios Dinámicos**: Crea formularios con validación, múltiples tipos de campos y acciones personalizadas
- ✅ **Workflows**: Construye flujos de trabajo complejos con nodos configurables
- ✅ **Endpoints Dinámicos**: Crea APIs REST sin escribir código
- ✅ **Integración Completa**: Se integra perfectamente con las funcionalidades existentes
- ✅ **Modular**: No afecta el código existente, es completamente independiente

### Casos de Uso

- Crear formularios de contacto, registro, encuestas
- Automatizar procesos de negocio con workflows
- Exponer APIs personalizadas para integraciones
- Extender funcionalidades sin modificar código
- Permitir a usuarios no técnicos crear soluciones

---

## Arquitectura del Sistema

### Estructura de Archivos

```
backend-app/
├── app/
│   ├── services/
│   │   └── lowcode/
│   │       ├── form_builder_service.ts      # Gestión de formularios
│   │       ├── workflow_service.ts          # Gestión de workflows
│   │       └── dynamic_endpoint_service.ts  # Gestión de endpoints
│   └── controllers/
│       └── http/
│           └── lowcode_controller.ts        # API REST para Low Code
│
frontend-app/
├── src/
│   ├── pages/
│   │   └── LowCode.tsx                      # Panel de administración
│   └── components/
│       ├── DynamicForm.tsx                  # Renderizador de formularios
│       └── DynamicForm.css                  # Estilos del formulario
```

### Flujo de Datos

```
Cliente (Frontend/API)
    ↓
LowCodeController (API REST)
    ↓
Servicios (FormBuilder/Workflow/DynamicEndpoint)
    ↓
Almacenamiento en Memoria (Map)
    ↓
Respuesta JSON
```

### Persistencia

**Estado Actual**: Los datos se almacenan en memoria usando `Map<string, T>`. Esto significa que:
- ⚠️ Los datos se pierden al reiniciar el servidor
- ✅ Ideal para desarrollo y pruebas
- ⚠️ No recomendado para producción sin migración a base de datos

---

## Formularios Dinámicos

### Conceptos Básicos

Un formulario dinámico es una configuración JSON que define:
- Campos con tipos, validaciones y opciones
- Acciones al enviar (API, workflow, custom)
- Layout y organización visual

### Tipos de Campos Soportados

| Tipo | Descripción | Validaciones Disponibles |
|------|-------------|-------------------------|
| `text` | Campo de texto simple | required, pattern, min/max length |
| `email` | Campo de email | required, formato email automático |
| `number` | Campo numérico | required, min, max |
| `date` | Selector de fecha | required |
| `select` | Lista desplegable | required, opciones predefinidas |
| `textarea` | Área de texto multilínea | required, min/max length |
| `checkbox` | Casilla de verificación | required |
| `radio` | Botones de opción | required, opciones predefinidas |

### Estructura de FormField

```typescript
interface FormField {
  id: string                    // ID único del campo (generado automáticamente)
  name: string                  // Nombre del campo (usado como key en el formulario)
  label: string                 // Etiqueta visible para el usuario
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio'
  required?: boolean            // Si el campo es obligatorio
  placeholder?: string          // Texto de ayuda en el campo
  defaultValue?: any            // Valor por defecto
  options?: Array<{             // Opciones para select/radio
    label: string
    value: string
  }>
  validation?: {
    min?: number                // Valor mínimo (para number)
    max?: number                // Valor máximo (para number)
    pattern?: string            // Expresión regular para validación
    customMessage?: string      // Mensaje de error personalizado
  }
  conditional?: {               // Mostrar campo condicionalmente
    field: string               // Campo del que depende
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
    value: any                  // Valor de comparación
  }
}
```

### Estructura de FormConfig

```typescript
interface FormConfig {
  id: string                    // ID único del formulario (generado automáticamente)
  name: string                  // Nombre del formulario
  description?: string          // Descripción opcional
  fields: FormField[]           // Array de campos
  submitAction?: {              // Acción al enviar
    type: 'api' | 'workflow' | 'custom'
    endpoint?: string           // URL del endpoint (si type: 'api')
    method?: 'POST' | 'PUT' | 'PATCH'  // Método HTTP (si type: 'api')
    workflowId?: string         // ID del workflow (si type: 'workflow')
  }
  layout?: {                    // Configuración de layout
    columns?: number            // Número de columnas
    sections?: Array<{          // Secciones del formulario
      title: string
      fields: string[]          // IDs de campos en esta sección
    }>
  }
  createdAt?: Date
  updatedAt?: Date
}
```

### Validaciones Automáticas

El sistema realiza validaciones automáticas:

1. **Campos Requeridos**: Verifica que los campos marcados como `required` tengan valor
2. **Tipo Email**: Valida formato de email con regex estándar
3. **Tipo Number**: Verifica que sea un número válido y respeta min/max
4. **Pattern**: Valida contra expresión regular personalizada
5. **Mensajes de Error**: Retorna mensajes descriptivos por cada error

---

## Workflows

### Conceptos Básicos

Un workflow es un flujo de trabajo compuesto por nodos conectados que se ejecutan secuencialmente. Cada nodo realiza una acción específica y puede pasar datos al siguiente nodo.

### Tipos de Nodos

| Tipo | Descripción | Conexiones |
|------|-------------|------------|
| `start` | Nodo inicial del workflow | `next` |
| `end` | Nodo final del workflow | - |
| `action` | Ejecuta una acción personalizada | `next` |
| `condition` | Evalúa una condición | `onTrue`, `onFalse` |
| `api_call` | Hace una llamada HTTP | `next` |
| `email` | Envía un email | `next` |
| `notification` | Envía una notificación | `next` |
| `delay` | Espera un tiempo determinado | `next` |
| `transform` | Transforma los datos del contexto | `next` |

### Estructura de WorkflowNode

```typescript
interface WorkflowNode {
  id: string                    // ID único del nodo
  type: WorkflowNodeType        // Tipo de nodo
  label: string                 // Etiqueta descriptiva
  position: { x: number; y: number }  // Posición en el editor visual
  config?: Record<string, any>  // Configuración específica del nodo
  connections?: {
    next?: string               // ID del siguiente nodo
    onTrue?: string             // ID del nodo si condición es verdadera
    onFalse?: string            // ID del nodo si condición es falsa
  }
}
```

### Estructura de WorkflowConfig

```typescript
interface WorkflowConfig {
  id: string                    // ID único del workflow
  name: string                  // Nombre del workflow
  description?: string          // Descripción
  nodes: WorkflowNode[]         // Array de nodos
  variables?: Record<string, any>  // Variables globales del workflow
  triggers?: {                  // Configuración de triggers
    type: 'manual' | 'api' | 'schedule' | 'event'
    config?: Record<string, any>
  }
  createdAt?: Date
  updatedAt?: Date
}
```

### Contexto de Ejecución

Durante la ejecución, todos los nodos comparten un objeto `context` que contiene:
- Variables globales del workflow
- Datos de entrada (`inputData`)
- Resultados de nodos anteriores
- Datos transformados

### Operadores de Condición

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `equals` | Igual a | `status === "pending"` |
| `notEquals` | Diferente de | `status !== "completed"` |
| `greaterThan` | Mayor que | `amount > 100` |
| `lessThan` | Menor que | `amount < 50` |
| `contains` | Contiene (strings) | `message.includes("error")` |

---

## Endpoints Dinámicos

### Conceptos Básicos

Un endpoint dinámico es una ruta HTTP que se crea y registra automáticamente en el router de AdonisJS. Puede ejecutar workflows, procesar formularios o realizar acciones personalizadas.

### Métodos HTTP Soportados

- `GET`: Obtener datos
- `POST`: Crear o procesar datos
- `PUT`: Actualizar datos completos
- `PATCH`: Actualizar datos parciales
- `DELETE`: Eliminar datos

### Tipos de Handlers

| Tipo | Descripción | Configuración |
|------|-------------|---------------|
| `workflow` | Ejecuta un workflow | `workflowId` |
| `form` | Procesa un formulario | `formId` |
| `custom` | Handler personalizado | - |
| `database` | Query a base de datos | `query`, `table` (no implementado) |

### Estructura de EndpointConfig

```typescript
interface EndpointConfig {
  id: string                    // ID único del endpoint
  name: string                  // Nombre descriptivo
  path: string                  // Ruta relativa (ej: "/contact")
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  description?: string
  handler: {
    type: 'workflow' | 'form' | 'custom' | 'database'
    workflowId?: string         // Si type: 'workflow'
    formId?: string             // Si type: 'form'
    query?: string              // Si type: 'database'
    table?: string              // Si type: 'database'
  }
  authentication?: {
    required: boolean           // Si requiere autenticación
    roles?: string[]            // Roles permitidos
  }
  validation?: {
    body?: Record<string, any>  // Validación del body
    query?: Record<string, any> // Validación de query params
    params?: Record<string, any> // Validación de path params
  }
  response?: {
    transform?: Record<string, any>  // Transformación de respuesta
    statusCode?: number              // Código de estado HTTP
  }
  createdAt?: Date
  updatedAt?: Date
}
```

### Rutas Generadas

Los endpoints se registran bajo el prefijo `/api/v1/lowcode`. Por ejemplo:
- Si creas un endpoint con `path: "/contact"` y `method: "POST"`
- La ruta final será: `POST /api/v1/lowcode/contact`

---

## API Reference

### Base URL

```
http://localhost:3333/api/v1/lowcode
```

### Formularios

#### Listar Formularios

```http
GET /api/v1/lowcode/forms
```

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "form_1234567890_abc123",
      "name": "Formulario de Contacto",
      "description": "Formulario para contacto de clientes",
      "fields": [...],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Obtener Formulario por ID

```http
GET /api/v1/lowcode/forms/:id
```

**Parámetros**:
- `id` (path): ID del formulario

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "form_1234567890_abc123",
    "name": "Formulario de Contacto",
    "fields": [...]
  }
}
```

**Respuesta Error (404 Not Found)**:
```json
{
  "success": false,
  "message": "Formulario no encontrado"
}
```

#### Crear Formulario

```http
POST /api/v1/lowcode/forms
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Formulario de Contacto",
  "description": "Formulario para contacto de clientes",
  "fields": [
    {
      "name": "nombre",
      "label": "Nombre Completo",
      "type": "text",
      "required": true,
      "placeholder": "Ingresa tu nombre"
    },
    {
      "name": "email",
      "label": "Email",
      "type": "email",
      "required": true
    },
    {
      "name": "mensaje",
      "label": "Mensaje",
      "type": "textarea",
      "required": true
    },
    {
      "name": "categoria",
      "label": "Categoría",
      "type": "select",
      "required": true,
      "options": [
        { "label": "Soporte", "value": "support" },
        { "label": "Ventas", "value": "sales" },
        { "label": "General", "value": "general" }
      ]
    }
  ],
  "submitAction": {
    "type": "api",
    "endpoint": "/api/v1/contact",
    "method": "POST"
  }
}
```

**Respuesta Exitosa (201 Created)**:
```json
{
  "success": true,
  "message": "Formulario creado correctamente",
  "data": {
    "id": "form_1234567890_abc123",
    "name": "Formulario de Contacto",
    ...
  }
}
```

#### Actualizar Formulario

```http
PUT /api/v1/lowcode/forms/:id
Content-Type: application/json
```

**Body**: Mismo formato que crear, pero solo incluye los campos a actualizar.

#### Eliminar Formulario

```http
DELETE /api/v1/lowcode/forms/:id
```

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Formulario eliminado correctamente"
}
```

#### Enviar Formulario

```http
POST /api/v1/lowcode/forms/:id/submit
Content-Type: application/json
```

**Body**:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "mensaje": "Hola, necesito ayuda",
  "categoria": "support"
}
```

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Formulario enviado correctamente",
  "data": {
    "formId": "form_1234567890_abc123",
    "submittedData": {...}
  }
}
```

**Respuesta Error de Validación (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": {
    "email": ["Email debe ser un email válido"],
    "nombre": ["Nombre Completo es requerido"]
  }
}
```

### Workflows

#### Listar Workflows

```http
GET /api/v1/lowcode/workflows
```

#### Obtener Workflow por ID

```http
GET /api/v1/lowcode/workflows/:id
```

#### Crear Workflow

```http
POST /api/v1/lowcode/workflows
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Procesar Orden",
  "description": "Workflow para procesar órdenes automáticamente",
  "nodes": [
    {
      "id": "start_1",
      "type": "start",
      "label": "Inicio",
      "position": { "x": 100, "y": 100 },
      "connections": { "next": "validate_1" }
    },
    {
      "id": "validate_1",
      "type": "condition",
      "label": "Validar Orden",
      "position": { "x": 300, "y": 100 },
      "config": {
        "condition": {
          "field": "status",
          "operator": "equals",
          "value": "pending"
        }
      },
      "connections": {
        "onTrue": "process_1",
        "onFalse": "end_1"
      }
    },
    {
      "id": "process_1",
      "type": "action",
      "label": "Procesar",
      "position": { "x": 500, "y": 100 },
      "config": {
        "action": {
          "type": "update_status",
          "newStatus": "processing"
        }
      },
      "connections": { "next": "end_1" }
    },
    {
      "id": "end_1",
      "type": "end",
      "label": "Fin",
      "position": { "x": 700, "y": 100 }
    }
  ],
  "variables": {
    "defaultStatus": "pending"
  }
}
```

#### Actualizar Workflow

```http
PUT /api/v1/lowcode/workflows/:id
Content-Type: application/json
```

#### Eliminar Workflow

```http
DELETE /api/v1/lowcode/workflows/:id
```

#### Ejecutar Workflow

```http
POST /api/v1/lowcode/workflows/:id/execute
Content-Type: application/json
```

**Body**:
```json
{
  "orderId": "123",
  "status": "pending",
  "amount": 150.50
}
```

**Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "executionId": "exec_1234567890_xyz789",
  "result": {
    "orderId": "123",
    "status": "processing",
    "processedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Respuesta Error (500 Internal Server Error)**:
```json
{
  "success": false,
  "executionId": "exec_1234567890_xyz789",
  "error": "Workflow no tiene nodo de inicio"
}
```

### Endpoints Dinámicos

#### Listar Endpoints

```http
GET /api/v1/lowcode/endpoints
```

#### Obtener Endpoint por ID

```http
GET /api/v1/lowcode/endpoints/:id
```

#### Crear Endpoint

```http
POST /api/v1/lowcode/endpoints
Content-Type: application/json
```

**Body**:
```json
{
  "name": "API de Contacto",
  "path": "/contact",
  "method": "POST",
  "description": "Endpoint para recibir contactos",
  "handler": {
    "type": "workflow",
    "workflowId": "workflow_1234567890_abc123"
  },
  "authentication": {
    "required": false
  },
  "validation": {
    "body": {
      "email": { "required": true },
      "message": { "required": true }
    }
  },
  "response": {
    "statusCode": 201,
    "transform": {
      "success": "true",
      "contactId": "data.id"
    }
  }
}
```

**Nota**: Una vez creado, el endpoint estará disponible en:
```
POST /api/v1/lowcode/contact
```

#### Actualizar Endpoint

```http
PUT /api/v1/lowcode/endpoints/:id
Content-Type: application/json
```

**Nota**: Al actualizar, la ruta antigua se desregistra y se registra la nueva.

#### Eliminar Endpoint

```http
DELETE /api/v1/lowcode/endpoints/:id
```

**Nota**: Al eliminar, la ruta se desregistra del router.

---

## Guías de Uso

### Crear un Formulario Completo

#### Paso 1: Diseñar el Formulario

Define qué campos necesitas y sus características:

```json
{
  "name": "Registro de Producto",
  "description": "Formulario para registrar nuevos productos",
  "fields": [
    {
      "name": "nombre",
      "label": "Nombre del Producto",
      "type": "text",
      "required": true,
      "placeholder": "Ej: Pan Integral"
    },
    {
      "name": "categoria",
      "label": "Categoría",
      "type": "select",
      "required": true,
      "options": [
        { "label": "Panadería", "value": "panaderia" },
        { "label": "Lácteos", "value": "lacteos" },
        { "label": "Frutas", "value": "frutas" },
        { "label": "Verduras", "value": "verduras" }
      ]
    },
    {
      "name": "cantidad",
      "label": "Cantidad",
      "type": "number",
      "required": true,
      "validation": {
        "min": 1,
        "max": 1000
      }
    },
    {
      "name": "vencimiento",
      "label": "Fecha de Vencimiento",
      "type": "date",
      "required": true
    },
    {
      "name": "descripcion",
      "label": "Descripción",
      "type": "textarea",
      "required": false,
      "placeholder": "Información adicional sobre el producto"
    }
  ],
  "submitAction": {
    "type": "api",
    "endpoint": "/api/v1/products",
    "method": "POST"
  }
}
```

#### Paso 2: Crear el Formulario

```bash
curl -X POST http://localhost:3333/api/v1/lowcode/forms \
  -H "Content-Type: application/json" \
  -d @formulario-producto.json
```

#### Paso 3: Obtener el ID del Formulario

Guarda el `id` que retorna la respuesta.

#### Paso 4: Usar el Formulario en el Frontend

```tsx
import DynamicForm from './components/DynamicForm';

function ProductosPage() {
  return (
    <DynamicForm 
      formId="form_1234567890_abc123"
      onSubmit={(data) => {
        console.log('Producto registrado:', data);
        // Redirigir o mostrar mensaje de éxito
      }}
    />
  );
}
```

### Crear un Workflow Simple

#### Ejemplo: Workflow de Aprobación

```json
{
  "name": "Aprobar Orden",
  "description": "Workflow para aprobar órdenes automáticamente",
  "nodes": [
    {
      "id": "start_1",
      "type": "start",
      "label": "Inicio",
      "position": { "x": 100, "y": 100 },
      "connections": { "next": "check_amount" }
    },
    {
      "id": "check_amount",
      "type": "condition",
      "label": "Verificar Monto",
      "position": { "x": 300, "y": 100 },
      "config": {
        "condition": {
          "field": "amount",
          "operator": "lessThan",
          "value": 1000
        }
      },
      "connections": {
        "onTrue": "auto_approve",
        "onFalse": "manual_review"
      }
    },
    {
      "id": "auto_approve",
      "type": "action",
      "label": "Aprobar Automáticamente",
      "position": { "x": 500, "y": 50 },
      "config": {
        "action": {
          "type": "update_status",
          "status": "approved"
        }
      },
      "connections": { "next": "end_1" }
    },
    {
      "id": "manual_review",
      "type": "action",
      "label": "Revisión Manual",
      "position": { "x": 500, "y": 150 },
      "config": {
        "action": {
          "type": "notify_admin"
        }
      },
      "connections": { "next": "end_1" }
    },
    {
      "id": "end_1",
      "type": "end",
      "label": "Fin",
      "position": { "x": 700, "y": 100 }
    }
  ]
}
```

### Crear un Endpoint que Ejecuta un Workflow

```json
{
  "name": "API de Aprobación",
  "path": "/approve-order",
  "method": "POST",
  "description": "Endpoint para aprobar órdenes",
  "handler": {
    "type": "workflow",
    "workflowId": "workflow_1234567890_abc123"
  },
  "authentication": {
    "required": true,
    "roles": ["admin", "manager"]
  },
  "validation": {
    "body": {
      "orderId": { "required": true },
      "amount": { "required": true }
    }
  }
}
```

Una vez creado, puedes llamarlo:

```bash
curl -X POST http://localhost:3333/api/v1/lowcode/approve-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "123",
    "amount": 500
  }'
```

---

## Ejemplos Prácticos

### Ejemplo 1: Formulario de Contacto con Validación

```json
{
  "name": "Formulario de Contacto",
  "fields": [
    {
      "name": "nombre",
      "label": "Nombre",
      "type": "text",
      "required": true,
      "validation": {
        "pattern": "^[a-zA-Z\\s]{2,50}$",
        "customMessage": "El nombre debe tener entre 2 y 50 caracteres y solo letras"
      }
    },
    {
      "name": "email",
      "label": "Email",
      "type": "email",
      "required": true
    },
    {
      "name": "telefono",
      "label": "Teléfono",
      "type": "text",
      "required": false,
      "validation": {
        "pattern": "^[0-9]{10}$",
        "customMessage": "El teléfono debe tener 10 dígitos"
      }
    },
    {
      "name": "mensaje",
      "label": "Mensaje",
      "type": "textarea",
      "required": true,
      "placeholder": "Escribe tu mensaje aquí..."
    }
  ],
  "submitAction": {
    "type": "workflow",
    "workflowId": "workflow_contacto_123"
  }
}
```

### Ejemplo 2: Workflow de Notificación por Email

```json
{
  "name": "Notificar Cliente",
  "nodes": [
    {
      "id": "start_1",
      "type": "start",
      "label": "Inicio",
      "position": { "x": 100, "y": 100 },
      "connections": { "next": "send_email" }
    },
    {
      "id": "send_email",
      "type": "email",
      "label": "Enviar Email",
      "position": { "x": 300, "y": 100 },
      "config": {
        "to": "{{email}}",
        "subject": "Confirmación de Orden",
        "template": "order_confirmation"
      },
      "connections": { "next": "end_1" }
    },
    {
      "id": "end_1",
      "type": "end",
      "label": "Fin",
      "position": { "x": 500, "y": 100 }
    }
  ]
}
```

### Ejemplo 3: Endpoint con Transformación de Respuesta

```json
{
  "name": "API de Productos Simplificada",
  "path": "/products-simple",
  "method": "GET",
  "handler": {
    "type": "custom"
  },
  "response": {
    "statusCode": 200,
    "transform": {
      "products": "data.items",
      "total": "data.count",
      "page": "data.page"
    }
  }
}
```

---

## Integración Frontend

### Componente DynamicForm

El componente `DynamicForm` renderiza automáticamente cualquier formulario creado con Low Code.

#### Props

```typescript
interface DynamicFormProps {
  formId: string                                    // ID del formulario
  onSubmit?: (data: Record<string, any>) => void    // Callback al enviar
}
```

#### Uso Básico

```tsx
import DynamicForm from './components/DynamicForm';

function ContactPage() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Datos del formulario:', data);
    // Aquí puedes hacer algo con los datos
    // Por ejemplo, mostrar un mensaje de éxito
    alert('¡Formulario enviado correctamente!');
  };

  return (
    <div>
      <h1>Contáctanos</h1>
      <DynamicForm 
        formId="form_1234567890_abc123"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

#### Manejo de Errores

El componente maneja automáticamente:
- Errores de validación (muestra mensajes por campo)
- Errores de red (muestra mensaje genérico)
- Estados de carga (muestra "Enviando...")

### Panel de Administración

Accede al panel en `/lowcode` para:
- Ver todos los formularios, workflows y endpoints
- Crear nuevos elementos (actualmente requiere usar la API)
- Eliminar elementos existentes
- Ver detalles de cada elemento

---

## Mejores Prácticas

### Formularios

1. **Nombres de Campos**: Usa nombres descriptivos y en minúsculas con guiones bajos
   - ✅ `nombre_completo`, `fecha_nacimiento`
   - ❌ `n`, `fechaNac`, `Fecha_Nacimiento`

2. **Validaciones**: Siempre valida campos críticos
   - Usa `required: true` para campos obligatorios
   - Agrega validaciones de formato para emails, teléfonos, etc.

3. **Opciones de Select**: Mantén las opciones consistentes
   - Usa valores en minúsculas
   - Etiquetas descriptivas y claras

4. **Acciones de Submit**: Define claramente qué debe pasar al enviar
   - Usa workflows para lógica compleja
   - Usa APIs directas para casos simples

### Workflows

1. **Nombres de Nodos**: Usa nombres descriptivos
   - ✅ `validate_order`, `send_notification`
   - ❌ `node1`, `action_2`

2. **Condiciones**: Mantén las condiciones simples
   - Evita condiciones anidadas complejas
   - Usa múltiples nodos de condición si es necesario

3. **Contexto**: Documenta qué variables espera el workflow
   - Usa `variables` para valores por defecto
   - Documenta en `description` qué datos de entrada necesita

4. **Manejo de Errores**: Siempre considera qué pasa si un nodo falla
   - Agrega nodos de manejo de errores
   - Usa condiciones para validar datos antes de procesarlos

### Endpoints

1. **Rutas**: Usa rutas RESTful y descriptivas
   - ✅ `/contact`, `/products`, `/orders/:id/approve`
   - ❌ `/api1`, `/endpoint123`, `/do-something`

2. **Validación**: Valida siempre los datos de entrada
   - Define `validation.body` para POST/PUT/PATCH
   - Define `validation.query` para GET con parámetros

3. **Autenticación**: Protege endpoints sensibles
   - Usa `authentication.required: true` para endpoints privados
   - Especifica roles cuando sea necesario

4. **Respuestas**: Usa códigos de estado HTTP apropiados
   - 200 para éxito
   - 201 para creación
   - 400 para errores de validación
   - 401 para no autenticado
   - 404 para no encontrado
   - 500 para errores del servidor

---

## Troubleshooting

### Problemas Comunes

#### El formulario no se renderiza

**Síntomas**: El componente `DynamicForm` muestra "Formulario no encontrado"

**Soluciones**:
1. Verifica que el `formId` sea correcto
2. Verifica que el formulario exista: `GET /api/v1/lowcode/forms/:id`
3. Verifica que el backend esté corriendo
4. Verifica la URL de la API en `DynamicForm.tsx` (debe ser `http://localhost:3333/api/v1/lowcode`)

#### Las validaciones no funcionan

**Síntomas**: El formulario se envía aunque falten campos requeridos

**Soluciones**:
1. Verifica que los campos tengan `required: true`
2. Verifica que el tipo de campo sea correcto
3. Revisa la consola del navegador para errores
4. Verifica que el endpoint de submit esté funcionando

#### El workflow no se ejecuta

**Síntomas**: La ejecución del workflow falla o no retorna resultados

**Soluciones**:
1. Verifica que el workflow tenga un nodo `start`
2. Verifica que los nodos estén correctamente conectados
3. Verifica que las condiciones tengan `onTrue` y `onFalse` definidos
4. Revisa los logs del servidor para errores

#### El endpoint dinámico no se registra

**Síntomas**: Al crear un endpoint, la ruta no está disponible

**Soluciones**:
1. Verifica que el método HTTP sea válido
2. Verifica que el path no tenga caracteres especiales
3. Verifica que no haya conflictos con rutas existentes
4. Revisa los logs del servidor para mensajes de registro

#### Los datos se pierden al reiniciar

**Síntomas**: Después de reiniciar el servidor, los formularios/workflows/endpoints desaparecen

**Explicación**: Esto es esperado. Los datos se almacenan en memoria.

**Soluciones**:
1. Para desarrollo: Exporta las configuraciones antes de reiniciar
2. Para producción: Implementa persistencia en base de datos (ver sección de mejoras)

---

## Limitaciones y Próximas Mejoras

### Limitaciones Actuales

1. **Persistencia en Memoria**: Los datos se pierden al reiniciar el servidor
2. **Sin Editor Visual**: Los formularios y workflows se crean mediante JSON/API
3. **Validaciones Limitadas**: No todas las validaciones avanzadas están implementadas
4. **Sin Historial**: No hay historial de ejecuciones de workflows
5. **Sin Logs**: No hay sistema de logging para debugging
6. **Handlers Limitados**: Algunos tipos de handlers (database, email) no están completamente implementados

### Próximas Mejoras Planificadas

- [ ] **Editor Visual de Formularios**: Interfaz drag & drop para crear formularios
- [ ] **Editor Visual de Workflows**: Interfaz de nodos conectables para crear workflows
- [ ] **Persistencia en Base de Datos**: Migrar de memoria a Supabase/PostgreSQL
- [ ] **Sistema de Plantillas**: Plantillas predefinidas para casos comunes
- [ ] **Exportar/Importar**: Exportar e importar configuraciones JSON
- [ ] **Historial de Ejecuciones**: Ver historial y logs de ejecuciones de workflows
- [ ] **Sistema de Logging**: Logs detallados para debugging
- [ ] **Handlers Completos**: Implementar handlers de database y email
- [ ] **Autenticación Completa**: Integración con el sistema de autenticación existente
- [ ] **Permisos Granulares**: Control de acceso por usuario/rol
- [ ] **Versionado**: Sistema de versiones para formularios y workflows
- [ ] **Testing**: Herramientas para probar workflows y formularios

### Cómo Contribuir

Si deseas contribuir con mejoras:

1. **Persistencia en Base de Datos**: 
   - Crear tablas en Supabase para `forms`, `workflows`, `endpoints`
   - Modificar los servicios para usar Supabase en lugar de Map

2. **Editor Visual**:
   - Crear componentes React para drag & drop
   - Integrar con la API existente

3. **Handlers**:
   - Implementar `makeApiCall` en `workflow_service.ts`
   - Implementar handler de database en `dynamic_endpoint_service.ts`

---

## Referencia Técnica

### Servicios

#### FormBuilderService

**Ubicación**: `backend-app/app/services/lowcode/form_builder_service.ts`

**Métodos Públicos**:
- `createForm(config)`: Crea un nuevo formulario
- `getForm(id)`: Obtiene un formulario por ID
- `listForms()`: Lista todos los formularios
- `updateForm(id, updates)`: Actualiza un formulario
- `deleteForm(id)`: Elimina un formulario
- `validateFormData(id, data)`: Valida datos contra un formulario
- `processFormSubmission(id, data)`: Procesa el envío de un formulario

#### WorkflowService

**Ubicación**: `backend-app/app/services/lowcode/workflow_service.ts`

**Métodos Públicos**:
- `createWorkflow(config)`: Crea un nuevo workflow
- `getWorkflow(id)`: Obtiene un workflow por ID
- `listWorkflows()`: Lista todos los workflows
- `updateWorkflow(id, updates)`: Actualiza un workflow
- `deleteWorkflow(id)`: Elimina un workflow
- `executeWorkflow(id, inputData)`: Ejecuta un workflow
- `getExecution(executionId)`: Obtiene el estado de una ejecución

#### DynamicEndpointService

**Ubicación**: `backend-app/app/services/lowcode/dynamic_endpoint_service.ts`

**Métodos Públicos**:
- `createEndpoint(config)`: Crea un nuevo endpoint
- `getEndpoint(id)`: Obtiene un endpoint por ID
- `listEndpoints()`: Lista todos los endpoints
- `updateEndpoint(id, updates)`: Actualiza un endpoint
- `deleteEndpoint(id)`: Elimina un endpoint

**Métodos Privados**:
- `registerEndpoint(endpoint)`: Registra un endpoint en el router
- `validateRequest(endpoint, ctx)`: Valida una petición
- `transformResponse(data, transform)`: Transforma una respuesta
- `getNestedValue(obj, path)`: Obtiene un valor anidado

### Controlador

#### LowCodeController

**Ubicación**: `backend-app/app/controllers/http/lowcode_controller.ts`

**Rutas**:
- `GET /api/v1/lowcode/forms` → `listForms()`
- `GET /api/v1/lowcode/forms/:id` → `getForm()`
- `POST /api/v1/lowcode/forms` → `createForm()`
- `PUT /api/v1/lowcode/forms/:id` → `updateForm()`
- `DELETE /api/v1/lowcode/forms/:id` → `deleteForm()`
- `POST /api/v1/lowcode/forms/:id/submit` → `submitForm()`
- `GET /api/v1/lowcode/workflows` → `listWorkflows()`
- `GET /api/v1/lowcode/workflows/:id` → `getWorkflow()`
- `POST /api/v1/lowcode/workflows` → `createWorkflow()`
- `PUT /api/v1/lowcode/workflows/:id` → `updateWorkflow()`
- `DELETE /api/v1/lowcode/workflows/:id` → `deleteWorkflow()`
- `POST /api/v1/lowcode/workflows/:id/execute` → `executeWorkflow()`
- `GET /api/v1/lowcode/endpoints` → `listEndpoints()`
- `GET /api/v1/lowcode/endpoints/:id` → `getEndpoint()`
- `POST /api/v1/lowcode/endpoints` → `createEndpoint()`
- `PUT /api/v1/lowcode/endpoints/:id` → `updateEndpoint()`
- `DELETE /api/v1/lowcode/endpoints/:id` → `deleteEndpoint()`

---

## Conclusión

El sistema Low Code de EcoSave Market proporciona una base sólida para crear formularios, workflows y endpoints dinámicos sin escribir código. Aunque actualmente tiene algunas limitaciones (principalmente la persistencia en memoria), está diseñado para ser extensible y puede evolucionar para satisfacer necesidades más complejas.

Para más información o soporte, consulta la documentación del proyecto o contacta al equipo de desarrollo.

---

**Última actualización**: Enero 2024  
**Versión**: 1.0.0  
**Autor**: Equipo de Desarrollo EcoSave Market
