-- listing_reports table for user reports
CREATE TABLE IF NOT EXISTS listing_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listing_reports_listing ON listing_reports(listing_id);
CREATE INDEX idx_listing_reports_status ON listing_reports(status);

-- RLS
ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a report"
  ON listing_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own reports"
  ON listing_reports FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage reports"
  ON listing_reports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));