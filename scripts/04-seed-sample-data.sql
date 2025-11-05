-- Seed Sample Data for Mutare City Council Payment Portal
-- Note: This script creates sample bills only. 
-- Users (customers and cashiers) should be created through the signup process in the app.

-- For testing purposes, you can create a test customer account by:
-- 1. Going to /signup in the app
-- 2. Creating an account with email: customer@mutare.co.zw, password: Test123!
-- 3. The system will automatically assign account number and create profile

-- For cashier accounts, you'll need to:
-- 1. Create a user through signup
-- 2. Manually update their role in the database to 'cashier'
-- Example: UPDATE profiles SET role = 'cashier' WHERE email = 'cashier@mutare.co.zw';

-- This script will create sample bills once you have a customer account
-- Replace the customer_id and account_number with actual values after creating a user

-- Example: After creating a customer account, run this to add sample bills:
/*
INSERT INTO water_bills (
  customer_id,
  account_number,
  billing_period,
  billing_month,
  previous_reading,
  current_reading,
  rate_per_unit,
  amount_due,
  due_date,
  status
)
VALUES 
  (
    'YOUR_USER_ID_HERE', -- Replace with actual user ID from profiles table
    'YOUR_ACCOUNT_NUMBER_HERE', -- Replace with actual account number
    'January 2025',
    '2025-01-01',
    1000.00,
    1150.00,
    2.50,
    375.00,
    '2025-01-31',
    'unpaid'
  );
*/

-- Create a function to generate account numbers automatically
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get the count of existing customer profiles
  SELECT COUNT(*) INTO counter FROM profiles WHERE role = 'customer';
  
  -- Generate account number in format MCC-YYYY-XXX
  new_number := 'MCC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((counter + 1)::TEXT, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to auto-generate account numbers for customers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, account_number, phone_number, address)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'customer' 
      THEN generate_account_number()
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
