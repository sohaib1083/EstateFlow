"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewTenantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - name and phone required, email and address optional
  const [formData, setFormData] = useState({
    name: '', // Required
    phone: '', // Required
    email: '', // Optional
    address: '', // Optional
    id_number: '' // Optional
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate only required fields (name and phone)
      if (!formData.name || !formData.phone) {
        throw new Error('Please fill in Name and Phone Number (required fields)');
      }

      // Save to Supabase - only send non-empty optional fields
      const insertData: any = {
        name: formData.name,
        phone: formData.phone
      };

      // Only include optional fields if they have actual values (not empty strings)
      if (formData.email && formData.email.trim()) {
        insertData.email = formData.email.trim();
      }
      if (formData.address && formData.address.trim()) {
        insertData.address = formData.address.trim();
      }
      if (formData.id_number && formData.id_number.trim()) {
        insertData.id_number = formData.id_number.trim();
      }

      const { data, error: supabaseError } = await supabase
        .from('tenants')
        .insert([insertData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Navigate back to tenants list
      router.push('/dashboard/tenants');
    } catch (error: any) {
      console.error('Error adding tenant:', error);
      setError(error.message || 'Failed to add tenant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard/tenants"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tenants
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Tenant</h1>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {/* Required Fields */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter tenant's full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="id_number" className="block text-sm font-medium text-gray-700">
                ID Number <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="id_number"
                  id="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  placeholder="e.g., Aadhar, PAN, Passport number"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="mt-1">
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter tenant's address"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Link
              href="/dashboard/tenants"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
