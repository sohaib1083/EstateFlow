"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Owner {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
}

interface Broker {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  agency_name?: string;
  agency_address?: string;
}

export default function NewProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [showNewOwnerForm, setShowNewOwnerForm] = useState(false);
  const [showNewBrokerForm, setShowNewBrokerForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'residential',
    address: '',
    city: '',
    state: '',
    zip_code: '',
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

  // New owner form data
  const [newOwnerData, setNewOwnerData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  // New broker form data
  const [newBrokerData, setNewBrokerData] = useState({
    full_name: '',
    phone: '',
    email: '',
    agency_name: '',
    agency_address: ''
  });

  // Fetch owners and brokers on component mount
  useEffect(() => {
    fetchOwners();
    fetchBrokers();
  }, []);

  const fetchOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('id, full_name, email, phone')
        .order('full_name');
      
      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchBrokers = async () => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('id, full_name, phone, email, agency_name, agency_address')
        .order('full_name');
      
      if (error) throw error;
      setBrokers(data || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNewOwnerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewOwnerData({
      ...newOwnerData,
      [name]: value
    });
  };

  const handleNewBrokerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBrokerData({
      ...newBrokerData,
      [name]: value
    });
  };
  const createNewOwner = async () => {
    try {
      if (!newOwnerData.full_name || !newOwnerData.phone) {
        throw new Error('Please fill in owner name and phone number.');
      }

      const { data, error } = await supabase
        .from('owners')
        .insert([{
          full_name: newOwnerData.full_name,
          phone: newOwnerData.phone,
          email: newOwnerData.email || null,
          address: newOwnerData.address
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to owners list and select it
      setOwners([...owners, data]);
      setFormData({ ...formData, owner_id: data.id });
      
      // Reset form and hide it
      setNewOwnerData({
        full_name: '',
        email: '',
        phone: '',
        address: ''
      });
      setShowNewOwnerForm(false);

      return data;
    } catch (error: any) {
      setError(error.message || 'Failed to create owner');
      throw error;
    }
  };
  const createNewBroker = async () => {
    try {
      if (!newBrokerData.full_name || !newBrokerData.phone) {
        throw new Error('Please fill in broker name and phone number.');
      }

      const { data, error } = await supabase
        .from('brokers')
        .insert([{
          full_name: newBrokerData.full_name,
          phone: newBrokerData.phone,
          email: newBrokerData.email || null,
          agency_name: newBrokerData.agency_name || null,
          agency_address: newBrokerData.agency_address || null
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to brokers list and select it
      setBrokers([...brokers, data]);
      setFormData({ ...formData, broker_id: data.id });
      
      // Reset form and hide it
      setNewBrokerData({
        full_name: '',
        phone: '',
        email: '',
        agency_name: '',
        agency_address: ''
      });
      setShowNewBrokerForm(false);

      return data;
    } catch (error: any) {
      setError(error.message || 'Failed to create broker');
      throw error;
    }
  };const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the property first
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert([{
          title: formData.title,
          type: formData.type,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          area_sqft: parseInt(formData.area_sqft),
          price: parseFloat(formData.price),
          status: formData.status,
          furnishing_status: formData.furnishing_status,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          description: formData.description
        }])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Create property-owner relationship if owner is selected
      if (formData.owner_id) {
        const { error: ownerError } = await supabase
          .from('property_owners')
          .insert([{
            property_id: property.id,
            owner_id: formData.owner_id,
            ownership_percentage: 100
          }]);

        if (ownerError) {
          console.error('Error creating owner relationship:', ownerError);
          throw ownerError;
        }
      }

      // Create property-broker relationship if broker is selected
      if (formData.broker_id) {
        const { error: brokerError } = await supabase
          .from('property_brokers')
          .insert([{
            property_id: property.id,
            broker_id: formData.broker_id
          }]);

        if (brokerError) {
          console.error('Error creating broker relationship:', brokerError);
          throw brokerError;
        }
      }

      router.push('/dashboard/properties');
    } catch (error: any) {
      console.error('Error creating property:', error);
      setError(error.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Property</h1>
        <Link
          href="/dashboard/properties"
          className="text-indigo-600 hover:text-indigo-900"
        >
          Back to Properties
        </Link>
      </div>
      
      <div className="mt-4 bg-white shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                id="address"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip_code"
                  id="zip_code"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={formData.zip_code}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="area_sqft" className="block text-sm font-medium text-gray-700">
                Area (sq. ft.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="area_sqft"
                id="area_sqft"
                min="1"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.area_sqft}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                id="price"
                min="0"
                step="0.01"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.status.includes('rent') ? 'Rent per month' : 'Sale price'}
              </p>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="for_rent">For Rent</option>
                <option value="for_sale">For Sale</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="furnishing_status" className="block text-sm font-medium text-gray-700">
                Furnishing Status
              </label>
              <select
                id="furnishing_status"
                name="furnishing_status"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.furnishing_status}
                onChange={handleChange}
              >
                <option value="furnished">Furnished</option>
                <option value="semi_furnished">Semi-Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
            
            {formData.type === 'residential' && (
              <>
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    id="bedrooms"
                    min="0"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={formData.bedrooms}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                id="bathrooms"
                min="0"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.bathrooms}
                onChange={handleChange}
              />
            </div>
              <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Owner Selection */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Property Owner</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">
                      Select Owner
                    </label>
                    <div className="mt-1 flex">
                      <select
                        id="owner_id"
                        name="owner_id"
                        className="flex-1 py-2 px-3 border border-gray-300 bg-white rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.owner_id}
                        onChange={handleChange}
                        disabled={showNewOwnerForm}
                      >
                        <option value="">Select an owner...</option>
                        {owners.map((owner) => (
                          <option key={owner.id} value={owner.id}>
                            {owner.full_name} ({owner.phone})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewOwnerForm(!showNewOwnerForm)}
                        className="px-4 py-2 border-l-0 border border-gray-300 bg-gray-100 text-gray-700 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        {showNewOwnerForm ? 'Cancel' : 'New Owner'}
                      </button>
                    </div>
                  </div>

                  {/* New Owner Form */}
                  {showNewOwnerForm && (
                    <div className="border border-gray-200 rounded-md p-4 bg-white">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Create New Owner</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newOwnerData.full_name}
                            onChange={handleNewOwnerChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newOwnerData.phone}
                            onChange={handleNewOwnerChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newOwnerData.email}
                            onChange={handleNewOwnerChange}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newOwnerData.address}
                            onChange={handleNewOwnerChange}
                          />
                        </div>
                      </div>
                      
                      {/* Add the action buttons */}
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewOwnerForm(false);
                            setNewOwnerData({
                              full_name: '',
                              email: '',
                              phone: '',
                              address: ''
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={createNewOwner}
                          disabled={!newOwnerData.full_name || !newOwnerData.phone}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Create Owner
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Broker Selection */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Property Broker (Optional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="broker_id" className="block text-sm font-medium text-gray-700">
                      Select Broker
                    </label>
                    <div className="mt-1 flex">
                      <select
                        id="broker_id"
                        name="broker_id"
                        className="flex-1 py-2 px-3 border border-gray-300 bg-white rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.broker_id}
                        onChange={handleChange}
                        disabled={showNewBrokerForm}
                      >
                        <option value="">Select a broker...</option>
                        {brokers.map((broker) => (
                          <option key={broker.id} value={broker.id}>
                            {broker.full_name} ({broker.phone})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewBrokerForm(!showNewBrokerForm)}
                        className="px-4 py-2 border-l-0 border border-gray-300 bg-gray-100 text-gray-700 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        {showNewBrokerForm ? 'Cancel' : 'New Broker'}
                      </button>
                    </div>
                  </div>

                  {/* New Broker Form */}
                  {showNewBrokerForm && (
                    <div className="border border-gray-200 rounded-md p-4 bg-white">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Create New Broker</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBrokerData.full_name}
                            onChange={handleNewBrokerChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBrokerData.phone}
                            onChange={handleNewBrokerChange}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBrokerData.email}
                            onChange={handleNewBrokerChange}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Agency Name
                          </label>
                          <input
                            type="text"
                            name="agency_name"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBrokerData.agency_name}
                            onChange={handleNewBrokerChange}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Agency Address
                          </label>
                          <textarea
                            name="agency_address"
                            rows={2}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBrokerData.agency_address}
                            onChange={handleNewBrokerChange}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      
                      {/* Add the action buttons for broker too */}
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewBrokerForm(false);
                            setNewBrokerData({
                              full_name: '',
                              phone: '',
                              email: '',
                              agency_name: '',
                              agency_address: ''
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={createNewBroker}
                          disabled={!newBrokerData.full_name || !newBrokerData.phone}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Create Broker
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link
              href="/dashboard/properties"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Saving...' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
