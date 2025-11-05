-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES water_bills(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'bank_transfer')),
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  processed_by UUID REFERENCES profiles(id), -- Cashier who processed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Cashiers can view all payments"
  ON payments FOR SELECT
  USING (is_cashier(auth.uid()));

CREATE POLICY "Customers can create payments"
  ON payments FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Cashiers can create payments"
  ON payments FOR INSERT
  WITH CHECK (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can update payments"
  ON payments FOR UPDATE
  USING (is_cashier(auth.uid()));

-- Function to update bill payment status
CREATE OR REPLACE FUNCTION update_bill_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the water_bills table when payment is completed
  IF NEW.payment_status = 'completed' THEN
    UPDATE water_bills
    SET 
      amount_paid = COALESCE(amount_paid, 0) + NEW.amount,
      status = CASE
        WHEN (amount_due - (COALESCE(amount_paid, 0) + NEW.amount)) <= 0 THEN 'paid'
        WHEN (COALESCE(amount_paid, 0) + NEW.amount) > 0 THEN 'partial'
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = NEW.bill_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update bill status on payment
DROP TRIGGER IF EXISTS on_payment_completed ON payments;
CREATE TRIGGER on_payment_completed
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed')
  EXECUTE FUNCTION update_bill_payment_status();
