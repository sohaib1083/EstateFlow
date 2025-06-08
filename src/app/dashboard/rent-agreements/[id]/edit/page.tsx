"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EditRentAgreementPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreement, setAgreement] = useState<any>(null);
  
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

  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchAgreement();
      fetchProperties();
      fetchTenants();
      fetchOwners();
    }
  }, [params.id]);

  async function fetchAgreement() {
    try {
      const { data, error } = await supabase
        .from('rent_agreements')
        .select(`
          *,
          properties(
            id,
            title,
            address
          ),
          tenants(
            id,
            full_name,
            phone
          ),
          owners(
            id,
            full_name,
            phone
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      
      console.log('Fetched agreement data:', data);
      
      // Set the agreement data for display
      setAgreement(data);
      
      // Populate form data
      setFormData({
        property_id: data.property_id || '',
        tenant_id: data.tenant_id || '',
        owner_id: data.owner_id || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        monthly_rent: data.monthly_rent ? data.monthly_rent.toString() : '',
        security_deposit: data.security_deposit ? data.security_deposit.toString() : '',
        terms_conditions: data.terms_conditions || '',
        status: data.status || 'active'
      });
      
    } catch (error) {
      console.error('Error fetching rent agreement:', error);
      setError('Failed to load rent agreement data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProperties() {
    try {
      console.log('Fetching properties...');
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

      console.log('Properties data:', data);
      console.log('Properties error:', error);

      if (error) throw error;
      
      // Transform the data to make it easier to work with
      const transformedProperties = data?.map(property => ({
        ...property,
        // Get the primary owner (first one or highest percentage)
        primary_owner: property.property_owners?.[0]?.owners || null,
        primary_owner_id: property.property_owners?.[0]?.owner_id || null
      })) || [];

      setProperties(transformedProperties);
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

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    setFormData(prev => ({ ...prev, property_id: propertyId }));
    
    // Auto-select the primary owner for this property
    const selectedProperty = properties.find(p => p.id === propertyId);
    if (selectedProperty && selectedProperty.primary_owner_id) {
      setFormData(prev => ({ ...prev, owner_id: selectedProperty.primary_owner_id }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.property_id || !formData.tenant_id || !formData.owner_id || !formData.start_date || !formData.end_date || !formData.monthly_rent) {
        throw new Error('Please fill in all required fields');
      }

      const updateData = {
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

      const { error } = await supabase
        .from('rent_agreements')
        .update(updateData)
        .eq('id', params.id);

      if (error) throw error;

      router.push(`/dashboard/rent-agreements/${params.id}`);
    } catch (error: any) {
      console.error('Error updating rent agreement:', error);
      setError(error.message || 'Failed to update rent agreement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/rent-agreements/${params.id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Agreement
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Rent Agreement</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Current Agreement Info (Read-only) */}
          {agreement && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Current Agreement Details</h3>
              <div className="grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Property</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agreement.properties?.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Owner</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agreement.owners?.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tenant</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agreement.tenants?.full_name}</dd>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="property_id" className="block text-sm font-medium text-gray-700">
                Property <span className="text-red-500">*</span>
              </label>
              <select
                name="property_id"
                id="property_id"
                required
                value={formData.property_id}
                onChange={handlePropertyChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a property</option>
                {properties.length === 0 ? (
                  <option disabled>No properties available</option>
                ) : (
                  properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.address}
                      {property.primary_owner && ` (Owner: ${property.primary_owner.full_name})`}
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {properties.length} properties loaded
              </p>
            </div>

            <div>
              <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">
                Owner <span className="text-red-500">*</span>
              </label>
              <select
                name="owner_id"
                id="owner_id"
                required
                value={formData.owner_id}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select an owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name} - {owner.phone}
                  </option>
                ))}
              </select>
            </div>

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
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

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

          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/rent-agreements/${params.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}