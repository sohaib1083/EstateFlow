"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewRentAgreementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data lists
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  
  // Form toggles
  const [showNewTenant, setShowNewTenant] = useState(false);
  const [showNewOwner, setShowNewOwner] = useState(false);
  const [showNewProperty, setShowNewProperty] = useState(false);
  
  // Main form data
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    owner_id: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    securityDeposit: '',
    terms: ''
  });

  // New forms data - Fix field names to match schema
  const [newTenant, setNewTenant] = useState({
    full_name: '', // ✓ Correct - matches schema
    phone: '',     // ✓ Correct - matches schema
    email: '',     // ✓ Correct - matches schema
    address: ''    // ✓ Correct - matches schema
    // Remove id_number - it doesn't exist in your schema
  });

  const [newOwner, setNewOwner] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [newProperty, setNewProperty] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    type: 'residential',
    area_sqft: '',
    price: '',
    status: 'for_rent',
    bedrooms: '',
    bathrooms: ''
  });

  useEffect(() => {
    fetchProperties();
    fetchTenants();
    fetchOwners();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('status', ['for_rent', 'available'])
        .order('title');
      
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('full_name'); // ✓ Correct field name
      
      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewTenantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTenant(prev => ({ ...prev, [name]: value }));
  };

  const handleNewOwnerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewOwner(prev => ({ ...prev, [name]: value }));
  };

  const handleNewPropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({ ...prev, [name]: value }));
  };

  const createNewTenant = async () => {
    try {
      if (!newTenant.full_name || !newTenant.phone) {
        throw new Error('Please fill in tenant name and phone number.');
      }

      const { data, error } = await supabase
        .from('tenants')
        .insert([{
          full_name: newTenant.full_name,
          phone: newTenant.phone,
          email: newTenant.email || null,
          address: newTenant.address || null
          // Remove id_number field completely
        }])
        .select()
        .single();

      if (error) throw error;

      setTenants([...tenants, data]);
      setFormData({ ...formData, tenant_id: data.id });
      setNewTenant({ full_name: '', phone: '', email: '', address: '' }); // Remove id_number
      setShowNewTenant(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const createNewOwner = async () => {
    try {
      if (!newOwner.full_name || !newOwner.phone) {
        throw new Error('Please fill in owner name and phone number.');
      }

      const { data, error } = await supabase
        .from('owners')
        .insert([{
          full_name: newOwner.full_name,
          phone: newOwner.phone,
          email: newOwner.email || null,
          address: newOwner.address
        }])
        .select()
        .single();

      if (error) throw error;

      setOwners([...owners, data]);
      setFormData({ ...formData, owner_id: data.id });
      setNewOwner({ full_name: '', phone: '', email: '', address: '' });
      setShowNewOwner(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const createNewProperty = async () => {
    try {
      if (!newProperty.title || !newProperty.address || !newProperty.city || !newProperty.area_sqft || !newProperty.price) {
        throw new Error('Please fill in all required property fields.');
      }

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert([{
          title: newProperty.title,
          address: newProperty.address,
          city: newProperty.city,
          state: newProperty.state,
          type: newProperty.type,
          area_sqft: parseInt(newProperty.area_sqft),
          price: parseFloat(newProperty.price),
          status: newProperty.status,
          bedrooms: newProperty.bedrooms ? parseInt(newProperty.bedrooms) : null,
          bathrooms: newProperty.bathrooms ? parseInt(newProperty.bathrooms) : null
        }])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // DON'T create property-owner relationship here
      // It will be created later when the rent agreement form is submitted
      // The relationship should be created outside of this form flow

      setProperties([...properties, property]);
      setFormData({ ...formData, property_id: property.id });
      setNewProperty({
        title: '', address: '', city: '', state: '', type: 'residential',
        area_sqft: '', price: '', status: 'for_rent', bedrooms: '', bathrooms: ''
      });
      setShowNewProperty(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.property_id || !formData.tenant_id || !formData.startDate || !formData.endDate || !formData.rentAmount) {
        throw new Error('Please fill in all required fields');
      }

      console.log('Creating rent agreement with data:', formData);

      // Create the rent agreement
      const { data, error } = await supabase
        .from('rent_agreements')
        .insert([{
          property_id: formData.property_id,
          tenant_id: formData.tenant_id,
          start_date: formData.startDate,
          end_date: formData.endDate,
          monthly_rent: parseFloat(formData.rentAmount),
          security_deposit: parseFloat(formData.securityDeposit || '0'),
          terms_conditions: formData.terms,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Create property-owner relationship if owner is selected
      if (formData.owner_id) {
        console.log('Creating property-owner relationship...');
        
        const { error: ownerError } = await supabase
          .from('property_owners')
          .insert([{
            property_id: formData.property_id,
            owner_id: formData.owner_id,
            ownership_percentage: 100
          }]);

        if (ownerError) {
          console.error('Error creating owner relationship:', ownerError);
          // Don't throw - the agreement was created successfully
        }
      }

      // Update property status to rented
      const { error: statusError } = await supabase
        .from('properties')
        .update({ status: 'rented' })
        .eq('id', formData.property_id);

      if (statusError) {
        console.error('Error updating property status:', statusError);
      }

      router.push('/dashboard/rent-agreements');
    } catch (error: any) {
      console.error('Error creating rent agreement:', error);
      setError(error.message || 'Failed to create rent agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard/rent-agreements"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Rent Agreements
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Rent Agreement</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Property Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Property *</label>
              <button
                type="button"
                onClick={() => setShowNewProperty(!showNewProperty)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showNewProperty ? 'Cancel' : 'Add New Property'}
              </button>
            </div>
            
            {!showNewProperty ? (
              <select
                name="property_id"
                required
                value={formData.property_id}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a property...</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title} - {property.address} (Rs. {property.price?.toLocaleString()})
                  </option>
                ))}
              </select>
            ) : (
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <h4 className="text-md font-medium text-gray-900 mb-3">Add New Property</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={newProperty.title}
                      onChange={handleNewPropertyChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={newProperty.address}
                      onChange={handleNewPropertyChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={newProperty.city}
                      onChange={handleNewPropertyChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={newProperty.state}
                      onChange={handleNewPropertyChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Area (sq.ft.) *</label>
                    <input
                      type="number"
                      name="area_sqft"
                      required
                      value={newProperty.area_sqft}
                      onChange={handleNewPropertyChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Rent (Rs.) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      value={newProperty.price}
                      onChange={handleNewPropertyChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {newProperty.type === 'residential' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                        <input
                          type="number"
                          name="bedrooms"
                          value={newProperty.bedrooms}
                          onChange={handleNewPropertyChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                        <input
                          type="number"
                          name="bathrooms"
                          value={newProperty.bathrooms}
                          onChange={handleNewPropertyChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewProperty(false)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createNewProperty}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Add Property
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tenant Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Tenant *</label>
              <button
                type="button"
                onClick={() => setShowNewTenant(!showNewTenant)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showNewTenant ? 'Cancel' : 'Add New Tenant'}
              </button>
            </div>
            
            {!showNewTenant ? (
              <select
                name="tenant_id"
                required
                value={formData.tenant_id}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a tenant...</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.full_name} ({tenant.phone}) {/* ✓ Use full_name */}
                  </option>
                ))}
              </select>
            ) : (
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <h4 className="text-md font-medium text-gray-900 mb-3">Add New Tenant</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={newTenant.full_name}
                      onChange={handleNewTenantChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={newTenant.phone}
                      onChange={handleNewTenantChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newTenant.email}
                      onChange={handleNewTenantChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {/* Remove the ID Number field completely */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      rows={2}
                      value={newTenant.address}
                      onChange={handleNewTenantChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTenant(false)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createNewTenant}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Add Tenant
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Owner Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Property Owner</label>
              <button
                type="button"
                onClick={() => setShowNewOwner(!showNewOwner)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showNewOwner ? 'Cancel' : 'Add New Owner'}
              </button>
            </div>
            
            {!showNewOwner ? (
              <select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select an owner...</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name} ({owner.phone})
                  </option>
                ))}
              </select>
            ) : (
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <h4 className="text-md font-medium text-gray-900 mb-3">Add New Owner</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={newOwner.full_name}
                      onChange={handleNewOwnerChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={newOwner.phone}
                      onChange={handleNewOwnerChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newOwner.email}
                      onChange={handleNewOwnerChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      rows={2}
                      value={newOwner.address}
                      onChange={handleNewOwnerChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewOwner(false)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createNewOwner}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Add Owner
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Agreement Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700">
                Monthly Rent (Rs.) *
              </label>
              <input
                type="number"
                name="rentAmount"
                id="rentAmount"
                step="0.01"
                min="0"
                required
                value={formData.rentAmount}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700">
                Security Deposit (Rs.)
              </label>
              <input
                type="number"
                name="securityDeposit"
                id="securityDeposit"
                step="0.01"
                min="0"
                value={formData.securityDeposit}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
              Terms and Conditions
            </label>
            <textarea
              name="terms"
              id="terms"
              rows={4}
              value={formData.terms}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter terms and conditions for the rental agreement..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/rent-agreements"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
