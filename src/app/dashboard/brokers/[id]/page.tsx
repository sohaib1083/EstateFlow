"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function BrokerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [broker, setBroker] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBroker();
      fetchBrokerProperties();
    }
  }, [params.id]);

  async function fetchBroker() {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching broker:', error);
        throw error;
      }

      if (data) {
        setBroker(data);
      }
    } catch (error) {
      console.error('Error fetching broker:', error);
      // Handle demo data
      if (typeof params.id === 'string' && params.id.startsWith('demo-')) {
        const demoBrokers = {
          'demo-1': { id: 'demo-1', full_name: 'Ahmed Khan', phone: '+92 321 1234567', email: 'ahmed@realty.com', agency_name: 'Prime Realty', agency_address: '123 Business Street, Karachi' },
          'demo-2': { id: 'demo-2', full_name: 'Sara Ali', phone: '+92 300 9876543', email: 'sara@estate.com', agency_name: 'City Estate', agency_address: '456 Commercial Avenue, Lahore' }
        };
        const demoBroker = demoBrokers[params.id as keyof typeof demoBrokers];
        if (demoBroker) {
          setBroker(demoBroker);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchBrokerProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_brokers!inner(broker_id)
        `)
        .eq('property_brokers.broker_id', params.id);

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Broker Not Found</h2>
          <p className="text-gray-600 mb-4">The broker you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/brokers"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Brokers
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
            href="/dashboard/brokers"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Brokers
          </Link>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Details
            </button>
            <Link
              href={`/dashboard/brokers/${broker.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit Broker
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broker Information */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Broker Information</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{broker.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{broker.phone}</dd>
                </div>
                {broker.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{broker.email}</dd>
                  </div>
                )}
                {broker.agency_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Agency Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{broker.agency_name}</dd>
                  </div>
                )}
                {broker.agency_address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Agency Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{broker.agency_address}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Properties</dt>
                  <dd className="mt-1 text-sm text-gray-900">{properties.length} properties</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Properties ({properties.length})</h2>
            </div>
            <div className="p-6">
              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No properties found for this broker.</p>
                  <Link
                    href="/dashboard/properties/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Property
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              {property.type === 'residential' 
                                ? `${property.bedrooms} bed, ${property.bathrooms} bath`
                                : `${property.bathrooms} bathroom${property.bathrooms > 1 ? 's' : ''}`
                              }
                            </span>
                            <span className="text-sm text-gray-500">{property.area_sqft} sq.ft.</span>
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(property.price)}</span>
                            {renderStatus(property.status)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/properties/${property.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View
                          </Link>
                          <Link
                            href={`/dashboard/properties/${property.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Broker Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <span className="ml-2 text-sm text-gray-900">{broker.full_name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone:</span>
                  <span className="ml-2 text-sm text-gray-900">{broker.phone}</span>
                </div>
                {broker.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <span className="ml-2 text-sm text-gray-900">{broker.email}</span>
                  </div>
                )}
                {broker.agency_name && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Agency:</span>
                    <span className="ml-2 text-sm text-gray-900">{broker.agency_name}</span>
                  </div>
                )}
                {broker.agency_address && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Agency Address:</span>
                    <span className="ml-2 text-sm text-gray-900">{broker.agency_address}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Properties:</span>
                  <span className="ml-2 text-sm text-gray-900">{properties.length} properties</span>
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
                  href={`/dashboard/brokers/${broker.id}/edit`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={() => setShowModal(false)}
                >
                  Edit Broker
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}