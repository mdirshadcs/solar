-- SolarERP baseline schema: platform + core tables from BRD B7.
-- Conventions (B7): InnoDB, utf8mb4, DATETIME(3) in UTC, tenant_id first in every tenant index.
-- Business-module tables are added by later migrations (V002+), one prompt at a time.

-- ===================== PLATFORM =====================
CREATE TABLE plans (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(40)  NOT NULL UNIQUE,          -- starter, growth, enterprise
  name             VARCHAR(100) NOT NULL,
  is_active        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE plan_prices (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id          BIGINT UNSIGNED NOT NULL,
  billing_cycle    ENUM('MONTHLY','ANNUAL') NOT NULL,
  currency         CHAR(3)       NOT NULL,
  base_price       DECIMAL(18,2) NOT NULL,
  included_users   INT UNSIGNED  NOT NULL,
  extra_user_price DECIMAL(18,2) NOT NULL,
  gateway_price_id VARCHAR(100)  NULL,                    -- id in Razorpay/Stripe
  UNIQUE KEY uq_plan_cycle_cur (plan_id, billing_cycle, currency),
  CONSTRAINT fk_pp_plan FOREIGN KEY (plan_id) REFERENCES plans (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE plan_features (
  plan_id          BIGINT UNSIGNED NOT NULL,
  feature_key      VARCHAR(80)  NOT NULL,                 -- e.g. module.amc, limit.projects_per_month
  value            VARCHAR(100) NOT NULL,                 -- 'true' / '100' / 'unlimited'
  PRIMARY KEY (plan_id, feature_key),
  CONSTRAINT fk_pf_plan FOREIGN KEY (plan_id) REFERENCES plans (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE tenants (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id        CHAR(26)     NOT NULL UNIQUE,
  subdomain        VARCHAR(63)  NOT NULL UNIQUE,
  legal_name       VARCHAR(200) NOT NULL,
  country_code     CHAR(2)      NOT NULL,
  currency         CHAR(3)      NOT NULL,
  time_zone        VARCHAR(64)  NOT NULL DEFAULT 'Asia/Kolkata',
  status           ENUM('TRIALING','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED','EXPIRED') NOT NULL,
  isolation_mode   ENUM('SHARED','DEDICATED') NOT NULL DEFAULT 'SHARED',
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE subscriptions (
  id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id               BIGINT UNSIGNED NOT NULL,
  plan_price_id           BIGINT UNSIGNED NOT NULL,
  status                  ENUM('TRIALING','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED','EXPIRED') NOT NULL,
  seats                   INT UNSIGNED NOT NULL,
  trial_ends_at           DATETIME(3) NULL,
  current_period_start    DATETIME(3) NULL,
  current_period_end      DATETIME(3) NULL,
  cancel_at_period_end    TINYINT(1)  NOT NULL DEFAULT 0,
  gateway                 ENUM('RAZORPAY','STRIPE','OFFLINE') NOT NULL,
  gateway_subscription_id VARCHAR(100) NULL,
  created_at              DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at              DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY ix_sub_tenant (tenant_id, status),
  UNIQUE KEY uq_sub_gateway (gateway, gateway_subscription_id),
  CONSTRAINT fk_sub_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_sub_price  FOREIGN KEY (plan_price_id) REFERENCES plan_prices (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Webhook events from the payment gateway, stored once (idempotency)
CREATE TABLE payment_events (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gateway          ENUM('RAZORPAY','STRIPE') NOT NULL,
  event_id         VARCHAR(100) NOT NULL,
  event_type       VARCHAR(100) NOT NULL,
  payload          JSON         NOT NULL,
  processed_at     DATETIME(3)  NULL,
  received_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_gateway_event (gateway, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===================== CORE =====================
CREATE TABLE users (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  public_id        CHAR(26)     NOT NULL UNIQUE,
  email            VARCHAR(255) NOT NULL,
  mobile           VARCHAR(20)  NULL,
  full_name        VARCHAR(150) NOT NULL,
  password_hash    VARCHAR(255) NULL,                     -- Argon2id; NULL for SSO-only users
  mfa_secret_enc   VARBINARY(255) NULL,                   -- encrypted by the application
  status           ENUM('INVITED','ACTIVE','DISABLED') NOT NULL DEFAULT 'INVITED',
  last_login_at    DATETIME(3)  NULL,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)  NULL,
  UNIQUE KEY uq_user_email (tenant_id, email),
  UNIQUE KEY uq_user_tenant_id (tenant_id, id),
  CONSTRAINT fk_user_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===================== CROSS-CUTTING =====================
-- Transactional outbox: written in the same transaction as the business change (B10)
CREATE TABLE outbox_events (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  aggregate_type   VARCHAR(60)  NOT NULL,                 -- Project, Quotation, Invoice ...
  aggregate_id     BIGINT UNSIGNED NOT NULL,
  event_type       VARCHAR(100) NOT NULL,                 -- quotation.accepted ...
  payload          JSON         NOT NULL,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  published_at     DATETIME(3)  NULL,
  KEY ix_outbox_unpublished (published_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Append-only audit trail, partitioned by quarter (B7, B15). MySQL does not allow
-- foreign keys on partitioned tables; add a partition each quarter (runbook in prompt 1.10).
CREATE TABLE audit_logs (
  id               BIGINT UNSIGNED AUTO_INCREMENT,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  occurred_at      DATETIME(3)  NOT NULL,
  user_id          BIGINT UNSIGNED NULL,
  action           ENUM('CREATE','UPDATE','DELETE','LOGIN','EXPORT','APPROVE','IMPERSONATE') NOT NULL,
  entity_type      VARCHAR(60)  NOT NULL,
  entity_id        BIGINT UNSIGNED NULL,
  changes          JSON         NULL,                     -- {field: [old, new]}
  ip_address       VARCHAR(45)  NULL,
  PRIMARY KEY (id, occurred_at),
  KEY ix_audit_entity (tenant_id, entity_type, entity_id, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  PARTITION BY RANGE COLUMNS (occurred_at) (
    PARTITION p2026q4 VALUES LESS THAN ('2027-01-01'),
    PARTITION p2027q1 VALUES LESS THAN ('2027-04-01'),
    PARTITION p2027q2 VALUES LESS THAN ('2027-07-01'),
    PARTITION p2027q3 VALUES LESS THAN ('2027-10-01'),
    PARTITION p2027q4 VALUES LESS THAN ('2028-01-01'),
    PARTITION pmax    VALUES LESS THAN (MAXVALUE)
  );
