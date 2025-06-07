"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    type: 'residential',
    area_sqft: '',
    price: '',
    status: 'for_rent',
    furnishing_status: 'unfurnished',
    bedrooms: '',
    bathrooms: '',
    description: '',
    owner_id: '',
    broker_id: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchProperty();
      fetchOwners();
      fetchBrokers();
    }
  }, [params.id]);

  async function fetchProperty() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_owners(owner_id),
          property_brokers(broker_id)
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip_code: data.zip_code || '',
          type: data.type || 'residential',
          area_sqft: data.area_sqft?.toString() || '',
          price: data.price?.toString() || '',
          status: data.status || 'for_rent',
          furnishing_status: data.furnishing_status || 'unfurnished',
          bedrooms: data.bedrooms?.toString() || '',
          bathrooms: data.bathrooms?.toString() || '',
          description: data.description || '',
          owner_id: data.property_owners?.[0]?.owner_id || '',
          broker_id: data.property_brokers?.[0]?.broker_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  }

  async function fetchOwners() {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('id, full_name, phone, email')
        .order('full_name');
      
      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  }

  async function fetchBrokers() {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('id, full_name, phone, email')
        .order('full_name');
      
      if (error) throw error;
      setBrokers(data || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Update the property
      const { error: propertyError } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          type: formData.type,
          address: formData.address,
          city: formData.city || '',
          state: formData.state,
          zip_code: formData.zip_code,
          area_sqft: parseInt(formData.area_sqft),
          price: parseFloat(formData.price),
          status: formData.status,
          furnishing_status: formData.furnishing_status,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          description: formData.description
        })
        .eq('id', params.id);

      if (propertyError) throw propertyError;

      // Update property-owner relationship
      if (formData.owner_id) {
        // Delete existing owner relationships
        await supabase
          .from('property_owners')
          .delete()
          .eq('property_id', params.id);

        // Create new owner relationship
        const { error: ownerError } = await supabase
          .from('property_owners')
          .insert([{
            property_id: params.id,
            owner_id: formData.owner_id,
            ownership_percentage: 100
          }]);

        if (ownerError) throw ownerError;
      } else {
        // If no owner selected, remove existing relationships
        await supabase
          .from('property_owners')
          .delete()
          .eq('property_id', params.id);
      }

      // Update property-broker relationship
      if (formData.broker_id) {
        // Delete existing broker relationships
        await supabase
          .from('property_brokers')
          .delete()
          .eq('property_id', params.id);

        // Create new broker relationship
        const { error: brokerError } = await supabase
          .from('property_brokers')
          .insert([{
            property_id: params.id,
            broker_id: formData.broker_id
          }]);

        if (brokerError) throw brokerError;
      } else {
        // If no broker selected, remove existing relationships
        await supabase
          .from('property_brokers')
          .delete()
          .eq('property_id', params.id);
      }

      router.push(`/dashboard/properties/${params.id}`);
    } catch (error: any) {
      console.error('Error updating property:', error);
      setError(error.message || 'Failed to update property');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/properties/${params.id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Property
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Property</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Property Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Property Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="for_rent">For Rent</option>
                  <option value="for_sale">For Sale</option>
                  <option value="rented">Rented</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
              
              <div>
                <label htmlFor="area_sqft" className="block text-sm font-medium text-gray-700">
                  Area (sq.ft.) *
                </label>
                <input
                  type="number"
                  id="area_sqft"
                  name="area_sqft"
                  required
                  min="1"
                  value={formData.area_sqft}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (Rs.) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {formData.type === 'residential' && (
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    min="0"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="furnishing_status" className="block text-sm font-medium text-gray-700">
                  Furnishing Status
                </label>
                <select
                  id="furnishing_status"
                  name="furnishing_status"
                  value={formData.furnishing_status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi_furnished">Semi Furnished</option>
                  <option value="furnished">Furnished</option>
                </select>
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">
                Owner
              </label>
              <select
                id="owner_id"
                name="owner_id"
                value={formData.owner_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select an owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name} ({owner.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="broker_id" className="block text-sm font-medium text-gray-700">
                Broker (Optional)
              </label>
              <select
                id="broker_id"
                name="broker_id"
                value={formData.broker_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a broker</option>
                {brokers.map((broker) => (
                  <option key={broker.id} value={broker.id}>
                    {broker.full_name} ({broker.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Additional details about the property..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/properties/${params.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}