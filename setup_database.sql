-- ============================================================================
-- EstateFlow Database Setup Script
-- Run this script in your Supabase SQL Editor to set up all tables and policies
-- ============================================================================

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('residential', 'commercial')),
  address TEXT NOT NULL,
  city VARCHAR,
  state VARCHAR,
  zip_code VARCHAR,
  area_sqft DECIMAL,
  price DECIMAL NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('for_rent', 'for_sale', 'rented', 'sold')),
  furnishing_status VARCHAR CHECK (furnishing_status IN ('furnished', 'semi_furnished', 'unfurnished')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  description TEXT,
  owner_id UUID REFERENCES owners(id),
  broker_id UUID REFERENCES brokers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create owners table
CREATE TABLE IF NOT EXISTS owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR NOT NULL,
  address TEXT,
  pan_number VARCHAR,
  bank_name VARCHAR,
  account_number VARCHAR,
  ifsc_code VARCHAR,
  payment_method VARCHAR DEFAULT 'Bank Transfer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR NOT NULL,
  address TEXT,
  id_type VARCHAR DEFAULT 'Aadhar',
  id_number VARCHAR,
  emergency_contact VARCHAR,
  emergency_phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brokers table
CREATE TABLE IF NOT EXISTS brokers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR NOT NULL,
  agency_name VARCHAR NOT NULL,
  license_number VARCHAR,
  commission_rate DECIMAL DEFAULT 2.5,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rent_agreements table
CREATE TABLE IF NOT EXISTS rent_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL NOT NULL,
  security_deposit DECIMAL DEFAULT 0,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES rent_agreements(id),
  property_id UUID REFERENCES properties(id),
  tenant_id UUID REFERENCES tenants(id),
  amount DECIMAL NOT NULL,
  payment_date DATE NOT NULL,
  payment_type VARCHAR DEFAULT 'rent' CHECK (payment_type IN ('rent', 'security_deposit', 'maintenance', 'utility', 'other')),
  payment_method VARCHAR DEFAULT 'Bank Transfer',
  transaction_id VARCHAR,
  status VARCHAR DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to access all data
-- (In a production app, you would want more restrictive policies)

-- Properties policies
CREATE POLICY "Allow authenticated users to view properties" ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert properties" ON properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update properties" ON properties FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete properties" ON properties FOR DELETE TO authenticated USING (true);

-- Owners policies
CREATE POLICY "Allow authenticated users to view owners" ON owners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert owners" ON owners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update owners" ON owners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete owners" ON owners FOR DELETE TO authenticated USING (true);

-- Tenants policies
CREATE POLICY "Allow authenticated users to view tenants" ON tenants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert tenants" ON tenants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update tenants" ON tenants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete tenants" ON tenants FOR DELETE TO authenticated USING (true);

-- Brokers policies
CREATE POLICY "Allow authenticated users to view brokers" ON brokers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert brokers" ON brokers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update brokers" ON brokers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete brokers" ON brokers FOR DELETE TO authenticated USING (true);

-- Rent agreements policies
CREATE POLICY "Allow authenticated users to view rent_agreements" ON rent_agreements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert rent_agreements" ON rent_agreements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update rent_agreements" ON rent_agreements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete rent_agreements" ON rent_agreements FOR DELETE TO authenticated USING (true);

-- Payments policies
CREATE POLICY "Allow authenticated users to view payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update payments" ON payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete payments" ON payments FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- Indexes for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_broker_id ON properties(broker_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);

CREATE INDEX IF NOT EXISTS idx_rent_agreements_property_id ON rent_agreements(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_agreements_tenant_id ON rent_agreements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_agreements_status ON rent_agreements(status);

CREATE INDEX IF NOT EXISTS idx_payments_agreement_id ON payments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully! All tables and policies have been created.';
END $$;
