'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OrderStatus, PaymentStatus } from '@prisma/client';

interface OrderFiltersProps {
  className?: string;
}

export function OrderFilters({ className = '' }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentFilters = {
    status: searchParams.get('status') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    orderNumber: searchParams.get('orderNumber') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  };

  const updateFilters = (newFilters: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries({ ...currentFilters, ...newFilters }).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
  };

  const getActiveFiltersCount = () => {
    return Object.values(currentFilters).filter(Boolean).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const orderStatuses = [
    { value: '', label: 'All Statuses' },
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
    { value: OrderStatus.PROCESSING, label: 'Processing' },
    { value: OrderStatus.SHIPPED, label: 'Shipped' },
    { value: OrderStatus.DELIVERED, label: 'Delivered' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' },
    { value: OrderStatus.REFUNDED, label: 'Refunded' },
  ];

  const paymentStatuses = [
    { value: '', label: 'All Payment Statuses' },
    { value: PaymentStatus.PENDING, label: 'Pending' },
    { value: PaymentStatus.PAID, label: 'Paid' },
    { value: PaymentStatus.FAILED, label: 'Failed' },
    { value: PaymentStatus.REFUNDED, label: 'Refunded' },
  ];

  return (
    <div className={className}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <X className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={`space-y-4 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Filter Orders</h3>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Order Status Filter */}
        <div>
          <Label htmlFor="status" className="text-sm font-medium mb-2 block">
            Order Status
          </Label>
          <Select
            value={currentFilters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <Label htmlFor="paymentStatus" className="text-sm font-medium mb-2 block">
            Payment Status
          </Label>
          <Select
            value={currentFilters.paymentStatus}
            onChange={(e) => updateFilters({ paymentStatus: e.target.value })}
          >
            {paymentStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Order Number Search */}
        <div>
          <Label htmlFor="orderNumber" className="text-sm font-medium mb-2 block">
            Order Number
          </Label>
          <Input
            id="orderNumber"
            type="text"
            placeholder="Search by order number"
            value={currentFilters.orderNumber}
            onChange={(e) => updateFilters({ orderNumber: e.target.value })}
          />
        </div>

        {/* Date Range */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Date Range</Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label htmlFor="startDate" className="text-xs text-gray-500">
                From
              </Label>
              <Input
                id="startDate"
                type="date"
                value={currentFilters.startDate}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs text-gray-500">
                To
              </Label>
              <Input
                id="endDate"
                type="date"
                value={currentFilters.endDate}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {currentFilters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {orderStatuses.find(s => s.value === currentFilters.status)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ status: '' })}
                  />
                </Badge>
              )}
              
              {currentFilters.paymentStatus && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Payment: {paymentStatuses.find(s => s.value === currentFilters.paymentStatus)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ paymentStatus: '' })}
                  />
                </Badge>
              )}
              
              {currentFilters.orderNumber && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Order: {currentFilters.orderNumber}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ orderNumber: '' })}
                  />
                </Badge>
              )}
              
              {(currentFilters.startDate || currentFilters.endDate) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {currentFilters.startDate || '...'} - {currentFilters.endDate || '...'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ startDate: '', endDate: '' })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}