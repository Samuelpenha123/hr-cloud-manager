# HR Cloud Manager 🚀
## Sistema SaaS de Gestión de Recursos Humanos para PYMES

---

## 📋 Requisitos del Sistema

- PHP 8.1+
- Composer
- MySQL 5.7+ / MariaDB 10.3+
- Node.js (opcional, para servidor frontend)

---

## ⚙️ Instalación del Backend (Laravel)

```bash
# 1. Entrar al directorio backend
cd backend

# 2. Instalar dependencias PHP
composer install

# 3. Copiar y configurar .env
cp .env.example .env
# Editar .env con tus datos de base de datos

# 4. Generar clave de aplicación
php artisan key:generate

# 5. Generar clave JWT
php artisan jwt:secret

# 6. Crear base de datos en MySQL
mysql -u root -p -e "CREATE DATABASE hr_cloud_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 7. Ejecutar migraciones
php artisan migrate

# 8. (Opcional) Importar datos demo
mysql -u root -p hr_cloud_manager < ../database/hr_cloud_manager.sql

# 9. Iniciar servidor de desarrollo
php artisan serve
# El servidor quedará en: http://localhost:8000
```

---

## 🌐 Instalación del Frontend

El frontend es HTML/CSS/JS puro. Solo necesitas servir los archivos estáticamente.

```bash
# Opción 1: Python (simple)
cd frontend
python3 -m http.server 3000
# Abrir: http://localhost:3000

# Opción 2: Node.js npx serve
cd frontend
npx serve -p 3000

# Opción 3: Abrir directamente en el navegador
# Doble clic en frontend/index.html
```

> **Importante:** Edita `frontend/js/api.js` y cambia `API_BASE` a la URL de tu backend.

---

## 🔑 Credenciales Demo

```
Email:    admin@hrcloud.com
Password: password
Empresa:  Empresa Demo S.A.
```

---

## 🗄️ Base de Datos

**Opción A — Script SQL directo:**
```bash
mysql -u root -p hr_cloud_manager < database/hr_cloud_manager.sql
```

**Opción B — Migraciones Laravel:**
```bash
cd backend
php artisan migrate --seed
```

---

## 📡 Endpoints de la API

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registro de empresa |
| POST | /api/auth/login | Inicio de sesión |
| POST | /api/auth/logout | Cerrar sesión |
| GET  | /api/auth/me | Usuario actual |

### Empleados (CRUD completo)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/employees | Listar (con filtros y paginación) |
| POST | /api/employees | Crear empleado |
| GET | /api/employees/{id} | Ver detalle |
| PUT | /api/employees/{id} | Actualizar |
| DELETE | /api/employees/{id} | Eliminar (soft delete) |
| GET | /api/employees/stats | Estadísticas |

### Asistencia
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/attendances | Listar registros |
| POST | /api/attendances | Registrar asistencia |
| PUT | /api/attendances/{id} | Actualizar registro |
| DELETE | /api/attendances/{id} | Eliminar registro |
| GET | /api/attendances/report | Reporte mensual |

### Vacaciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/vacations | Listar solicitudes |
| POST | /api/vacations | Crear solicitud |
| PUT | /api/vacations/{id}/approve | Aprobar |
| PUT | /api/vacations/{id}/reject | Rechazar |
| DELETE | /api/vacations/{id} | Eliminar (solo pendientes) |

### Documentos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/documents | Listar documentos |
| POST | /api/documents | Subir documento (multipart) |
| PUT | /api/documents/{id} | Actualizar metadatos |
| DELETE | /api/documents/{id} | Eliminar + archivo |

### Otros
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/dashboard | Stats del dashboard |
| GET | /api/notifications | Notificaciones |
| PUT | /api/notifications/read-all | Marcar todas leídas |

---

## 🏗️ Arquitectura

```
hr-cloud-manager/
├── backend/           # Laravel 10 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # 7 controladores
│   │   │   └── Middleware/     # JWT + CORS
│   │   └── Models/             # 6 modelos Eloquent
│   ├── database/
│   │   └── migrations/         # 6 migraciones
│   └── routes/
│       └── api.php             # Todas las rutas
├── frontend/          # HTML + CSS + JS puro
│   ├── index.html             # Landing Page
│   ├── login.html             # Autenticación
│   ├── register.html          # Registro
│   ├── dashboard.html         # App principal (SPA-like)
│   ├── css/
│   │   ├── landing.css
│   │   └── app.css
│   └── js/
│       ├── api.js             # Cliente HTTP + Toast
│       ├── auth.js            # Gestión de sesión JWT
│       └── pages.js           # Todos los módulos de página
├── database/
│   └── hr_cloud_manager.sql   # Script SQL completo
└── docs/
    └── diagrama-er.html       # Diagrama ER interactivo
```

---

## 🔒 Seguridad SaaS (Multitenancy)

Cada empresa registrada (user) tiene sus datos completamente aislados:
- Todos los empleados tienen `user_id` como FK al usuario propietario
- El scope `forUser(Auth::id())` garantiza que cada empresa solo acceda a sus datos
- Autenticación basada en JWT con expiración configurable

---

## 📊 Módulos Implementados

| Módulo | CRUD | Estado |
|--------|------|--------|
| Autenticación (registro/login/logout) | ✅ | Completo |
| Gestión de Empleados | ✅ CRUD | Completo |
| Control de Asistencia | ✅ CRUD + Reportes | Completo |
| Gestión de Vacaciones | ✅ CRUD + Aprobar/Rechazar | Completo |
| Gestión Documental | ✅ CRUD + Upload | Completo |
| Dashboard con métricas | ✅ | Completo |
| Notificaciones | ✅ | Completo |
| Reportes de asistencia | ✅ | Completo |

**Cumplimiento: 100% de los requerimientos planteados ✅**
