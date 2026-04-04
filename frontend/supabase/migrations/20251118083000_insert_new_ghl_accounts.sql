INSERT INTO ghl_accounts (
  account_name,
  location_id,
  api_token,
  calendar_id,
  pipeline_id,
  is_active,
  is_default,
  notes
) VALUES
  (
    'Redefine Landscaping',
    'Oi9yTMwHr4mPJ55tJlys',
    'pit-b0569b12-4e88-4b15-9aec-9f8ea94c8732',
    'Q1tW4aVRlEP9lOMw0wD8',
    'VKRwXa8UNX3Whq4Uuw57',
    true,
    false,
    'Redefine Landscaping GHL Sub-Account'
  ),
  (
    'KD Fence Buffalo',
    'RfuFgmDJQhB4Cqk5rtGj',
    'pit-17863bc9-8b8c-4c69-8c7e-bfbdf2c8e7b1',
    'mQgdDBX4zO0wKyWTSizp',
    'jXqU2P63Xdxw5Mjg0uPO',
    true,
    false,
    'KD Fence Buffalo GHL Sub-Account'
  ),
  (
    'KD Tree Albany',
    'f1RJmkDw9d4dLy8OuGaf',
    'pit-13c5dab4-fcb6-4b7d-ba08-f50a27ac1f8d',
    '3dtVMiUKlKk3WOHj0RoO',
    'MIVZKIt4cszDvtoSU0rK',
    true,
    false,
    'KD Tree Albany GHL Sub-Account'
  ),
  (
    'KD Tree Rochester',
    'Hl4ooPfxIle2pPVWcfnL',
    'pit-bb16dd25-4a43-4fd3-90bb-9e05fe84d0ae',
    'DqWMSo8aO9xrlih8PNWT',
    'ggHDW3dZoe9ZIo29vr5o',
    true,
    false,
    'KD Tree Rochester GHL Sub-Account'
  )
ON CONFLICT (location_id) DO NOTHING;

UPDATE ghl_accounts
SET is_default = true
WHERE location_id = 'fRrcVKjOTccYItbX9inw'
  AND is_default = false;

UPDATE ghl_accounts
SET is_default = false
WHERE location_id != 'fRrcVKjOTccYItbX9inw'
  AND is_default = true;
