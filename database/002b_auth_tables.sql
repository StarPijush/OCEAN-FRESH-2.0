-- 002b_auth_tables.sql
-- OceanFresh Auth Tables
-- Tables referenced by auth repository but missing from original schema
-- Run AFTER 002_tables.sql

-- ============================================================
-- AUTH SESSIONS
-- Tracks user sessions for security auditing and device management
-- ============================================================
CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_pair jsonb NOT NULL,
  device jsonb,
  metadata jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  absolute_expires_at timestamptz NOT NULL,
  is_remember_me boolean NOT NULL DEFAULT false,
  is_revoked boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions (expires_at) WHERE is_revoked = false;

-- ============================================================
-- AUTH DEVICES
-- Tracks known devices for each user
-- ============================================================
CREATE TABLE auth_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  os text,
  browser text,
  ip_hash text,
  is_trusted boolean NOT NULL DEFAULT false,
  risk_score integer NOT NULL DEFAULT 0,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_devices_user_id ON auth_devices (user_id);

-- ============================================================
-- AUDIT LOGS
-- Security audit trail for user actions
-- ============================================================
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  data jsonb,
  metadata jsonb,
  timestamp timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Auth sessions: users see own, admins see all
CREATE POLICY "auth_sessions_select_own"
ON auth_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "auth_sessions_all_admin"
ON auth_sessions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Auth devices: users manage own, admins see all
CREATE POLICY "auth_devices_all_own"
ON auth_devices FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "auth_devices_select_admin"
ON auth_devices FOR SELECT
TO authenticated
USING (public.is_admin());

-- Audit logs: users read own, admins read all, service role writes
CREATE POLICY "audit_logs_select_own"
ON audit_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "audit_logs_select_admin"
ON audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "audit_logs_insert_service"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE TRIGGER trg_auth_sessions_updated_at
  BEFORE UPDATE ON auth_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_auth_devices_updated_at
  BEFORE UPDATE ON auth_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();