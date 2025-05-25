-- First, let's check what the pending_spots_admin view is doing
-- The error is likely in this view where it's joining or comparing UUID with TEXT

-- Drop the problematic view
DROP VIEW IF EXISTS pending_spots_admin;

-- Recreate the view with proper type handling
CREATE VIEW pending_spots_admin AS
SELECT 
  us.id,
  us.user_id,
  us.title,
  us.address,
  us.description,
  us.coordinates,
  us.main_image_url,
  us.additional_images,
  us.status,
  us.created_at,
  us.updated_at,
  us.water_temperature,
  us.water_quality,
  us.crowd_level,
  us.party_level,
  us.byob_friendly,
  us.sunset_views,
  us.facilities,
  us.vibes,
  p.full_name as submitter_name,
  p.avatar_url as submitter_image
FROM user_spots us
LEFT JOIN profiles p ON p.id::text = us.user_id  -- Convert UUID to TEXT for comparison
WHERE us.status = 'pending';

-- Now fix the approve function to properly update the approved_by field
DROP FUNCTION IF EXISTS approve_community_spot(TEXT, TEXT);

CREATE OR REPLACE FUNCTION approve_community_spot(
  spot_id TEXT,
  admin_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the spot with proper UUID conversion for approved_by
  UPDATE user_spots 
  SET 
    status = 'approved',
    approved_by = admin_id::uuid,  -- Convert TEXT to UUID for the approved_by column
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = spot_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spot not found or could not be updated';
  END IF;
  
  -- Log the admin action
  INSERT INTO admin_actions (
    admin_id, 
    action_type, 
    target_id, 
    target_type, 
    details
  )
  VALUES (
    admin_id::uuid,  -- Convert TEXT to UUID for admin_actions table
    'approve_spot', 
    spot_id, 
    'community_spot', 
    jsonb_build_object('action', 'approved')
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also check if there are any RLS policies that might be causing the issue
-- Let's recreate them with proper type handling
DROP POLICY IF EXISTS "Users can view their own spots" ON user_spots;
DROP POLICY IF EXISTS "Users can insert their own spots" ON user_spots;
DROP POLICY IF EXISTS "Users can update their own spots" ON user_spots;
DROP POLICY IF EXISTS "Public can view approved spots" ON user_spots;

-- Recreate policies with explicit type conversions where needed
CREATE POLICY "Users can view their own spots" ON user_spots
  FOR SELECT USING (auth.uid()::text = user_id OR status = 'approved');

CREATE POLICY "Users can insert their own spots" ON user_spots
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own spots" ON user_spots
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Public can view approved spots" ON user_spots
  FOR SELECT USING (status = 'approved');
