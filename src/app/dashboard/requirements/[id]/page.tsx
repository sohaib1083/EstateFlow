"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RequirementDetailPage() {
  const params = useParams();
  const [requirement, setRequirement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchRequirement();
    }
  }, [params.id]);

  async function fetchRequirement() {
    try {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setRequirement(data);
    } catch (error) {
      console.error('Error fetching requirement:', error);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Requirement not found</h3>
          <Link href="/dashboard/requirements" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Back to Requirements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard/requirements"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Requirements
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{requirement.customer_name}</h1>
            <p className="text-sm text-gray-500">
              {getDaysAgo(requirement.inquiry_date)} days ago • {new Date(requirement.inquiry_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              requirement.status === 'open'
                ? 'bg-green-100 text-green-800'
                : requirement.status === 'on_hold'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {requirement.status?.charAt(0).toUpperCase() + requirement.status?.slice(1)}
            </span>
            <Link
              href={`/dashboard/requirements/${requirement.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Edit Requirement
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {/* Customer Information */}
            <div className="sm:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{requirement.customer_name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={`tel:${requirement.customer_phone}`} className="text-indigo-600 hover:text-indigo-900">
                  {requirement.customer_phone}
                </a>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {requirement.customer_email ? (
                  <a href={`mailto:${requirement.customer_email}`} className="text-indigo-600 hover:text-indigo-900">
                    {requirement.customer_email}
                  </a>
                ) : (
                  'N/A'
                )}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Profession</dt>
              <dd className="mt-1 text-sm text-gray-900">{requirement.profession || 'N/A'}</dd>
            </div>

            {/* Requirement Details */}
            <div className="sm:col-span-2 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requirement Details</h3>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Looking For</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {requirement.requirement_type?.charAt(0).toUpperCase() + requirement.requirement_type?.slice(1)}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Property Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {requirement.property_type?.charAt(0).toUpperCase() + requirement.property_type?.slice(1)}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Budget Range</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {requirement.budget_min && requirement.budget_max
                  ? `${formatCurrency(requirement.budget_min)} - ${formatCurrency(requirement.budget_max)}`
                  : requirement.budget_min
                  ? `From ${formatCurrency(requirement.budget_min)}`
                  : requirement.budget_max
                  ? `Up to ${formatCurrency(requirement.budget_max)}`
                  : 'Not specified'
                }
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Preferred Location</dt>
              <dd className="mt-1 text-sm text-gray-900">{requirement.preferred_location || 'Any'}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Area/Size Preference</dt>
              <dd className="mt-1 text-sm text-gray-900">{requirement.area_preference || 'N/A'}</dd>
            </div>

            {/* Management Details */}
            <div className="sm:col-span-2 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Management Details</h3>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Inquiry Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(requirement.inquiry_date).toLocaleDateString()}
                <span className="text-gray-500 ml-2">({getDaysAgo(requirement.inquiry_date)} days ago)</span>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Follow-up Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {requirement.follow_up_date ? new Date(requirement.follow_up_date).toLocaleDateString() : 'Not set'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
              <dd className="mt-1 text-sm text-gray-900">{requirement.assigned_to || 'Not assigned'}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  requirement.status === 'open'
                    ? 'bg-green-100 text-green-800'
                    : requirement.status === 'on_hold'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {requirement.status?.charAt(0).toUpperCase() + requirement.status?.slice(1)}
                </span>
              </dd>
            </div>

            {/* Additional Notes */}
            {requirement.additional_notes && (
              <div className="sm:col-span-2 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{requirement.additional_notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}