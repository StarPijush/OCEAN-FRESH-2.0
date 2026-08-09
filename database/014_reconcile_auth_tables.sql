-- 014_reconcile_auth_tables.sql
-- OceanFresh Auth Table Reconciliation
--
-- Aligns auth_sessions, auth_devices, and audit_logs (from 002b_auth_tables.sql)
-- with the repositories in packages/auth:
--   * auth_sessions  — supabaseService.upsert() always stamps updated_at
--                      (packages/supabase/src/service.ts) and
--                      trg_auth_sessions_updated_at sets NEW.updated_at.
--   * auth_devices   — same upsert + trg_auth_devices_updated_at behaviour.
--   * audit_logs     — SupabaseAuthRepository.saveAuditLog() writes
--                      id, user_id, event, actor_id, target_id, correlation_id,
--                      source, metadata, timestamp plus upsert added updated_at
--                      (see AuditLogEntry in
--                      packages/auth/src/repository/auth.repository.ts).
--
-- All changes are additive (ADD COLUMN IF NOT EXISTS). Safe to re-run.

-- ============================================================
-- 1. AUTH SESSIONS — add updated_at (code upsert + trigger require it)
-- ============================================================
ALTER TABLE public.auth_sessions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ============================================================
-- 2. AUTH DEVICES — add updated_at (code upsert + trigger require it)
-- ============================================================
ALTER TABLE public.auth_devices
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ============================================================
-- 3. AUDIT LOGS — align columns with AuditLogEntry (repository contract)
--    'type' and 'data' (created by 002b) are kept for forward compatibility;
--    the repository additionally writes event/actor/target/correlation/source.
-- ============================================================
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS event text,
  ADD COLUMN IF NOT EXISTS actor_id text,
  ADD COLUMN IF NOT EXISTS target_id text,
  ADD COLUMN IF NOT EXISTS correlation_id text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();