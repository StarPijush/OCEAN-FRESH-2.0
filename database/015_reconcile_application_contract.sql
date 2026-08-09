-- 015_reconcile_application_contract.sql
-- OceanFresh Application Contract Reconciliation
--
-- Aligns the database with the repository layer (packages/*/src/repository):
--   1. supabaseService.add() / update() (packages/supabase/src/service.ts)
--      ALWAYS stamps created_at / updated_at into INSERT/UPDATE payloads, so
--      every table written through it must expose those columns:
--        * order_items             — had created_at only; add updated_at
--        * order_timeline_entries  — had created_at only; add updated_at
--        * cart_items              — had added_at only; add created_at + updated_at
--   2. audit_logs.type is NOT NULL with no default, but
--      SupabaseAuthRepository.saveAuditLog() never writes 'type' or 'data'
--      (it writes event/actor_id/target_id/correlation_id/source/metadata),
--      so every audit insert would violate the NOT NULL constraint.
--
-- All changes are additive / re-runnable (IF NOT EXISTS, guarded ALTERs).

-- ============================================================
-- 1. CHILD ROW TIMESTAMP COLUMNS (supabaseService contract)
-- ============================================================

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE order_timeline_entries
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ============================================================
-- 2. AUDIT LOGS — type is optional (repository never writes it)
-- ============================================================

ALTER TABLE audit_logs
  ALTER COLUMN type DROP NOT NULL;

-- ============================================================
-- 3. UPDATED_AT INTEGRITY TRIGGERS (005_triggers.sql pattern)
-- ============================================================

CREATE TRIGGER trg_order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_order_timeline_entries_updated_at
  BEFORE UPDATE ON order_timeline_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();