# 🍱 EcoSave Market - Plataforma Anti-Desperdicio de Alimentos

Plataforma completa para la gestión de productos próximos a vencer, conectando negocios con ONGs y consumidores para reducir el desperdicio de alimentos.

## 📋 Estructura del Proyecto

```
EcoSave-Market-main/
├── backend-app/          # Backend AdonisJS + Supabase
│   ├── app/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middleware/
│   ├── config/
│   └── start/
└── frontend-app/         # Frontend React + TypeScript
    ├── src/
    │   ├── components/   # Componentes reutilizables
    │   ├── context/      # Context API (Auth)
    │   ├── pages/        # Páginas principales
    │   └── App.tsx       # Componente principal
    └── package.json
```

## 🚀 Tecnologías

### Backend
- **AdonisJS 6** - Framework Node.js
- **Supabase** - Base de datos y autenticación
- **TypeScript** - Tipado estático

### Frontend
- **React 19** - Librería UI
- **TypeScript** - Tipado estático
- **React Router** - Navegación
- **Vite** - Build tool
- **CSS Modules** - Estilos con tema cyberpunk

## 🔧 Instalación

### 1. Backend

```bash
cd backend-app
npm install
```

Crea el archivo `.env` con:

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=tu_app_key_generada
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://otvxqjpofaibziffudwx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dnhxanBvZmFpYnppZmZ1ZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjAwNzIsImV4cCI6MjA3ODI5NjA3Mn0.x_GWS6Vhtic1kT8gIskTa2lI-HIVGWiBZekBf-isVrA
```

Genera el APP_KEY:
```bash
node ace generate:key
```

### 2. Frontend

```bash
cd frontend-app
npm install
```

## 🎯 Ejecución

### Backend (Puerto 3333)
```bash
cd backend-app
npm run dev
```

El backend estará disponible en: http://localhost:3333

### Frontend (Puerto 5173)
```bash
cd frontend-app
npm run dev
```

El frontend estará disponible en: http://localhost:5173

## 📱 Características

### 🔐 Autenticación
- Sistema de login/registro con diseño split-screen
- Gestión de sesiones con Context API
- Integración con Supabase

### 📊 Dashboard
- Vista de productos próximos a vencer
- Estadísticas en tiempo real
- Acciones rápidas (Donar/Descuento)
- Filtros por categoría y estado

### 🗺️ Mapa Interactivo
- Visualización de ONGs cercanas
- Puntos de recolección
- Información de contacto
- Rutas a ubicaciones

### 🔔 Notificaciones
- Alertas de vencimiento
- Confirmaciones de donación
- Configuración personalizada
- Panel de estadísticas

## 🎨 Diseño

El proyecto utiliza un tema **cyberpunk futurista** con:
- Paleta de colores neón (cyan, magenta, purple)
- Efectos de glassmorphism
- Animaciones suaves
- Diseño responsive

## 🔗 Endpoints API

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/logout` - Cerrar sesión

### Supabase
- `GET /api/v1/supabase/info` - Información de conexión
- `GET /api/v1/supabase/test` - Test de conexión

### Salud
- `GET /api/v1/health` - Estado del servidor
- `GET /` - Información de la API

## 📝 Notas

- El proyecto está configurado para conectarse a Supabase
- Los datos de productos son de ejemplo (mock data)
- El backend usa AdonisJS 6 con estructura modular
- El frontend está optimizado con Vite y React Compiler

## 🤝 Contribuir

Este proyecto es una conversión del original en Vue.js a React, manteniendo toda la funcionalidad y diseño visual.

## 📄 Licencia

Proyecto educativo - EcoSave Market
