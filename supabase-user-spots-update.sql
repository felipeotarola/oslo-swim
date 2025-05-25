-- Add additional fields to user_spots table to match BathingSpot interface
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS water_temperature NUMERIC(4,1) DEFAULT 18.0;
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS water_quality TEXT DEFAULT 'Good' CHECK (water_quality IN ('Excellent', 'Good', 'Fair', 'Poor'));
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS crowd_level TEXT DEFAULT 'Moderate' CHECK (crowd_level IN ('Low', 'Moderate', 'High'));
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS party_level TEXT DEFAULT 'Chill' CHECK (party_level IN ('Quiet', 'Chill', 'Party-Friendly'));
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS byob_friendly BOOLEAN DEFAULT false;
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS sunset_views BOOLEAN DEFAULT false;
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS facilities TEXT[] DEFAULT '{}';
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS vibes TEXT[] DEFAULT '{}';
