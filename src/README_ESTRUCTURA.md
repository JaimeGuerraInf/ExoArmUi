# 📁 Estructura del Proyecto - Exobrazo Rehab

Este documento describe la estructura organizada y limpia del código fuente de la aplicación Exobrazo Rehab.

## 🗂️ Estructura Principal

```
src/
├── components/          # 🔧 Componentes React
├── styles/             # 🎨 Archivos CSS organizados
├── hooks/              # 🪝 Custom hooks de React
├── data/               # 📊 Datos y configuraciones
├── layouts/            # 🏗️ Layouts principales
├── App.js              # 🚀 Componente raíz
├── index.js            # 📍 Punto de entrada
└── index.css           # 🌐 Estilos globales base
```

## 📦 Detalles de Carpetas

### 🔧 `/components/`
Contiene todos los componentes React organizados funcionalmente:

- **Pantallas principales**: `WelcomeScreen.js`, `DashboardHome.js`
- **Ejercicios**: `EjerciciosMusicales.js`, `Progress.js`
- **Navegación**: `SideMenu.js`, `Navbar.js`
- **Funcionales**: `BackgroundLayout.js`, `AnimatedBackground.js`
- **Subcarpetas**:
  - `exercises/`: Componentes específicos de ejercicios (`TrackingExercise.js`)
  - `common/`: Componentes reutilizables

### 🎨 `/styles/`
Todos los archivos CSS organizados por categoría:

```
styles/
├── components/         # CSS específico de componentes
│   ├── WelcomeScreen.css
│   ├── EjerciciosMusicales.css
│   ├── SideMenu.css
│   ├── DashboardHome.css
│   ├── Progress.css
│   ├── TrackingExercise.css
│   ├── Background.css
│   └── DisposicionFondo.css
├── layouts/           # CSS de layouts
│   ├── DashboardLayout.css
│   └── DisposicionPanel.css
└── global/            # CSS globales y utilidades
    ├── App.css
    └── custom.css
```

### 🪝 `/hooks/`
Custom hooks para lógica reutilizable:
- `useRosAngle.js`: Conexión con ROS y manejo de ángulos

### 📊 `/data/`
Datos y configuraciones:
- `exercises.js`: Definición de ejercicios musicales

### 🏗️ `/layouts/`
Layouts principales de la aplicación:
- `DashboardLayout.js`: Layout del dashboard con menú lateral

## 🎯 Convenciones de Importación

### Importaciones CSS
Todas las importaciones CSS siguen estas rutas:

```javascript
// Para componentes en /components/
import "../styles/components/ComponentName.css";

// Para layouts en /layouts/
import "../styles/layouts/LayoutName.css";

// Para estilos globales
import "./styles/global/global.css";  // desde App.js
import "../styles/global/global.css"; // desde otros lugares
```

### Importaciones de Componentes
```javascript
// Hooks
import useRosAngle from "../hooks/useRosAngle";

// Datos
import exercises from "../data/exercises";

// Componentes
import ComponentName from "./ComponentName";
import ComponentName from "../components/ComponentName";
```

## 🧹 Limpieza Realizada

### ❌ Archivos/Carpetas Eliminados:
- `src/componentes/` (duplicado en español)
- `src/estilos/` (duplicado en español)
- `src/context/` (vacío)
- `src/config/` (vacío)
- `src/scripts/` (vacío)
- `src/zipcomponentes.zip` (archivo innecesario)
- CSS dispersos movidos a `/styles/`

### ✅ Mejoras Implementadas:
- **Organización**: Todos los CSS en una estructura lógica
- **Consistencia**: Importaciones uniformes
- **Mantenibilidad**: Fácil localización de archivos
- **Escalabilidad**: Estructura preparada para crecimiento

## 🚀 Beneficios

1. **🔍 Fácil navegación**: Estructura intuitiva y predecible
2. **🛠️ Mantenimiento**: Localización rápida de archivos
3. **🔄 Reutilización**: Componentes y estilos bien organizados  
4. **📈 Escalabilidad**: Preparado para nuevas funcionalidades
5. **👥 Colaboración**: Estructura estándar para el equipo

---

*Estructura organizada el 23/06/2025 - Exobrazo Rehab v1.0* 