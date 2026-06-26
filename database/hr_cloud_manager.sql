-- ============================================================
-- HR CLOUD MANAGER - Script de Base de Datos MySQL
-- Sistema SaaS de Gestión de Recursos Humanos para PYMES
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `hr_cloud_manager`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `hr_cloud_manager`;

-- ============================================================
-- TABLA: users (Empresas/administradores del SaaS)
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`               VARCHAR(255)    NOT NULL,
    `email`              VARCHAR(255)    NOT NULL,
    `email_verified_at`  TIMESTAMP       NULL DEFAULT NULL,
    `password`           VARCHAR(255)    NOT NULL,
    `company_name`       VARCHAR(255)    NOT NULL,
    `role`               ENUM('admin','manager','hr','employee') NOT NULL DEFAULT 'admin',
    `is_active`          TINYINT(1)      NOT NULL DEFAULT 1,
    `remember_token`     VARCHAR(100)    NULL,
    `created_at`         TIMESTAMP       NULL DEFAULT NULL,
    `updated_at`         TIMESTAMP       NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: employees (Aislados por user_id = empresa = multitenancy)
-- ============================================================
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`           BIGINT UNSIGNED NOT NULL COMMENT 'FK empresa (multitenancy)',
    `first_name`        VARCHAR(100)    NOT NULL,
    `last_name`         VARCHAR(100)    NOT NULL,
    `email`             VARCHAR(255)    NULL DEFAULT NULL,
    `phone`             VARCHAR(20)     NULL DEFAULT NULL,
    `document_type`     ENUM('CI','RUT','DNI','PASAPORTE') NOT NULL DEFAULT 'CI',
    `document_number`   VARCHAR(20)     NOT NULL,
    `birth_date`        DATE            NULL DEFAULT NULL,
    `hire_date`         DATE            NOT NULL,
    `department`        VARCHAR(100)    NOT NULL,
    `position`          VARCHAR(100)    NOT NULL,
    `salary`            DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    `status`            ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
    `address`           VARCHAR(255)    NULL DEFAULT NULL,
    `emergency_contact` VARCHAR(100)    NULL DEFAULT NULL,
    `emergency_phone`   VARCHAR(20)     NULL DEFAULT NULL,
    `deleted_at`        TIMESTAMP       NULL DEFAULT NULL,
    `created_at`        TIMESTAMP       NULL DEFAULT NULL,
    `updated_at`        TIMESTAMP       NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_employees_user_status`     (`user_id`, `status`),
    KEY `idx_employees_user_department` (`user_id`, `department`),
    CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: attendances (Control de asistencia diaria)
-- ============================================================
DROP TABLE IF EXISTS `attendances`;
CREATE TABLE `attendances` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `employee_id`  BIGINT UNSIGNED NOT NULL,
    `date`         DATE            NOT NULL,
    `check_in`     DATETIME        NULL DEFAULT NULL,
    `check_out`    DATETIME        NULL DEFAULT NULL,
    `status`       ENUM('present','absent','late','half_day','holiday') NOT NULL DEFAULT 'present',
    `notes`        TEXT            NULL DEFAULT NULL,
    `late_minutes` INT             NOT NULL DEFAULT 0,
    `created_at`   TIMESTAMP       NULL DEFAULT NULL,
    `updated_at`   TIMESTAMP       NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `attendance_employee_date` (`employee_id`, `date`),
    KEY `idx_attendance_date` (`date`),
    CONSTRAINT `fk_attendance_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: vacation_requests (Gestión de vacaciones)
-- ============================================================
DROP TABLE IF EXISTS `vacation_requests`;
CREATE TABLE `vacation_requests` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `employee_id`      BIGINT UNSIGNED NOT NULL,
    `start_date`       DATE            NOT NULL,
    `end_date`         DATE            NOT NULL,
    `days_requested`   INT             NOT NULL,
    `reason`           TEXT            NULL DEFAULT NULL,
    `status`           ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    `approved_by`      BIGINT UNSIGNED NULL DEFAULT NULL,
    `approved_at`      DATETIME        NULL DEFAULT NULL,
    `rejection_reason` TEXT            NULL DEFAULT NULL,
    `created_at`       TIMESTAMP       NULL DEFAULT NULL,
    `updated_at`       TIMESTAMP       NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_vacation_employee_status` (`employee_id`, `status`),
    KEY `idx_vacation_dates`           (`start_date`, `end_date`),
    CONSTRAINT `fk_vacation_employee`  FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_vacation_approver`  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: documents (Gestión documental)
