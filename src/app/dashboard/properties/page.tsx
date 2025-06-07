"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProperties();
    
    // Check for success message in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    if (success) {
      setSuccessMessage(decodeURIComponent(success));
      // Clear the URL parameter
      window.history.replaceState({}, '', '/dashboard/properties');
      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, []);  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_owners(
            owners(id, full_name, phone)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include owner information directly
      const transformedData = data?.map(property => ({
        ...property,
        owner: property.property_owners?.[0]?.owners || null, // Get the first owner
        owners: property.property_owners?.map((po: any) => po.owners) || [] // Add type annotation to po
      })) || [];
      
      setProperties(transformedData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearchTerm = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || property.type === filterType;
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    
    return matchesSearchTerm && matchesType && matchesStatus;
  });

  const renderStatus = (status: string) => {
    switch (status) {
      case 'for_rent':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">For Rent</span>;
      case 'for_sale':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">For Sale</span>;
      case 'rented':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Rented</span>;
      case 'sold':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Sold</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Property
        </Link>      </div>
      
      {successMessage && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setSuccessMessage('')}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by title or address..."
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              id="type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="for_rent">For Rent</option>
              <option value="for_sale">For Sale</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <p className="text-gray-500 mb-4">No properties found.</p>
                <Link
                  href="/dashboard/properties/new"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add your first property
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.map((property) => (
                      <tr key={property.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{property.address}</div>
                        </td>                        
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {property.owner ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{property.owner.full_name}</div>
                              <div className="text-sm text-gray-500">{property.owner.phone}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">No owner assigned</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{property.type}</div>
                          <div className="text-xs text-gray-500">
                            {property.type === 'residential' 
                              ? `${property.bedrooms} bed, ${property.bathrooms} bath`
                              : `${property.bathrooms} bathroom${property.bathrooms > 1 ? 's' : ''}`
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{property.area_sqft} sq.ft.</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(property.price)}</div>
                          <div className="text-xs text-gray-500">
                            {property.status.includes('rent') ? 'per month' : 'sale price'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatus(property.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/dashboard/properties/${property.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            View
                          </Link>
                          <Link href={`/dashboard/properties/${property.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
