'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface AdminOrdersSearchProps {
  value: string;
  onChange: (search: string) => void;
  className?: string;
}

export function AdminOrdersSearch({ 
  value, 
  onChange, 
  className = '' 
}: AdminOrdersSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onChange]);

  // Update local state when prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search orders by number, customer email, or product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
}