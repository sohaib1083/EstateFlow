"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RentAgreementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rentAgreements, setRentAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentAgreements();
  }, []);

  async function fetchRentAgreements() {
    try {
      const { data, error } = await supabase
        .from('rent_agreements')
        .select(`
          *,
          properties(title, address),
          tenants(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRentAgreements(data || []);
    } catch (error) {
      console.error('Error fetching rent agreements:', error);
      setRentAgreements([]);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredAgreements = rentAgreements.filter(agreement => {
    const searchLower = searchTerm.toLowerCase();
    const propertyTitle = agreement.properties?.title || '';
    const tenantName = agreement.tenants?.full_name || '';
    const status = agreement.status || '';
    
    return propertyTitle.toLowerCase().includes(searchLower) || 
           tenantName.toLowerCase().includes(searchLower) ||
           status.toLowerCase().includes(searchLower);
  });

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rent Agreements</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage rental agreements between tenants and properties.
          </p>
        </div>
        <Link href="/dashboard/rent-agreements/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Add Agreement
        </Link>
      </div>

      <div className="mt-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by property, tenant, or status..."
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {filteredAgreements.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No rent agreements found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {rentAgreements.length === 0 
                        ? "Get started by creating your first rent agreement."
                        : "Try adjusting your search criteria."
                      }
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/dashboard/rent-agreements/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Create Agreement
                      </Link>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tenant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly Rent
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
                      {filteredAgreements.map((agreement) => (
                        <tr key={agreement.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {agreement.properties?.title || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {agreement.properties?.address || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {agreement.tenants?.full_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {agreement.tenants?.phone || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {agreement.start_date} to {agreement.end_date}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(agreement.monthly_rent)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              agreement.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : agreement.status === 'expired'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {agreement.status?.charAt(0).toUpperCase() + agreement.status?.slice(1) || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/dashboard/rent-agreements/${agreement.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              View
                            </Link>
                            {agreement.status === 'active' && (
                              <Link href={`/dashboard/rent-agreements/${agreement.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                                Edit
                              </Link>
                            )}
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
      </div>
    </div>
  );
}
