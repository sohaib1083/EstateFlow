"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Owner {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  property_owners?: { count: number }[];
}

export default function OwnersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwners();
  }, []);

  async function fetchOwners() {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select(`
          *,
          property_owners(
            property_id,
            ownership_percentage,
            properties(
              id,
              title,
              status
            )
          )
        `)
        .order('full_name');

      if (error) throw error;

      const transformedData = data?.map(owner => ({
        ...owner,
        propertyCount: owner.property_owners?.length || 0,
        properties: owner.property_owners?.map((po: any) => po.properties) || []
      })) || [];

      setOwners(transformedData);
    } catch (error) {
      console.error('Error fetching owners:', error);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }
  const filteredOwners = owners.filter(owner => 
    owner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Owners</h1>
        <Link href="/dashboard/owners/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Add Owner
        </Link>
      </div>      
      
      <div className="mt-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search owners..."
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  {filteredOwners.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                      <p className="text-gray-500 mb-4">No owners found.</p>
                      <Link
                        href="/dashboard/owners/new"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add your first owner
                      </Link>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Information
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Properties
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOwners.map((owner) => (
                          <tr key={owner.id}>                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{owner.full_name}</div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{owner.phone}</div>
                            </td>                            
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {owner.property_owners?.length || 0} properties
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/dashboard/owners/${owner.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                View
                              </Link>
                              <Link href={`/dashboard/owners/${owner.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
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
