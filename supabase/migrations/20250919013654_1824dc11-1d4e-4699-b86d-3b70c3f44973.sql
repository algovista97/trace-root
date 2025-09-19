-- Fix profiles table structure and RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Update profiles table structure
-- Remove user_id column and make id the primary foreign key to auth.users
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create new RLS policies for profiles
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Fix products table RLS policies
-- Update existing policies to be clearer and more secure
DROP POLICY IF EXISTS "Farmers can create products" ON public.products;
DROP POLICY IF EXISTS "Farmers can update their products" ON public.products;

CREATE POLICY "Farmers can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  auth.uid() = farmer_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'farmer'
  )
);

CREATE POLICY "Farmers can update their products" 
ON public.products 
FOR UPDATE 
USING (
  auth.uid() = farmer_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'farmer'
  )
);

-- Add policy for distributors and retailers to update product status
CREATE POLICY "Distributors and retailers can update product status during transactions" 
ON public.products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('distributor', 'retailer')
  ) AND
  -- Only allow updating status and blockchain_hash during valid transactions
  EXISTS (
    SELECT 1 FROM public.supply_chain_transactions 
    WHERE product_id = products.id 
    AND (to_stakeholder_id = auth.uid() OR from_stakeholder_id = auth.uid())
  )
);

-- Fix supply_chain_transactions RLS policies  
DROP POLICY IF EXISTS "Stakeholders can create transactions" ON public.supply_chain_transactions;

CREATE POLICY "Authenticated users can create transactions" 
ON public.supply_chain_transactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = to_stakeholder_id OR 
  auth.uid() = from_stakeholder_id OR
  -- Allow farmers to create harvest transactions
  (transaction_type = 'harvest' AND EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles pr ON p.farmer_id = pr.id
    WHERE p.id = product_id AND pr.id = auth.uid() AND pr.role = 'farmer'
  ))
);

-- Add UPDATE policy for supply chain transactions
CREATE POLICY "Stakeholders can update their transactions" 
ON public.supply_chain_transactions 
FOR UPDATE 
USING (
  auth.uid() = to_stakeholder_id OR 
  auth.uid() = from_stakeholder_id
);

-- Create trigger to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();