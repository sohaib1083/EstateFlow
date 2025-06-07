"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewPaymentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    agreementId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0], // Today's date
    paymentMethod: 'Online Transfer',
    referenceNumber: '',
    notes: '',
    isPartialPayment: false
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: val
    }));
  };

  // In a real app, you would fetch this data from Supabase
  const agreements = [
    { id: '1', property: 'Sunset Apartment 3B', tenant: 'John Doe', rent: 'Rs.15,000' },
    { id: '2', property: 'Green Villa 204', tenant: 'Jane Smith', rent: 'Rs.22,000' },
    { id: '3', property: 'Ocean View Complex 7A', tenant: 'Robert Johnson', rent: 'Rs.18,500' },
    { id: '4', property: 'Mountain Lodge 5D', tenant: 'Sarah Williams', rent: 'Rs.20,000' },
    { id: '5', property: 'City Center Flat 12C', tenant: 'David Brown', rent: 'Rs.25,000' },
  ];

  // Get rent amount when agreement changes
  const handleAgreementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agreementId = e.target.value;
    const selectedAgreement = agreements.find(a => a.id === agreementId);
    
    setFormData(prev => ({
      ...prev,
      agreementId,
      amount: selectedAgreement ? selectedAgreement.rent.replace('Rs.', '') : ''
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, you would save this data to Supabase
      console.log('Submitting payment data:', formData);

      // Simulated delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back to payments list
      router.push('/dashboard/payments');
      router.refresh();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Record New Payment</h1>
      </div>

      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="agreementId" className="block text-sm font-medium text-gray-700">
                Rent Agreement *
              </label>
              <div className="mt-1">
                <select
                  id="agreementId"
                  name="agreementId"
                  required
                  value={formData.agreementId}
                  onChange={handleAgreementChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a rent agreement</option>
                  {agreements.map(agreement => (
                    <option key={agreement.id} value={agreement.id}>
                      {agreement.property} - {agreement.tenant} ({agreement.rent})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                Payment Date *
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="paymentDate"
                  id="paymentDate"
                  required
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (Rs.) *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Payment Method *
              </label>
              <div className="mt-1">
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  required
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option>Online Transfer</option>
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Check</option>
                  <option>Bank Transfer</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
                Reference/Transaction Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="referenceNumber"
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center h-full pt-5">
              <input
                id="isPartialPayment"
                name="isPartialPayment"
                type="checkbox"
                checked={formData.isPartialPayment}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isPartialPayment" className="ml-2 block text-sm text-gray-700">
                This is a partial payment
              </label>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Link
              href="/dashboard/payments"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
