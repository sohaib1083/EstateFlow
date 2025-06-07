"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBrokers();
  }, []);

  async function fetchBrokers() {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select(`
          *,
          property_brokers(
            properties(id, title)
          )
        `)
        .order('full_name');

      if (error) throw error;

      const transformedData = data?.map(broker => ({
        ...broker,
        propertyCount: broker.property_brokers?.length || 0
      })) || [];

      setBrokers(transformedData);
    } catch (error) {
      console.error('Error fetching brokers:', error);
      // Remove all demo data - just set empty array
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredBrokers = brokers.filter((broker) => {
    const matchesSearchTerm = searchTerm === '' || 
      broker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.phone.includes(searchTerm) ||
      (broker.email && broker.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (broker.agency_name && broker.agency_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearchTerm;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Brokers</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your real estate brokers and their information.
          </p>
        </div>
        <Link href="/dashboard/brokers/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Add Broker
        </Link>
      </div>

      <div className="mt-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search brokers by name, phone, email, or agency..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  {filteredBrokers.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No brokers found</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new broker.</p>
                      <div className="mt-6">
                        <Link
                          href="/dashboard/brokers/new"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Add Broker
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agency
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Properties
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBrokers.map((broker) => (
                          <tr key={broker.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{broker.full_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{broker.phone}</div>
                              {broker.email && (
                                <div className="text-sm text-gray-500">{broker.email}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{broker.agency_name || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {broker.propertyCount} properties
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/dashboard/brokers/${broker.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                View
                              </Link>
                              <Link href={`/dashboard/brokers/${broker.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
