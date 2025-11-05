-- Fix for infinite recursion in RLS policies
-- Run this script to fix the existing policies in your database

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Cashiers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Cashiers can view all bills" ON water_bills;
DROP POLICY IF EXISTS "Cashiers can create bills" ON water_bills;
DROP POLICY IF EXISTS "Cashiers can update bills" ON water_bills;
DROP POLICY IF EXISTS "Cashiers can view all payments" ON payments;
DROP POLICY IF EXISTS "Cashiers can create payments" ON payments;
DROP POLICY IF EXISTS "Cashiers can update payments" ON payments;

-- Create function to safely check if user is cashier (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION is_cashier(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'cashier'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate policies using the helper function
CREATE POLICY "Cashiers can view all profiles"
  ON profiles FOR SELECT
  USING (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can view all bills"
  ON water_bills FOR SELECT
  USING (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can create bills"
  ON water_bills FOR INSERT
  WITH CHECK (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can update bills"
  ON water_bills FOR UPDATE
  USING (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can view all payments"
  ON payments FOR SELECT
  USING (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can create payments"
  ON payments FOR INSERT
  WITH CHECK (is_cashier(auth.uid()));

CREATE POLICY "Cashiers can update payments"
  ON payments FOR UPDATE
  USING (is_cashier(auth.uid()));

