-- Fix payment trigger to properly calculate bill status
-- This ensures bills are updated correctly when payments are made

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_payment_completed ON payments;

-- Improved function to update bill payment status
CREATE OR REPLACE FUNCTION update_bill_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  total_paid DECIMAL(10, 2);
  bill_amount_due DECIMAL(10, 2);
  new_status TEXT;
BEGIN
  -- Only process completed payments
  IF NEW.payment_status = 'completed' THEN
    -- Calculate total paid from all completed payments for this bill
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM payments
    WHERE bill_id = NEW.bill_id AND payment_status = 'completed';
    
    -- Get the bill's amount due
    SELECT amount_due INTO bill_amount_due
    FROM water_bills
    WHERE id = NEW.bill_id;
    
    -- Determine new status based on total paid vs amount due
    IF total_paid >= bill_amount_due THEN
      new_status := 'paid';
    ELSIF total_paid > 0 THEN
      new_status := 'partial';
    ELSE
      new_status := 'unpaid';
    END IF;
    
    -- Update the water_bills table
    UPDATE water_bills
    SET 
      amount_paid = total_paid,
      status = new_status,
      updated_at = NOW()
    WHERE id = NEW.bill_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_payment_completed
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed')
  EXECUTE FUNCTION update_bill_payment_status();

-- Also handle payment deletions (if a payment is deleted, recalculate)
CREATE OR REPLACE FUNCTION recalculate_bill_on_payment_delete()
RETURNS TRIGGER AS $$
DECLARE
  total_paid DECIMAL(10, 2);
  bill_amount_due DECIMAL(10, 2);
  new_status TEXT;
BEGIN
  -- Only process if the deleted payment was completed
  IF OLD.payment_status = 'completed' THEN
    -- Calculate total paid from remaining completed payments
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM payments
    WHERE bill_id = OLD.bill_id AND payment_status = 'completed';
    
    -- Get the bill's amount due
    SELECT amount_due INTO bill_amount_due
    FROM water_bills
    WHERE id = OLD.bill_id;
    
    -- Determine new status
    IF total_paid >= bill_amount_due THEN
      new_status := 'paid';
    ELSIF total_paid > 0 THEN
      new_status := 'partial';
    ELSE
      new_status := 'unpaid';
    END IF;
    
    -- Update the water_bills table
    UPDATE water_bills
    SET 
      amount_paid = total_paid,
      status = new_status,
      updated_at = NOW()
    WHERE id = OLD.bill_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for payment deletions
DROP TRIGGER IF EXISTS on_payment_deleted ON payments;
CREATE TRIGGER on_payment_deleted
  AFTER DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_bill_on_payment_delete();

