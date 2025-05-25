-- This script focuses ONLY on fixing the UUID vs TEXT comparison issue

-- First, let's check the user_spots table structure to ensure approved_by is UUID
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_spots' AND column_name = 'approved_by';

-- Drop the problematic functions completely
DROP FUNCTION IF EXISTS is_admin(TEXT);
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS approve_community_spot(TEXT, TEXT);
DROP FUNCTION IF EXISTS approve_community_spot(TEXT, UUID);
DROP FUNCTION IF EXISTS reject_community_spot(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS reject_community_spot(TEXT, UUID, TEXT);

-- Create a simpler version of the approve function that avoids UUID/TEXT comparisons
CREATE OR REPLACE FUNCTION approve_community_spot(
  spot_id TEXT,
  admin_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct update without UUID conversion in the function
  UPDATE user_spots 
  SET 
    status = 'approved',
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = spot_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spot not found or could not be updated';
  END IF;
  
  -- Log action directly without UUID conversion
  INSERT INTO admin_actions (
    admin_id, 
    action_type, 
    target_id, 
    target_type, 
    details
  )
  VALUES (
    admin_id::uuid, 
    'approve_spot', 
    spot_id, 
    'community_spot', 
    '{"action": "approved"}'
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simpler version of the reject function that avoids UUID/TEXT comparisons
CREATE OR REPLACE FUNCTION reject_community_spot(
  spot_id TEXT,
  admin_id TEXT,
  rejection_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct update without UUID conversion in the function
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
  
  -- Log action directly without UUID conversion
  INSERT INTO admin_actions (
    admin_id, 
    action_type, 
    target_id, 
    target_type, 
    details
  )
  VALUES (
    admin_id::uuid, 
    'reject_spot', 
    spot_id, 
    'community_spot', 
    jsonb_build_object('action', 'rejected', 'reason', rejection_reason)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id::uuid AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
