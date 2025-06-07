"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewRequirementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    profession: '',
    requirement_type: 'rent',
    property_type: 'residential',
    budget_min: '',
    budget_max: '',
    preferred_location: '',
    area_preference: '',
    additional_notes: '',
    inquiry_date: new Date().toISOString().split('T')[0],
    follow_up_date: '',
    assigned_to: '',
    status: 'open'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.customer_name || !formData.customer_phone || !formData.requirement_type) {
        throw new Error('Please fill in customer name, phone, and requirement type (required fields)');
      }

      // Prepare insert data
      const insertData: any = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        requirement_type: formData.requirement_type,
        property_type: formData.property_type,
        inquiry_date: formData.inquiry_date,
        status: formData.status
      };

      // Only include optional fields if they have values
      if (formData.customer_email.trim()) {
        insertData.customer_email = formData.customer_email;
      }
      if (formData.profession.trim()) {
        insertData.profession = formData.profession;
      }
      if (formData.budget_min) {
        insertData.budget_min = parseFloat(formData.budget_min);
      }
      if (formData.budget_max) {
        insertData.budget_max = parseFloat(formData.budget_max);
      }
      if (formData.preferred_location.trim()) {
        insertData.preferred_location = formData.preferred_location;
      }
      if (formData.area_preference.trim()) {
        insertData.area_preference = formData.area_preference;
      }
      if (formData.additional_notes.trim()) {
        insertData.additional_notes = formData.additional_notes;
      }
      if (formData.follow_up_date) {
        insertData.follow_up_date = formData.follow_up_date;
      }
      if (formData.assigned_to.trim()) {
        insertData.assigned_to = formData.assigned_to;
      }

      const { data, error: supabaseError } = await supabase
        .from('requirements')
        .insert([insertData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Navigate back to requirements list
      router.push('/dashboard/requirements');
    } catch (error: any) {
      console.error('Error adding requirement:', error);
      setError(error.message || 'Failed to add requirement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Requirements
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Customer Requirement</h1>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  id="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter customer's full name"
                />
              </div>

              <div>
                <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  id="customer_phone"
                  required
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="email"
                  name="customer_email"
                  id="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
                  Profession <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="profession"
                  id="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Engineer, Doctor, Business Owner"
                />
              </div>
            </div>
          </div>

          {/* Requirement Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Requirement Details</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="requirement_type" className="block text-sm font-medium text-gray-700">
                  Looking For <span className="text-red-500">*</span>
                </label>
                <select
                  name="requirement_type"
                  id="requirement_type"
                  required
                  value={formData.requirement_type}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                  <option value="both">Both Rent & Sale</option>
                </select>
              </div>

              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="property_type"
                  id="property_type"
                  required
                  value={formData.property_type}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700">
                  Minimum Budget (Rs.) <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="budget_min"
                  id="budget_min"
                  min="0"
                  value={formData.budget_min}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Minimum budget"
                />
              </div>

              <div>
                <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700">
                  Maximum Budget (Rs.) <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="budget_max"
                  id="budget_max"
                  min="0"
                  value={formData.budget_max}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Maximum budget"
                />
              </div>

              <div>
                <label htmlFor="preferred_location" className="block text-sm font-medium text-gray-700">
                  Preferred Location <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="preferred_location"
                  id="preferred_location"
                  value={formData.preferred_location}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., DHA, Gulberg, Model Town"
                />
              </div>

              <div>
                <label htmlFor="area_preference" className="block text-sm font-medium text-gray-700">
                  Area/Size Preference <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="area_preference"
                  id="area_preference"
                  value={formData.area_preference}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., 2 BHK, 1000 sq.ft., 3 Bedroom"
                />
              </div>
            </div>
          </div>

          {/* Management Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Management Details</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="inquiry_date" className="block text-sm font-medium text-gray-700">
                  Inquiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="inquiry_date"
                  id="inquiry_date"
                  required
                  value={formData.inquiry_date}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="follow_up_date" className="block text-sm font-medium text-gray-700">
                  Follow-up Date <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="date"
                  name="follow_up_date"
                  id="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                  Assigned To <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="assigned_to"
                  id="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Staff member handling this requirement"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  id="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="open">Open</option>
                  <option value="on_hold">On Hold</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700">
              Additional Notes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              name="additional_notes"
              id="additional_notes"
              rows={4}
              value={formData.additional_notes}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Any additional requirements, preferences, or notes..."
            />
          </div>

          <div className="bg-gray-50 px-4 py-3 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Link
              href="/dashboard/requirements"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}