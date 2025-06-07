-- Update properties table to add owner and broker relationships
-- This script adds foreign key columns to link properties with owners and brokers

-- Add owner_id and broker_id columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL;

-- Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_broker_id ON properties(broker_id);

-- Add some sample data for testing (optional)
-- You can uncomment these if you want some initial data

-- INSERT INTO owners (name, email, phone, address) VALUES 
-- ('John Smith', 'john.smith@email.com', '+91 9876543210', '123 Owner Street, Mumbai'),
-- ('Sarah Johnson', 'sarah.johnson@email.com', '+91 9876543211', '456 Property Lane, Delhi'),
-- ('Mike Wilson', 'mike.wilson@email.com', '+91 9876543212', '789 Real Estate Ave, Bangalore');

-- INSERT INTO brokers (name, email, phone, agency_name, license_number) VALUES 
-- ('Alex Real Estate', 'alex@realestate.com', '+91 9876543213', 'Prime Properties', 'RE12345'),
-- ('Maria Properties', 'maria@properties.com', '+91 9876543214', 'Elite Realty', 'RE12346'),
-- ('David Homes', 'david@homes.com', '+91 9876543215', 'Metro Real Estate', 'RE12347');
