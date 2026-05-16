-- Mapa de Volquetes — Migración inicial (v2: con auth, trust, location validation)
-- PostgreSQL 16 + PostGIS

-- ===========================================
-- Extensiones
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ===========================================
-- Enums
-- ===========================================
CREATE TYPE report_status AS ENUM (
  'seen', 'full', 'badly_placed', 'abandoned', 'in_use',
  'removed', 'hidden', 'under_review'
);

CREATE TYPE moderation_status AS ENUM (
  'pending', 'approved', 'spam', 'hidden'
);

CREATE TYPE location_validation AS ENUM (
  'validated_nearby', 'manual_unverified', 'denied_permission', 'too_far', 'unknown'
);

CREATE TYPE user_role AS ENUM ('user', 'admin');

-- ===========================================
-- Tabla: users
-- ===========================================
CREATE TABLE users (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                   TEXT NOT NULL UNIQUE,
  password_hash           TEXT NOT NULL,
  display_name            TEXT,
  email_verified          BOOLEAN NOT NULL DEFAULT FALSE,
  verification_code       TEXT,
  verification_expires_at TIMESTAMPTZ,
  role                    user_role NOT NULL DEFAULT 'user',

  -- Trust / reputación
  trust_score             INT NOT NULL DEFAULT 10,
  trust_stars             INT NOT NULL DEFAULT 1 CHECK (trust_stars BETWEEN 1 AND 5),
  reports_count           INT NOT NULL DEFAULT 0,
  confirmed_reports_count INT NOT NULL DEFAULT 0,
  rejected_reports_count  INT NOT NULL DEFAULT 0,
  flags_received_count    INT NOT NULL DEFAULT 0,

  is_blocked              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at           TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role) WHERE role = 'admin';

-- ===========================================
-- Tabla: reports
-- ===========================================
CREATE TABLE reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id),

  -- Ubicación del volquete (pública)
  latitude          DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude         DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  location          GEOGRAPHY(POINT, 4326),

  -- Ubicación del reportador (privada, no exponer en API pública)
  reporter_latitude          DOUBLE PRECISION,
  reporter_longitude         DOUBLE PRECISION,
  location_accuracy_meters   DOUBLE PRECISION,
  distance_from_report_meters DOUBLE PRECISION,
  location_validation_status location_validation NOT NULL DEFAULT 'unknown',

  -- Datos del reporte
  status              report_status NOT NULL DEFAULT 'seen',
  description         TEXT CHECK (char_length(description) <= 500),
  photo_url           TEXT NOT NULL,
  confidence_score    INT NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),

  -- Contadores desnormalizados
  confirmation_count  INT NOT NULL DEFAULT 0,
  removal_count       INT NOT NULL DEFAULT 0,
  flag_count          INT NOT NULL DEFAULT 0,

  -- Moderación
  moderation_status   moderation_status NOT NULL DEFAULT 'pending',
  reporter_ip         INET,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
  last_confirmed_at   TIMESTAMPTZ
);

CREATE INDEX idx_reports_location ON reports USING GIST (location);
CREATE INDEX idx_reports_lat_lng ON reports (latitude, longitude);
CREATE INDEX idx_reports_status ON reports (status) WHERE status NOT IN ('removed', 'hidden');
CREATE INDEX idx_reports_expires ON reports (expires_at) WHERE status NOT IN ('removed', 'hidden');
CREATE INDEX idx_reports_moderation ON reports (moderation_status) WHERE moderation_status != 'approved';
CREATE INDEX idx_reports_user ON reports (user_id);
CREATE INDEX idx_reports_confidence ON reports (confidence_score DESC);

-- Trigger: auto-calcular columna location PostGIS
CREATE OR REPLACE FUNCTION update_report_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reports_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON reports
  FOR EACH ROW EXECUTE FUNCTION update_report_location();

-- ===========================================
-- Tabla: report_confirmations
-- ===========================================
CREATE TABLE report_confirmations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_confirmation_user UNIQUE (report_id, user_id)
);

CREATE INDEX idx_confirmations_report ON report_confirmations (report_id);

-- ===========================================
-- Tabla: report_removals
-- ===========================================
CREATE TABLE report_removals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_removal_user UNIQUE (report_id, user_id)
);

CREATE INDEX idx_removals_report ON report_removals (report_id);

-- ===========================================
-- Tabla: report_flags
-- ===========================================
CREATE TABLE report_flags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  ip_address  INET,
  reason      TEXT CHECK (char_length(reason) <= 300),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_flag_user UNIQUE (report_id, user_id)
);

CREATE INDEX idx_flags_report ON report_flags (report_id);
