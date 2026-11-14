CREATE TABLE IF NOT EXISTS delivery_admin_settings (
  id smallint PRIMARY KEY CHECK (id = 1),
  paused boolean NOT NULL DEFAULT true,
  preferred_provider text CHECK (preferred_provider IN ('doordash_drive', 'uber_direct')),
  doordash_stage text NOT NULL DEFAULT 'not_started' CHECK (doordash_stage IN ('not_started', 'account_created', 'applied', 'sandbox_access', 'production_approved')),
  uber_stage text NOT NULL DEFAULT 'account_created' CHECK (uber_stage IN ('not_started', 'account_created', 'applied', 'sandbox_access', 'production_approved')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO delivery_admin_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
