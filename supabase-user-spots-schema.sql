-- Create user_spots table for community-submitted spots
CREATE TABLE IF NOT EXISTS user_spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- {lat: number, lng: number}
  main_image_url TEXT,
  additional_images TEXT[] DEFAULT '{}', -- Array of image URLs
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users ON DELETE SET NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS user_spots_user_id_idx ON user_spots(user_id);
CREATE INDEX IF NOT EXISTS user_spots_status_idx ON user_spots(status);
CREATE INDEX IF NOT EXISTS user_spots_created_at_idx ON user_spots(created_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE user_spots ENABLE ROW LEVEL SECURITY;

-- Create policies for user_spots
CREATE POLICY "Users can view their own spots" 
  ON user_spots FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spots" 
  ON user_spots FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending spots" 
  ON user_spots FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete their own pending spots" 
  ON user_spots FOR DELETE 
  USING (auth.uid() = user_id AND status = 'pending');

-- Policy for approved spots to be publicly viewable (for future use)
CREATE POLICY "Approved spots are publicly viewable" 
  ON user_spots FOR SELECT 
  USING (status = 'approved');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_spots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_spots_updated_at
  BEFORE UPDATE ON user_spots
  FOR EACH ROW EXECUTE FUNCTION update_user_spots_updated_at();
