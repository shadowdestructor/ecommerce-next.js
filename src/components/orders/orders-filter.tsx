'use client';

import { OrderStatus } from '@prisma/client';

interface OrdersFilterProps {
  value: string;
  onChange: (status: string) => void;
  className?: string;
}

const statusOptions = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function OrdersFilter({ value, onChange, className = '' }: OrdersFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        px-3 py-2 border border-gray-300 rounded-md shadow-sm
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        bg-white text-sm
        ${className}
      `}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}