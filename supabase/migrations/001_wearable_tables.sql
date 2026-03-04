-- ============================================================
-- Table: wearable_connections
-- Tracks which health provider each user has connected via Terra
-- ============================================================
CREATE TABLE IF NOT EXISTS wearable_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  terra_user_id TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  device_names TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable connections"
  ON wearable_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wearable connections"
  ON wearable_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wearable connections"
  ON wearable_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wearable connections"
  ON wearable_connections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Table: wearable_data
-- Stores daily health metric snapshots from Terra SDK
-- data_type: 'hrv' | 'rhr' | 'sleep' | 'menstruation'
-- payload: JSONB with type-specific fields
-- ============================================================
CREATE TABLE IF NOT EXISTS wearable_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  recorded_at DATE NOT NULL,
  provider TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, data_type, recorded_at)
);

ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable data"
  ON wearable_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wearable data"
  ON wearable_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wearable data"
  ON wearable_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_wearable_data_user_type_date
  ON wearable_data(user_id, data_type, recorded_at DESC);

-- ============================================================
-- Triggers for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wearable_connections_updated_at
  BEFORE UPDATE ON wearable_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wearable_data_updated_at
  BEFORE UPDATE ON wearable_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
