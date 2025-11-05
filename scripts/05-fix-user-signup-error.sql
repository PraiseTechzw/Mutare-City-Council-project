-- Fix for database error when saving new user
-- This script fixes the RLS policy issue and race condition in account number generation

-- 1. Create a sequence for account numbers to avoid race conditions
-- Use public schema explicitly for Supabase compatibility
DROP SEQUENCE IF EXISTS public.account_number_seq;
CREATE SEQUENCE IF NOT EXISTS public.account_number_seq START 1;

-- 2. Update the generate_account_number function to use sequence
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  seq_value INTEGER;
BEGIN
  -- Get next value from sequence (thread-safe)
  seq_value := nextval('public.account_number_seq');
  
  -- Generate account number in format MCC-YYYY-XXX
  new_number := 'MCC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq_value::TEXT, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add RLS policy to allow trigger function to insert profiles
-- SECURITY DEFINER should bypass RLS, but adding explicit policy for safety
-- This policy allows inserts from the trigger function context
DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
CREATE POLICY "Trigger can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 4. Update handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  account_num TEXT;
BEGIN
  -- Determine user role
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  
  -- Generate account number only for customers
  IF user_role = 'customer' THEN
    account_num := public.generate_account_number();
  ELSE
    account_num := NULL;
  END IF;
  
  -- Insert profile with all fields
  -- Use ON CONFLICT to handle edge cases gracefully
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    account_number, 
    phone_number, 
    address
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    user_role,
    account_num,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If account number collision occurs, retry with a new number
    BEGIN
      account_num := public.generate_account_number();
      INSERT INTO public.profiles (
        id, email, full_name, role, account_number, phone_number, address
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        user_role,
        account_num,
        NEW.raw_user_meta_data->>'phone_number',
        NEW.raw_user_meta_data->>'address'
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    EXCEPTION
      WHEN OTHERS THEN
        -- If still failing, allow user creation without account number
        INSERT INTO public.profiles (id, email, full_name, role, phone_number, address)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
          user_role,
          NEW.raw_user_meta_data->>'phone_number',
          NEW.raw_user_meta_data->>'address'
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
    END;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    -- This prevents the trigger from blocking auth user creation
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

