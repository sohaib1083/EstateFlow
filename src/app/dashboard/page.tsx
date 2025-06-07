"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    totalOwners: 0,
    activeAgreements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [upcomingExpirations, setUpcomingExpirations] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch real data from Supabase
      const [propertiesRes, tenantsRes, ownersRes, agreementsRes] = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('tenants').select('*'),
        supabase.from('owners').select('*'),
        supabase.from('rent_agreements').select('*')
      ]);

      setStats({
        totalProperties: propertiesRes.data?.length || 0,
        totalTenants: tenantsRes.data?.length || 0,
        totalOwners: ownersRes.data?.length || 0,
        activeAgreements: agreementsRes.data?.filter(a => a.status === 'active').length || 0
      });

      // Fetch recent properties
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentProperties(properties || []);

      // Fetch recent payments
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          rent_agreements(
            properties(title),
            tenants(full_name)
          )
        `)
        .order('payment_date', { ascending: false })
        .limit(5);

      setRecentPayments(payments || []);

      // Fetch upcoming expirations
      const { data: expirations } = await supabase
        .from('rent_agreements')
        .select(`
          *,
          properties(title),
          tenants(full_name)
        `)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('end_date', { ascending: true })
        .limit(5);

      setUpcomingExpirations(expirations || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set all to empty arrays instead of dummy data
      setStats({
        totalProperties: 0,
        totalTenants: 0,
        totalOwners: 0,
        activeAgreements: 0
      });
      setRecentProperties([]);
      setRecentPayments([]);
      setUpcomingExpirations([]);
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

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="py-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalProperties}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Tenants</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalTenants}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Owners</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalOwners}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Agreements</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeAgreements}</dd>
            </div>
          </div>
        </div>
        
        {/* Upcoming Expirations */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Rent Agreement Expirations</h2>
          <div className="bg-white shadow rounded-lg">
            {upcomingExpirations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No upcoming expirations found.</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingExpirations.map((expiration) => {
                      const daysRemaining = calculateDaysRemaining(expiration.end_date);
                      return (
                        <tr key={expiration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {expiration.properties?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {expiration.tenants?.full_name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{expiration.end_date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              daysRemaining < 15
                                ? 'bg-red-100 text-red-800'
                                : daysRemaining < 30
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {daysRemaining} days
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/dashboard/rent-agreements/${expiration.id}`} className="text-indigo-600 hover:text-indigo-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Properties and Payments Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Properties</h2>
            {recentProperties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No properties found.</p>
                <Link
                  href="/dashboard/properties/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Property
                </Link>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {recentProperties.map((property) => (
                  <li key={property.id} className="py-3">
                    <Link href={`/dashboard/properties/${property.id}`} className="block hover:bg-gray-50">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{property.title}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.status === 'rented'
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'for_rent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {property.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <p className="text-sm text-gray-500">{property.type}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(property.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link href="/dashboard/properties" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all properties →
              </Link>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Rent Payments</h2>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No payments found.</p>
                <Link
                  href="/dashboard/payments/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Payment
                </Link>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {recentPayments.map((payment) => (
                  <li key={payment.id} className="py-3">
                    <Link href={`/dashboard/payments/${payment.id}`} className="block hover:bg-gray-50">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.rent_agreements?.tenants?.full_name || 'N/A'}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">
                          {payment.rent_agreements?.properties?.title || 'N/A'}
                        </p>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500">{payment.payment_date}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link href="/dashboard/payments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all payments →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
