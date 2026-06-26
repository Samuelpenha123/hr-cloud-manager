# ⚡ INSTRUCCIONES RÁPIDAS — HR Cloud Manager

## PASO 1: Base de datos (MySQL)
```sql
CREATE DATABASE hr_cloud_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## PASO 2: Importar datos demo
```bash
mysql -u root -p hr_cloud_manager < database/hr_cloud_manager.sql
```

## PASO 3: Configurar backend
```bash
cd backend
composer install
cp .env.example .env
# Editar .env: poner DB_USERNAME y DB_PASSWORD
php artisan key:generate
php artisan jwt:secret
php artisan migrate        # (o usar el .sql del paso 2)
php artisan serve          # → http://localhost:8000
```

## PASO 4: Abrir frontend
```bash
cd frontend
# Opción A (Python):
python3 -m http.server 3000
# Opción B: Abrir index.html directamente en el navegador
```

## PASO 5: Ingresar al sistema
- URL: http://localhost:3000
- Email: admin@hrcloud.com
- Password: password

---
⚠️  Si el backend corre en una URL distinta a http://localhost:8000,
    editar la línea `API_BASE` en frontend/js/api.js
