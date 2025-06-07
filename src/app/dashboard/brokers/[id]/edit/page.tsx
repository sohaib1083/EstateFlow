"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EditBrokerPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    agency_name: '',
    agency_address: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchBroker();
    }
  }, [params.id]);

  async function fetchBroker() {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || '',
          agency_name: data.agency_name || '',
          agency_address: data.agency_address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching broker:', error);
      // Handle demo data
      if (typeof params.id === 'string' && params.id.startsWith('demo-')) {
        const demoBrokers = {
          'demo-1': { full_name: 'Ahmed Khan', phone: '+92 321 1234567', email: 'ahmed@realty.com', agency_name: 'Prime Realty', agency_address: '123 Business Street, Karachi' },
          'demo-2': { full_name: 'Sara Ali', phone: '+92 300 9876543', email: 'sara@estate.com', agency_name: 'City Estate', agency_address: '456 Commercial Avenue, Lahore' }
        };
        const demoBroker = demoBrokers[params.id as keyof typeof demoBrokers];
        if (demoBroker) {
          setFormData(demoBroker);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('brokers')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email || null,
          agency_name: formData.agency_name || null,
          agency_address: formData.agency_address || null
        })
        .eq('id', params.id);

      if (error) throw error;

      router.push(`/dashboard/brokers/${params.id}`);
    } catch (error: any) {
      console.error('Error updating broker:', error);
      setError(error.message || 'Failed to update broker');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/brokers/${params.id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Broker
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Broker</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Primary contact number for the broker.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional email address for digital communication.
              </p>
            </div>

            <div>
              <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700">
                Agency Name
              </label>
              <input
                type="text"
                id="agency_name"
                name="agency_name"
                value={formData.agency_name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Real estate agency name"
              />
            </div>

            <div>
              <label htmlFor="agency_address" className="block text-sm font-medium text-gray-700">
                Agency Address
              </label>
              <textarea
                id="agency_address"
                name="agency_address"
                rows={3}
                value={formData.agency_address}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Complete agency address..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/brokers/${params.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Broker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}