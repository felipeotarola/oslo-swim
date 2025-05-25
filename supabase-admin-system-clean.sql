-- Add admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create admin approval system for user_spots
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE user_spots ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create admin_actions table to track admin activities
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('approve_spot', 'reject_spot', 'edit_featured_spot', 'create_featured_spot')),
  target_id TEXT NOT NULL, -- spot ID that was acted upon
  target_type TEXT NOT NULL CHECK (target_type IN ('community_spot', 'featured_spot')),
  details JSONB, -- additional details about the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for admin actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- Enable RLS for admin_actions if not already enabled
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage featured spots" ON featured_spots;
DROP POLICY IF EXISTS "Admins can view all admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can create admin actions" ON admin_actions;

-- Update RLS policies for featured spots to allow admin access
CREATE POLICY "Admins can manage featured spots" ON featured_spots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create RLS policy for admin actions
CREATE POLICY "Admins can view all admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can create admin actions" ON admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS is_admin(TEXT);
DROP FUNCTION IF EXISTS approve_community_spot(TEXT, TEXT);
DROP FUNCTION IF EXISTS reject_community_spot(TEXT, TEXT, TEXT);

-- Function to check if user is admin (accepts TEXT and converts to UUID)
CREATE OR REPLACE FUNCTION is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Convert TEXT to UUID
  BEGIN
    user_uuid := user_id::UUID;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN false;
  END;
  
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve a community spot
CREATE OR REPLACE FUNCTION approve_community_spot(
  spot_id TEXT,
  admin_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_uuid UUID;
BEGIN
  -- Convert admin_id TEXT to UUID
  BEGIN
    admin_uuid := admin_id::UUID;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Invalid admin ID format';
  END;

  -- Check if user is admin
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;

  -- Update the spot status
  UPDATE user_spots 
  SET 
    status = 'approved',
    approved_by = admin_uuid,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = spot_id;

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spot not found or could not be updated';
  END IF;

  -- Log the admin action
  INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
  VALUES (admin_uuid, 'approve_spot', spot_id, 'community_spot', '{"action": "approved"}');

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a community spot
CREATE OR REPLACE FUNCTION reject_community_spot(
  spot_id TEXT,
  admin_id TEXT,
  rejection_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_uuid UUID;
BEGIN
  -- Convert admin_id TEXT to UUID
  BEGIN
    admin_uuid := admin_id::UUID;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Invalid admin ID format';
  END;

  -- Check if user is admin
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;

  -- Update the spot status
  UPDATE user_spots 
  SET 
    status = 'rejected',
    rejection_reason = rejection_reason,
    updated_at = NOW()
  WHERE id = spot_id;

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spot not found or could not be updated';
  END IF;

  -- Log the admin action
  INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
  VALUES (admin_uuid, 'reject_spot', spot_id, 'community_spot', 
          jsonb_build_object('action', 'rejected', 'reason', rejection_reason));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing view to avoid conflicts
DROP VIEW IF EXISTS pending_spots_admin;

-- Create a view for pending spots (admin use)
CREATE OR REPLACE VIEW pending_spots_admin AS
SELECT 
  us.*,
  p.name as submitter_name,
  p.profile_image_url as submitter_image
FROM user_spots us
LEFT JOIN profiles p ON us.user_id = p.id
WHERE us.status = 'pending'
ORDER BY us.created_at ASC;

-- Grant access to the view for admins
GRANT SELECT ON pending_spots_admin TO authenticated;

-- Example: Make the first user an admin (uncomment and update email as needed)
-- UPDATE profiles SET is_admin = true WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com' LIMIT 1
-- );
