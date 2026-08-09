-- 009_seed.sql
-- OceanFresh Initial Seed Data
-- Default configuration, categories, and initial admin account

-- ============================================================
-- 1. DEFAULT SHOP SETTINGS
-- ============================================================

INSERT INTO shop_settings (id, whatsapp_number, delivery_charge_amount, delivery_free_above)
VALUES (
  'default',
  '918509597935',
  40.00,
  500.00
)
ON CONFLICT (id) DO UPDATE SET
  whatsapp_number         = EXCLUDED.whatsapp_number,
  delivery_charge_amount  = EXCLUDED.delivery_charge_amount,
  delivery_free_above     = EXCLUDED.delivery_free_above;

-- ============================================================
-- 2. DEFAULT CATEGORIES
-- ============================================================

INSERT INTO categories (id, name, slug, description, level, sort_order, status, visibility, created_by, path)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Fresh Fish',
    'fresh-fish',
    'Freshwater fish from rivers and ponds',
    0, 1, 'ACTIVE', 'public', 'seed',
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Sea Fish',
    'sea-fish',
    'Saltwater fish from the ocean',
    0, 2, 'ACTIVE', 'public', 'seed',
    'a0000000-0000-0000-0000-000000000002'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Prawns',
    'prawns',
    'Fresh prawns and shrimp',
    0, 3, 'ACTIVE', 'public', 'seed',
    'a0000000-0000-0000-0000-000000000003'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Crabs',
    'crabs',
    'Live and fresh crabs',
    0, 4, 'ACTIVE', 'public', 'seed',
    'a0000000-0000-0000-0000-000000000004'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. INITIAL ADMIN ACCOUNT
-- ============================================================
-- IMPORTANT: Do NOT insert directly into auth.users via raw SQL.
-- Supabase Auth is the single source of authentication.
-- Bypassing it would create security holes and unsynchronized state.
--
-- The database only seeds the admin_profiles metadata row AFTER
-- the auth user is created through supported Supabase methods.
--
-- ┌─────────────────────────────────────────────────────────────┐
-- │  HOW TO CREATE THE INITIAL ADMINISTRATOR                   │
-- ├─────────────────────────────────────────────────────────────┤
-- │                                                             │
-- │  Option A — Supabase Dashboard (easiest)                   │
-- │                                                             │
-- │    1. Go to Authentication > Users > Add User               │
-- │    2. Email:    admin@freshcatch.com                        │
-- │    3. Password: (generate a strong password, store safely)  │
-- │    4. Auto-Confirm: enabled                                 │
-- │    5. Click "Create user"                                   │
-- │    6. Copy the UUID of the newly created user               │
-- │    7. Run the INSERT statements below with that UUID        │
-- │                                                             │
-- │  Option B — Supabase Admin API (for scripts/automation)     │
-- │                                                             │
-- │    const { data, error } = await supabaseAdmin               │
-- │      .auth.admin.createUser({                               │
-- │        email: 'admin@freshcatch.com',                       │
-- │        password: '<strong-password>',                       │
-- │        email_confirm: true,                                 │
-- │        user_metadata: { display_name: 'Shop Owner' }        │
-- │      });                                                    │
-- │    const userId = data.user.id;                             │
-- │    // Then run INSERT statements below with userId          │
-- │                                                             │
-- └─────────────────────────────────────────────────────────────┘
--
-- After the auth user exists, manually execute these INSERTs
-- with the actual UUID from the created auth user:
--
--   INSERT INTO admin_profiles (user_id, full_name, mobile, role)
--   VALUES (
--     '<UUID-FROM-AUTH>',
--     'Shop Owner',
--     '8509597935',
--     'super_admin'
--   );
--
--   INSERT INTO users (id, email, display_name, provider,
--                      email_verified, account_status, is_anonymous)
--   VALUES (
--     '<UUID-FROM-AUTH>',
--     'admin@freshcatch.com',
--     'Shop Owner',
--     'EMAIL',
--     true,
--     'ACTIVE',
--     false
--   );
-- ============================================================

-- ============================================================
-- 4. VERIFY SEED DATA
-- ============================================================

-- Return summary of seeded data
SELECT 'seed_complete' AS status,
  (SELECT count(*) FROM categories) AS categories_count,
  (SELECT count(*) FROM shop_settings) AS settings_count;
