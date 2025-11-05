-- Create water_bills table
CREATE TABLE IF NOT EXISTS water_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  billing_period TEXT NOT NULL, -- e.g., "January 2025"
  billing_month DATE NOT NULL,
  previous_reading DECIMAL(10, 2) NOT NULL DEFAULT 0,
  current_reading DECIMAL(10, 2) NOT NULL,
  consumption DECIMAL(10, 2) GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  rate_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 2.50,
  amount_due DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) GENERATED ALWAYS AS (amount_due - COALESCE(amount_paid, 0)) STORED,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_water_bills_customer_id ON water_bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_water_bills_status ON water_bills(status);
CREATE INDEX IF NOT EXISTS idx_water_bills_billing_month ON water_bills(billing_month);

-- Enable RLS
ALTER TABLE water_bills ENABLE ROW LEVEL SECURITY;

-- Policies for water_bills
CREATE POLICY "Customers can view own bills"
  ON water_bills FOR SELECT
  USING (
    customer_id = auth.uid()
  );

CREATE POLICY "Cashiers can view all bills"
  ON water_bills FOR SELECT
  USING (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can create bills"
  ON water_bills FOR INSERT
  WITH CHECK (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can update bills"
  ON water_bills FOR UPDATE
  USING (is_cashier(auth.uid()));
