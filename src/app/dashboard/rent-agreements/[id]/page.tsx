"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RentAgreementDetailPage() {
  const params = useParams();
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAgreement();
    }
  }, [params.id]);

  async function fetchAgreement() {
    try {
      const { data, error } = await supabase
        .from('rent_agreements')
        .select(`
          *,
          properties(
            id,
            title,
            address,
            city,
            state
          ),
          tenants(
            id,
            full_name,
            phone,
            email
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setAgreement(data);
    } catch (error) {
      console.error('Error fetching rent agreement:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (!agreement) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Rent Agreement not found</h3>
          <Link href="/dashboard/rent-agreements" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Back to Rent Agreements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard/rent-agreements"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Rent Agreements
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Rent Agreement - {agreement.properties?.title}
            </h1>
            <p className="text-sm text-gray-500">
              Created on {new Date(agreement.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(agreement.status)}`}>
              {agreement.status?.charAt(0).toUpperCase() + agreement.status?.slice(1)}
            </span>
            <Link
              href={`/dashboard/rent-agreements/${agreement.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Edit Agreement
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {/* Property Information */}
            <div className="sm:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Property</dt>
              <dd className="mt-1 text-sm text-gray-900">{agreement.properties?.title}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {agreement.properties?.address}, {agreement.properties?.city}, {agreement.properties?.state}
              </dd>
            </div>

            {/* Tenant Information */}
            <div className="sm:col-span-2 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tenant Information</h3>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Tenant Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{agreement.tenants?.full_name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div>{agreement.tenants?.phone}</div>
                {agreement.tenants?.email && (
                  <div className="text-gray-500">{agreement.tenants?.email}</div>
                )}
              </dd>
            </div>

            {/* Agreement Details */}
            <div className="sm:col-span-2 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agreement Details</h3>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(agreement.start_date).toLocaleDateString()}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">End Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(agreement.end_date).toLocaleDateString()}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Monthly Rent</dt>
              <dd className="mt-1 text-sm text-gray-900 font-semibold">
                {formatCurrency(agreement.monthly_rent)}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Security Deposit</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatCurrency(agreement.security_deposit || 0)}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(agreement.status)}`}>
                  {agreement.status?.charAt(0).toUpperCase() + agreement.status?.slice(1)}
                </span>
              </dd>
            </div>

            {/* Terms & Conditions */}
            {agreement.terms_conditions && (
              <div className="sm:col-span-2 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {agreement.terms_conditions}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}