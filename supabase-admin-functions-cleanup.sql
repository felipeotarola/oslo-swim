-- Drop ALL existing versions of the functions to avoid conflicts
DROP FUNCTION IF EXISTS is_admin(TEXT);
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS approve_community_spot(TEXT, TEXT);
DROP FUNCTION IF EXISTS approve_community_spot(TEXT, UUID);
DROP FUNCTION IF EXISTS reject_community_spot(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS reject_community_spot(TEXT, UUID, TEXT);

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

-- Function to approve a community spot (TEXT parameters only)
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
    RAISE EXCEPTION 'Invalid admin ID format: %', admin_id;
  END;

  -- Check if user is admin
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'User % is not an admin', admin_id;
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
    RAISE EXCEPTION 'Spot % not found or could not be updated', spot_id;
  END IF;

  -- Log the admin action
  INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
  VALUES (admin_uuid, 'approve_spot', spot_id, 'community_spot', '{"action": "approved"}');

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a community spot (TEXT parameters only)
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
    RAISE EXCEPTION 'Invalid admin ID format: %', admin_id;
  END;

  -- Check if user is admin
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'User % is not an admin', admin_id;
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
    RAISE EXCEPTION 'Spot % not found or could not be updated', spot_id;
  END IF;

  -- Log the admin action
  INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
  VALUES (admin_uuid, 'reject_spot', spot_id, 'community_spot', 
          jsonb_build_object('action', 'rejected', 'reason', rejection_reason));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
