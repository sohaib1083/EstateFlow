"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  async function fetchProperty() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_owners(
            ownership_percentage,
            owners(
              id,
              full_name,
              phone,
              email
            )
          ),
          property_brokers(
            brokers(
              id,
              full_name,
              phone,
              email
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;

      if (data) {
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'for_rent':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">For Rent</span>;
      case 'for_sale':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">For Sale</span>;
      case 'rented':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Rented</span>;
      case 'sold':
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Sold</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{status}</span>;
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

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Properties
          </Link>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Details
            </button>
            <Link
              href={`/dashboard/properties/${property.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit Property
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
            {renderStatus(property.status)}
          </div>
          <p className="text-gray-600 mt-1">{property.address}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Property Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{property.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Area</dt>
                  <dd className="text-sm text-gray-900">{property.area_sqft} sq.ft.</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="text-sm text-gray-900">
                    {formatCurrency(property.price)}
                    {property.status.includes('rent') && ' per month'}
                  </dd>
                </div>
                {property.bedrooms && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bedrooms</dt>
                    <dd className="text-sm text-gray-900">{property.bedrooms}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bathrooms</dt>
                  <dd className="text-sm text-gray-900">{property.bathrooms}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Furnishing</dt>
                  <dd className="text-sm text-gray-900 capitalize">{property.furnishing_status?.replace('_', ' ')}</dd>
                </div>
              </dl>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Owner(s)</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {property.property_owners && property.property_owners.length > 0 ? (
                    <div className="space-y-1">
                      {property.property_owners.map((po: any, index: number) => (
                        <div key={index}>
                          <Link 
                            href={`/dashboard/owners/${po.owners.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {po.owners.full_name}
                          </Link>
                          <span className="text-gray-500 ml-2">
                            ({po.ownership_percentage}% ownership)
                          </span>
                          <div className="text-xs text-gray-500">
                            {po.owners.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">No owner assigned</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Broker</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {property.property_brokers && property.property_brokers.length > 0 ? (
                    <div className="space-y-1">
                      {property.property_brokers.map((pb: any, index: number) => (
                        <div key={index}>
                          <Link 
                            href={`/dashboard/brokers/${pb.brokers.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {pb.brokers.full_name}
                          </Link>
                          <div className="text-xs text-gray-500">
                            {pb.brokers.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">No broker assigned</span>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{property.title}</h4>
                  <p className="text-gray-600">{property.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <span className="ml-2 text-sm text-gray-900 capitalize">{property.type}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="ml-2">{renderStatus(property.status)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Area:</span>
                    <span className="ml-2 text-sm text-gray-900">{property.area_sqft} sq.ft.</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Price:</span>
                    <span className="ml-2 text-sm text-gray-900">{formatCurrency(property.price)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                <Link
                  href={`/dashboard/properties/${property.id}/edit`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={() => setShowModal(false)}
                >
                  Edit Property
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
