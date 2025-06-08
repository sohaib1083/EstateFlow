"use client"

import { useState } from 'react';

interface ContactPickerProps {
  onContactSelected: (contact: { name: string; phone: string; email?: string }) => void;
  className?: string;
}

export default function ContactPicker({ onContactSelected, className = "" }: ContactPickerProps) {
  const [isSupported, setIsSupported] = useState(true);

  const handleContactPick = async () => {
    try {
      // Check if Contact Picker API is supported
      if (!('contacts' in navigator) || !('ContactsManager' in window)) {
        alert('Contact picker is not supported on this device/browser. Please enter contact details manually.');
        setIsSupported(false);
        return;
      }

      const contacts = await (navigator as any).contacts.select(['name', 'tel', 'email'], {
        multiple: false
      });

      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const selectedContact = {
          name: contact.name?.[0] || '',
          phone: contact.tel?.[0] || '',
          email: contact.email?.[0] || ''
        };
        
        onContactSelected(selectedContact);
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      if (error instanceof Error && error.name === 'InvalidStateError') {
        alert('Contact picker requires a secure context (HTTPS) to work.');
      } else {
        alert('Unable to access contacts. Please enter details manually.');
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleContactPick}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
    >
      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      Pick from Contacts
    </button>
  );
}