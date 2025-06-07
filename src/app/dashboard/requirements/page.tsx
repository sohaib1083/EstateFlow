"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RequirementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchRequirements();
  }, []);

  async function fetchRequirements() {
    try {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .order('inquiry_date', { ascending: false });

      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
      setRequirements([]);
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

  const getDaysAgo = (date: string) => {
    const inquiryDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - inquiryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredRequirements = requirements.filter(requirement => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = requirement.customer_name?.toLowerCase().includes(searchLower) || 
                         requirement.customer_phone?.toLowerCase().includes(searchLower) ||
                         requirement.customer_email?.toLowerCase().includes(searchLower) ||
                         requirement.preferred_location?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || requirement.status === statusFilter;
    const matchesType = typeFilter === 'all' || requirement.requirement_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
          <h1 className="text-2xl font-semibold text-gray-900">Customer Requirements</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage customer property requirements and inquiries.
          </p>
        </div>
        <Link href="/dashboard/requirements/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Add Requirement
        </Link>
      </div>

      <div className="mt-4">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name, phone, email, or location..."
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md md:col-span-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="on_hold">On Hold</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="all">All Types</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                {filteredRequirements.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No requirements found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {requirements.length === 0 
                        ? "Get started by adding your first customer requirement."
                        : "Try adjusting your search criteria."
                      }
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/dashboard/requirements/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add Requirement
                      </Link>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requirement
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budget
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age
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
                      {filteredRequirements.map((requirement) => (
                        <tr key={requirement.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {requirement.customer_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {requirement.customer_phone}
                            </div>
                            {requirement.profession && (
                              <div className="text-xs text-gray-400">
                                {requirement.profession}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {requirement.requirement_type?.charAt(0).toUpperCase() + requirement.requirement_type?.slice(1)} - {requirement.property_type}
                            </div>
                            {requirement.area_preference && (
                              <div className="text-sm text-gray-500">
                                {requirement.area_preference}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {requirement.budget_min && requirement.budget_max
                                ? `${formatCurrency(requirement.budget_min)} - ${formatCurrency(requirement.budget_max)}`
                                : requirement.budget_min
                                ? `From ${formatCurrency(requirement.budget_min)}`
                                : requirement.budget_max
                                ? `Up to ${formatCurrency(requirement.budget_max)}`
                                : 'Not specified'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {requirement.preferred_location || 'Any'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getDaysAgo(requirement.inquiry_date)} days ago
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(requirement.inquiry_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              requirement.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : requirement.status === 'on_hold'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {requirement.status?.charAt(0).toUpperCase() + requirement.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/dashboard/requirements/${requirement.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                              View
                            </Link>
                            <Link href={`/dashboard/requirements/${requirement.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
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