-- ============================================================
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `employee_id` BIGINT UNSIGNED NOT NULL,
    `user_id`     BIGINT UNSIGNED NOT NULL,
    `title`       VARCHAR(255)    NOT NULL,
    `type`        ENUM('contract','certificate','id_document','payroll','other') NOT NULL,
    `file_path`   VARCHAR(500)    NOT NULL,
    `file_name`   VARCHAR(255)    NOT NULL,
    `file_size`   INT             NULL DEFAULT NULL,
    `expiry_date` DATE            NULL DEFAULT NULL,
    `notes`       TEXT            NULL DEFAULT NULL,
    `created_at`  TIMESTAMP       NULL DEFAULT NULL,
    `updated_at`  TIMESTAMP       NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_documents_employee_type` (`employee_id`, `type`),
    CONSTRAINT `fk_document_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_document_user`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: notifications (Notificaciones del sistema)
-- ============================================================
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`      BIGINT UNSIGNED NOT NULL,
    `title`        VARCHAR(255)    NOT NULL,
    `message`      TEXT            NOT NULL,
    `type`         ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
    `is_read`      TINYINT(1)      NOT NULL DEFAULT 0,
    `related_id`   BIGINT UNSIGNED NULL DEFAULT NULL,
    `related_type` VARCHAR(50)     NULL DEFAULT NULL,
    `created_at`   TIMESTAMP       NULL DEFAULT NULL,
    `updated_at`   TIMESTAMP       NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user_read` (`user_id`, `is_read`),
    CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DATOS DE DEMO
-- Contraseña de todos los usuarios demo: "password"
-- Hash bcrypt de "password"
-- ============================================================
INSERT INTO `users` (`name`,`email`,`password`,`company_name`,`role`,`is_active`,`created_at`,`updated_at`) VALUES
('Admin Demo','admin@hrcloud.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Empresa Demo S.A.','admin',1,NOW(),NOW()),
('Tech Corp Admin','admin@techcorp.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Tech Corp Bolivia','admin',1,NOW(),NOW());

INSERT INTO `employees` (`user_id`,`first_name`,`last_name`,`email`,`phone`,`document_type`,`document_number`,`birth_date`,`hire_date`,`department`,`position`,`salary`,`status`,`emergency_contact`,`emergency_phone`,`created_at`,`updated_at`) VALUES
(1,'Carlos','Mamani','c.mamani@empresa.com','71234567','CI','7123456','1990-03-15','2022-01-10','Tecnología','Desarrollador Senior',8500.00,'active','María Mamani','79876543',NOW(),NOW()),
(1,'María','Flores Quispe','m.flores@empresa.com','72345678','CI','8234567','1988-07-22','2021-06-01','Finanzas','Contadora General',7200.00,'active','Pedro Flores','78765432',NOW(),NOW()),
(1,'Roberto','Chávez','r.chavez@empresa.com','73456789','CI','9345678','1992-11-30','2023-03-15','Ventas','Ejecutivo Comercial',6000.00,'active','Ana Chávez','77654321',NOW(),NOW()),
(1,'Ana','Quispe','a.quispe@empresa.com','74567890','CI','10456789','1995-05-18','2022-09-01','RRHH','Analista RRHH',6500.00,'active','Luis Quispe','76543210',NOW(),NOW()),
(1,'Luis','Torrico','l.torrico@empresa.com','75678901','CI','5678901','1985-01-25','2020-02-14','Tecnología','Gerente TI',12000.00,'active','Carmen Torrico','75432109',NOW(),NOW());

-- Asistencias de hoy
INSERT INTO `attendances` (`employee_id`,`date`,`check_in`,`check_out`,`status`,`late_minutes`,`created_at`,`updated_at`) VALUES
(1,CURDATE(),CONCAT(CURDATE(),' 08:55:00'),NULL,'present',0,NOW(),NOW()),
(2,CURDATE(),CONCAT(CURDATE(),' 09:18:00'),NULL,'late',18,NOW(),NOW()),
(3,CURDATE(),NULL,NULL,'absent',0,NOW(),NOW()),
(4,CURDATE(),CONCAT(CURDATE(),' 08:48:00'),NULL,'present',0,NOW(),NOW()),
(5,CURDATE(),CONCAT(CURDATE(),' 09:00:00'),NULL,'present',0,NOW(),NOW());

-- Solicitudes de vacaciones
INSERT INTO `vacation_requests` (`employee_id`,`start_date`,`end_date`,`days_requested`,`reason`,`status`,`created_at`,`updated_at`) VALUES
(1,DATE_ADD(CURDATE(),INTERVAL 7 DAY),DATE_ADD(CURDATE(),INTERVAL 16 DAY),10,'Vacaciones anuales familiares','pending',NOW(),NOW()),
(2,DATE_ADD(CURDATE(),INTERVAL 30 DAY),DATE_ADD(CURDATE(),INTERVAL 34 DAY),5,'Viaje de estudios','approved',NOW(),NOW()),
(3,DATE_ADD(CURDATE(),INTERVAL 60 DAY),DATE_ADD(CURDATE(),INTERVAL 64 DAY),5,'Descanso personal','rejected',NOW(),NOW());

-- Notificaciones de bienvenida
INSERT INTO `notifications` (`user_id`,`title`,`message`,`type`,`is_read`,`created_at`,`updated_at`) VALUES
(1,'¡Bienvenido a HR Cloud Manager!','Tu empresa fue configurada exitosamente. Comienza registrando empleados.','info',0,NOW(),NOW()),
(1,'Solicitud de vacaciones pendiente','Carlos Mamani tiene una solicitud de vacaciones pendiente de aprobación.','warning',0,NOW(),NOW()),
(1,'Empleado con tardanza hoy','María Flores Quispe llegó 18 minutos tarde hoy.','warning',0,NOW(),NOW());

-- ============================================================
-- FIN DEL SCRIPT
-- Para restaurar: mysql -u root -p hr_cloud_manager < hr_cloud_manager.sql
-- Credenciales demo: admin@hrcloud.com / password
-- ============================================================
