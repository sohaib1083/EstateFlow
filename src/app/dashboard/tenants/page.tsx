"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          rent_agreements(
            id,
            status,
            start_date,
            end_date,
            monthly_rent,
            properties(
              id,
              title,
              address
            )
          )
        `)
        .order('full_name');

      if (error) throw error;

      // Transform data to include active agreements count
      const transformedData = data?.map(tenant => ({
        ...tenant,
        activeAgreements: tenant.rent_agreements?.filter((agreement: any) => agreement.status === 'active').length || 0,
        totalAgreements: tenant.rent_agreements?.length || 0
      })) || [];

      setTenants(transformedData);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredTenants = tenants.filter(tenant => {
    const searchLower = searchTerm.toLowerCase();
    return tenant.full_name?.toLowerCase().includes(searchLower) || 
           tenant.phone?.toLowerCase().includes(searchLower) ||
           tenant.email?.toLowerCase().includes(searchLower);
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
          <h1 className="text-2xl font-semibold text-gray-900">Tenants</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage tenant information and rental agreements.
          </p>
        </div>
        <Link href="/dashboard/tenants/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Add Tenant
        </Link>
      </div>

      <div className="mt-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {filteredTenants.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {tenants.length === 0 
                        ? "Get started by adding your first tenant."
                        : "Try adjusting your search criteria."
                      }
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/dashboard/tenants/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add Tenant
                      </Link>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Active Agreements
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTenants.map((tenant) => (
                        <tr key={tenant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tenant.full_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{tenant.phone}</div>
                            {tenant.email && (
                              <div className="text-sm text-gray-500">{tenant.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {tenant.address || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {tenant.activeAgreements} active
                            </div>
                            <div className="text-sm text-gray-500">
                              {tenant.totalAgreements} total
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/dashboard/tenants/${tenant.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              View
                            </Link>
                            <Link href={`/dashboard/tenants/${tenant.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
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
      </div>
    </div>
  );
}
