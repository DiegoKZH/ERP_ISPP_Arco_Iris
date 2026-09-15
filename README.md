# ERP Instituto - Sistema de Gestión Integral

Este proyecto es una aplicación web para la gestión integral del Instituto, estructurada como una arquitectura **Monorepo / Híbrida**:
- **Backend**: API REST con Laravel 11/13 (`/backend`)
- **Frontend**: Single Page Application (SPA) con React 19, Vite 8 y Tailwind CSS v4 (`/frontend`)

---

## 🚀 Requisitos previos

- **PHP**: ^8.3
- **Composer**: ^2.x
- **Node.js**: ^20.x o superior
- **npm**: ^10.x

---

## 🛠️ Instalación y Configuración Inicial

1. Clonar el repositorio.
2. Instalar dependencias del proyecto:
   ```bash
   composer run setup
   ```
   *Este comando instalará las dependencias PHP, creará el archivo `.env` si no existe, generará la clave de la aplicación, ejecutará las migraciones e instalará/compilará los assets del frontend.*

---

## 💻 Desarrollo Local

Para iniciar todos los servidores en simultáneo (Laravel API y Vite Frontend):

```bash
npm run dev
# o usando composer:
composer run dev
```

---

## 🧪 Pruebas

Para ejecutar el suite de pruebas:

```bash
composer test
```

