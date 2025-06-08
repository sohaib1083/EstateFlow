"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewRentAgreementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    owner_id: '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    security_deposit: '',
    terms_conditions: '',
    status: 'active'
  });

  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);

  useEffect(() => {
    fetchAllProperties();
    fetchTenants();
    fetchOwners();
  }, []);

  // Filter properties when owner changes
  useEffect(() => {
    if (formData.owner_id) {
      const ownerProperties = allProperties.filter(property => 
        property.property_owners?.some((po: any) => po.owner_id === formData.owner_id)
      );
      setFilteredProperties(ownerProperties);
      
      // Reset property selection if current property doesn't belong to selected owner
      const currentPropertyValid = ownerProperties.some(p => p.id === formData.property_id);
      if (!currentPropertyValid && formData.property_id) {
        setFormData(prev => ({ ...prev, property_id: '' }));
      }
    } else {
      setFilteredProperties(allProperties);
    }
  }, [formData.owner_id, allProperties]);

  async function fetchAllProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, 
          title, 
          address,
          property_owners(
            owner_id,
            ownership_percentage,
            owners(
              id,
              full_name
            )
          )
        `)
        .order('title');

      if (error) throw error;
      setAllProperties(data || []);
      setFilteredProperties(data || []); // Initially show all properties
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  }

  async function fetchTenants() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, full_name, phone')
        .order('full_name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  }

  async function fetchOwners() {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('id, full_name, phone')
        .order('full_name');

      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ownerId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      owner_id: ownerId,
      property_id: '' // Reset property when owner changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.property_id || !formData.tenant_id || !formData.owner_id || !formData.start_date || !formData.end_date || !formData.monthly_rent) {
        throw new Error('Please fill in all required fields');
      }

      const insertData = {
        property_id: formData.property_id,
        tenant_id: formData.tenant_id,
        owner_id: formData.owner_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        monthly_rent: parseFloat(formData.monthly_rent),
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : 0,
        terms_conditions: formData.terms_conditions,
        status: formData.status
      };

      const { data, error: supabaseError } = await supabase
        .from('rent_agreements')
        .insert([insertData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      router.push('/dashboard/rent-agreements');
    } catch (error: any) {
      console.error('Error creating rent agreement:', error);
      setError(error.message || 'Failed to create rent agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
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

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Rent Agreement</h1>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            {/* Owner Selection - First Priority */}
            <div className="sm:col-span-2">
              <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">
                Owner <span className="text-red-500">*</span>
              </label>
              <select
                name="owner_id"
                id="owner_id"
                required
                value={formData.owner_id}
                onChange={handleOwnerChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select an owner first</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name} - {owner.phone}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the owner first to see their properties
              </p>
            </div>

            {/* Property Selection - Filtered by Owner */}
            <div>
              <label htmlFor="property_id" className="block text-sm font-medium text-gray-700">
                Property <span className="text-red-500">*</span>
              </label>
              <select
                name="property_id"
                id="property_id"
                required
                value={formData.property_id}
                onChange={handleChange}
                disabled={!formData.owner_id}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.owner_id ? 'Select an owner first' : 'Select a property'}
                </option>
                {filteredProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title} - {property.address}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.owner_id 
                  ? `${filteredProperties.length} properties available for selected owner`
                  : 'Please select an owner first'
                }
              </p>
            </div>

            {/* Tenant Selection */}
            <div>
              <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700">
                Tenant <span className="text-red-500">*</span>
              </label>
              <select
                name="tenant_id"
                id="tenant_id"
                required
                value={formData.tenant_id}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.full_name} - {tenant.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Agreement Details */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                required
                value={formData.start_date}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                required
                value={formData.end_date}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700">
                Monthly Rent (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="monthly_rent"
                id="monthly_rent"
                required
                min="0"
                step="0.01"
                value={formData.monthly_rent}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter monthly rent amount"
              />
            </div>

            <div>
              <label htmlFor="security_deposit" className="block text-sm font-medium text-gray-700">
                Security Deposit (Rs.)
              </label>
              <input
                type="number"
                name="security_deposit"
                id="security_deposit"
                min="0"
                step="0.01"
                value={formData.security_deposit}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter security deposit amount"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                id="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="active">Active</option>
                <option value="pending_renewal">Pending Renewal</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="terms_conditions" className="block text-sm font-medium text-gray-700">
                Terms & Conditions
              </label>
              <textarea
                name="terms_conditions"
                id="terms_conditions"
                rows={6}
                value={formData.terms_conditions}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter terms and conditions for the rental agreement..."
              />
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
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
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
