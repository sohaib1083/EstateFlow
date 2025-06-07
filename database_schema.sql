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
  agency_name VARCHAR,
  license_number VARCHAR,
  commission_rate DECIMAL DEFAULT 2.5,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rent_agreements table
CREATE TABLE IF NOT EXISTS rent_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount DECIMAL NOT NULL,
  security_deposit DECIMAL NOT NULL,
  maintenance_fee DECIMAL DEFAULT 0,
  payment_frequency VARCHAR DEFAULT 'Monthly',
  payment_due_day INTEGER DEFAULT 5,
  broker_fee DECIMAL DEFAULT 0,
  terms TEXT,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES rent_agreements(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR NOT NULL,
  transaction_reference VARCHAR,
  late_fee DECIMAL DEFAULT 0,
  notes TEXT,
  status VARCHAR DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_rent_agreements_property_id ON rent_agreements(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_agreements_tenant_id ON rent_agreements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_agreements_status ON rent_agreements(status);
CREATE INDEX IF NOT EXISTS idx_payments_agreement_id ON payments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict later)
CREATE POLICY "Allow all operations on properties" ON properties FOR ALL USING (true);
CREATE POLICY "Allow all operations on owners" ON owners FOR ALL USING (true);
CREATE POLICY "Allow all operations on tenants" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow all operations on brokers" ON brokers FOR ALL USING (true);
CREATE POLICY "Allow all operations on rent_agreements" ON rent_agreements FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
