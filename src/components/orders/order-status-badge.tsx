'use client';

import { OrderStatus } from '@prisma/client';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'PROCESSING':
        return {
          label: 'Processing',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'SHIPPED':
        return {
          label: 'Shipped',
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}