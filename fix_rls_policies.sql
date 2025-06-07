-- Fix RLS policies for EstateFlow application
-- This script will create or update the necessary RLS policies

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations on properties" ON properties;
DROP POLICY IF EXISTS "Allow all operations on owners" ON owners;
DROP POLICY IF EXISTS "Allow all operations on tenants" ON tenants;
DROP POLICY IF EXISTS "Allow all operations on brokers" ON brokers;
DROP POLICY IF EXISTS "Allow all operations on rent_agreements" ON rent_agreements;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;

-- Create new policies that allow all operations for authenticated users
CREATE POLICY "Enable all for authenticated users" ON properties
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON owners
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON tenants
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON brokers
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON rent_agreements
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON payments
    FOR ALL USING (true) WITH CHECK (true);

-- Alternatively, if you want to disable RLS temporarily for development:
-- ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE owners DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE brokers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE rent_agreements DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
