-- Function to automatically update bill status to overdue when due date passes
-- This ensures bills are automatically marked as overdue

CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS void AS $$
BEGIN
  -- Update bills to overdue status if due date has passed and bill is not paid
  UPDATE water_bills
  SET 
    status = 'overdue',
    updated_at = NOW()
  WHERE 
    due_date < CURRENT_DATE
    AND status IN ('unpaid', 'partial')
    AND balance > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run daily (requires pg_cron extension)
-- Note: This requires pg_cron extension to be enabled in Supabase
-- If pg_cron is not available, you can call this function manually or via a cron service

-- Uncomment the following if pg_cron is available:
/*
SELECT cron.schedule(
  'update-overdue-bills',
  '0 0 * * *', -- Run daily at midnight
  $$SELECT update_overdue_bills();$$
);
*/

-- Alternative: Create a trigger that checks on bill updates
-- This will update status when bills are updated
CREATE OR REPLACE FUNCTION check_and_update_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if bill should be marked as overdue
  IF NEW.due_date < CURRENT_DATE 
     AND NEW.status IN ('unpaid', 'partial') 
     AND NEW.balance > 0 THEN
    NEW.status := 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check overdue status on update
DROP TRIGGER IF EXISTS check_overdue_on_update ON water_bills;
CREATE TRIGGER check_overdue_on_update
  BEFORE UPDATE ON water_bills
  FOR EACH ROW
  EXECUTE FUNCTION check_and_update_overdue_status();

-- Also update existing overdue bills
SELECT update_overdue_bills();

