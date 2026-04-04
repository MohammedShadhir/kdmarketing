CREATE TABLE IF NOT EXISTS ghl_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  location_id TEXT NOT NULL UNIQUE,
  api_token TEXT NOT NULL,
  calendar_id TEXT,
  pipeline_id TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ghl_accounts_location_id ON ghl_accounts(location_id);
CREATE INDEX idx_ghl_accounts_is_active ON ghl_accounts(is_active);

CREATE OR REPLACE FUNCTION update_ghl_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ghl_accounts_updated_at
  BEFORE UPDATE ON ghl_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_ghl_accounts_updated_at();

CREATE OR REPLACE FUNCTION ensure_single_default_ghl_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE ghl_accounts
    SET is_default = false
    WHERE id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_ghl_account
  BEFORE INSERT OR UPDATE ON ghl_accounts
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_ghl_account();

ALTER TABLE ghl_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on ghl_accounts"
  ON ghl_accounts
  FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO ghl_accounts (
  account_name,
  location_id,
  api_token,
  calendar_id,
  pipeline_id,
  is_active,
  is_default,
  notes
) VALUES (
  'All Pro Fence',
  'fRrcVKjOTccYItbX9inw',
  'pit-662b90c6-03b0-49f4-ba52-6b46dbc65207',
  'g7AcDupqIOtCPefWyhLo',
  '1234',
  true,
  true,
  'Original default account'
) ON CONFLICT (location_id) DO NOTHING;
