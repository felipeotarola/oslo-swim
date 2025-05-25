-- Create featured_spots table for official Oslo bathing spots
CREATE TABLE IF NOT EXISTS featured_spots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  image_url TEXT NOT NULL,
  water_temperature INTEGER NOT NULL DEFAULT 18,
  water_quality TEXT NOT NULL DEFAULT 'Good' CHECK (water_quality IN ('Excellent', 'Good', 'Fair', 'Poor')),
  crowd_level TEXT NOT NULL DEFAULT 'Moderate' CHECK (crowd_level IN ('Low', 'Moderate', 'High')),
  party_level TEXT NOT NULL DEFAULT 'Chill' CHECK (party_level IN ('Quiet', 'Chill', 'Party-Friendly')),
  byob_friendly BOOLEAN NOT NULL DEFAULT false,
  sunset_views BOOLEAN NOT NULL DEFAULT false,
  last_updated TEXT NOT NULL,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  vibes TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_featured_spots_active_sort ON featured_spots (is_active, sort_order);

-- Insert the existing bathing spots data
INSERT INTO featured_spots (
  id, name, location, description, coordinates, image_url, 
  water_temperature, water_quality, crowd_level, party_level, 
  byob_friendly, sunset_views, last_updated, facilities, vibes, sort_order
) VALUES 
(
  'katten',
  'Katten',
  'Bygdøy, Oslo',
  'A hidden gem on Bygdøy peninsula, perfect for families and those seeking a quieter beach experience. Features a small kiosk, accessible paths, and parking facilities. Popular among locals who know about this peaceful spot with excellent water quality and beautiful natural surroundings.',
  '{"lat": 59.9025, "lon": 10.6847}',
  '/oslo-beach.png',
  19,
  'Excellent',
  'Low',
  'Chill',
  true,
  true,
  '2025-01-25',
  ARRAY['Kiosk', 'Parking', 'Accessible path', 'Restrooms', 'Picnic area'],
  ARRAY['Family-friendly', 'Local secret', 'Peaceful', 'Natural beauty'],
  1
),
(
  'sorenga',
  'Sørenga Sjøbad',
  'Sørenga, Oslo',
  'Modern urban beach in the heart of Oslo with stunning harbor views. Features floating platforms, diving boards, and excellent facilities. Popular spot for both swimming and socializing, especially during summer evenings.',
  '{"lat": 59.9075, "lon": 10.7589}',
  '/oslo-harbor-pool.png',
  18,
  'Good',
  'High',
  'Party-Friendly',
  true,
  false,
  '2025-01-25',
  ARRAY['Diving boards', 'Floating platforms', 'Showers', 'Changing rooms', 'Café'],
  ARRAY['Urban beach', 'Harbor views', 'Social hub', 'Modern facilities'],
  2
),
(
  'huk',
  'Huk',
  'Bygdøy, Oslo',
  'Classic Oslo beach destination with separate areas for different preferences. Known for its relaxed atmosphere, beautiful sunset views, and diverse crowd. Features both clothed and naturist sections.',
  '{"lat": 59.8967, "lon": 10.6758}',
  '/oslo-beach-cove.png',
  17,
  'Good',
  'Moderate',
  'Chill',
  true,
  true,
  '2025-01-25',
  ARRAY['Restrooms', 'Kiosk', 'Parking', 'Beach volleyball'],
  ARRAY['Sunset views', 'Diverse crowd', 'Classic Oslo', 'Relaxed'],
  3
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_featured_spots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_featured_spots_updated_at
  BEFORE UPDATE ON featured_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_spots_updated_at();

-- Enable RLS
ALTER TABLE featured_spots ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Featured spots are publicly readable" ON featured_spots
  FOR SELECT USING (is_active = true);

-- Policy for admin write access (you can adjust this based on your admin setup)
CREATE POLICY "Admins can manage featured spots" ON featured_spots
  FOR ALL USING (auth.role() = 'service_role');
