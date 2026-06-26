-- ============================================================
--  HR CLOUD MANAGER — Script de Base de Datos
--  Motor: MariaDB 10.4 / MySQL 8.0
--  Codificación: UTF-8 (utf8mb4)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- ------------------------------------------------------------
-- Crear y seleccionar la base de datos
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `hr_cloud_manager`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `hr_cloud_manager`;

-- ============================================================
-- TABLA: users
-- Cuentas de acceso al sistema.
-- Un "admin" es el dueño/empresa. Los roles manager, hr y
-- employee son sub-usuarios creados por ese admin (created_by).
-- Si el rol es "employee", employee_id apunta al registro HR.
-- ============================================================
CREATE TABLE `users` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`               VARCHAR(255)    NOT NULL,
  `email`              VARCHAR(255)    NOT NULL,
  `email_verified_at`  TIMESTAMP       NULL DEFAULT NULL,
  `password`           VARCHAR(255)    NOT NULL,
  `company_name`       VARCHAR(255)    NOT NULL,
  `role`               ENUM('admin','manager','hr','employee') NOT NULL DEFAULT 'admin',
  `created_by`         BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Admin que creó este sub-usuario',
  `employee_id`        BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Vincula al empleado HR (solo rol employee)',
  `is_active`          TINYINT(1)      NOT NULL DEFAULT 1,
  `remember_token`     VARCHAR(100)    NULL DEFAULT NULL,
  `created_at`         TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`         TIMESTAMP       NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `fk_users_created_by` (`created_by`),
  KEY `fk_users_employee`   (`employee_id`),

  CONSTRAINT `fk_users_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA: employees
-- Datos de recursos humanos de cada empleado.
-- user_id → admin dueño de la empresa (multitenancy).
-- ============================================================
CREATE TABLE `employees` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`            BIGINT UNSIGNED NOT NULL                COMMENT 'Admin empresa (multitenancy)',
  `first_name`         VARCHAR(100)    NOT NULL,
  `last_name`          VARCHAR(100)    NOT NULL,
  `email`              VARCHAR(255)    NULL DEFAULT NULL,
  `phone`              VARCHAR(20)     NULL DEFAULT NULL,
  `document_type`      ENUM('CI','RUT','DNI','PASAPORTE') NOT NULL DEFAULT 'CI',
  `document_number`    VARCHAR(20)     NOT NULL,
  `birth_date`         DATE            NULL DEFAULT NULL,
  `hire_date`          DATE            NOT NULL,
  `department`         VARCHAR(100)    NOT NULL,
  `position`           VARCHAR(100)    NOT NULL,
  `salary`             DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  `status`             ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `address`            VARCHAR(255)    NULL DEFAULT NULL,
  `emergency_contact`  VARCHAR(100)    NULL DEFAULT NULL,
  `emergency_phone`    VARCHAR(20)     NULL DEFAULT NULL,
  `deleted_at`         TIMESTAMP       NULL DEFAULT NULL      COMMENT 'Soft delete',
  `created_at`         TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`         TIMESTAMP       NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_employees_user_status`     (`user_id`, `status`),
  KEY `idx_employees_user_department` (`user_id`, `department`),

  CONSTRAINT `fk_employees_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA: attendances
-- Registro diario de asistencia (un registro por empleado/día).
-- ============================================================
CREATE TABLE `attendances` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id`   BIGINT UNSIGNED NOT NULL,
  `date`          DATE            NOT NULL,
  `check_in`      DATETIME        NULL DEFAULT NULL,
  `check_out`     DATETIME        NULL DEFAULT NULL,
  `status`        ENUM('present','absent','late','half_day','holiday') NOT NULL DEFAULT 'present',
  `notes`         TEXT            NULL DEFAULT NULL,
  `late_minutes`  INT             NOT NULL DEFAULT 0,
  `created_at`    TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`    TIMESTAMP       NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `attendance_employee_date` (`employee_id`, `date`),
  KEY `idx_attendance_date` (`date`),

  CONSTRAINT `fk_attendance_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA: vacation_requests
-- Solicitudes de vacaciones con flujo pending→approved/rejected.
-- ============================================================
CREATE TABLE `vacation_requests` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id`      BIGINT UNSIGNED NOT NULL,
  `start_date`       DATE            NOT NULL,
  `end_date`         DATE            NOT NULL,
  `days_requested`   INT             NOT NULL,
  `reason`           TEXT            NULL DEFAULT NULL,
  `status`           ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by`      BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Usuario que aprobó/rechazó',
  `approved_at`      DATETIME        NULL DEFAULT NULL,
  `rejection_reason` TEXT            NULL DEFAULT NULL,
  `created_at`       TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`       TIMESTAMP       NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_vacation_employee_status` (`employee_id`, `status`),
  KEY `idx_vacation_dates`           (`start_date`, `end_date`),
  KEY `fk_vacation_approver`         (`approved_by`),

  CONSTRAINT `fk_vacation_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vacation_approver`
    FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA: documents
-- Documentos adjuntos de cada empleado (contratos, certs, etc.)
-- ============================================================
CREATE TABLE `documents` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id`  BIGINT UNSIGNED NOT NULL,
  `user_id`      BIGINT UNSIGNED NOT NULL  COMMENT 'Usuario que subió el documento',
  `title`        VARCHAR(255)    NOT NULL,
  `type`         ENUM('contract','certificate','id_document','payroll','other') NOT NULL,
  `file_path`    VARCHAR(500)    NOT NULL,
  `file_name`    VARCHAR(255)    NOT NULL,
  `file_size`    INT             NULL DEFAULT NULL,
  `expiry_date`  DATE            NULL DEFAULT NULL,
  `notes`        TEXT            NULL DEFAULT NULL,
  `created_at`   TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`   TIMESTAMP       NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_documents_employee_type` (`employee_id`, `type`),
  KEY `fk_document_user`            (`user_id`),

  CONSTRAINT `fk_document_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_document_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLA: notifications
-- Notificaciones internas del sistema para cada usuario.
-- ============================================================
CREATE TABLE `notifications` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `title`         VARCHAR(255)    NOT NULL,
  `message`       TEXT            NOT NULL,
  `type`          ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
  `is_read`       TINYINT(1)      NOT NULL DEFAULT 0,
  `related_id`    BIGINT UNSIGNED NULL DEFAULT NULL  COMMENT 'ID del registro relacionado',
  `related_type`  VARCHAR(50)     NULL DEFAULT NULL  COMMENT 'Tipo: vacation, employee, etc.',
  `created_at`    TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`    TIMESTAMP       NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`, `is_read`),

  CONSTRAINT `fk_notification_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Datos de ejemplo (Admin demo)
-- ============================================================
INSERT INTO `users` (`id`, `name`, `email`, `password`, `company_name`, `role`, `is_active`, `created_at`, `updated_at`)
VALUES (1, 'Admin Demo', 'admin@hrcloud.com', '$2y$12$demohashedpassword', 'Empresa Demo S.A.', 'admin', 1, NOW(), NOW());
