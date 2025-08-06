'use client';

import { Check, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { cn } from '@/lib/utils';

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
  orderDate: Date;
  className?: string;
}

const statusSteps = [
  {
    key: OrderStatus.PENDING,
    label: 'Order Placed',
    description: 'Your order has been received',
    icon: Package,
  },
  {
    key: OrderStatus.CONFIRMED,
    label: 'Order Confirmed',
    description: 'Your order has been confirmed',
    icon: Check,
  },
  {
    key: OrderStatus.PROCESSING,
    label: 'Processing',
    description: 'Your order is being prepared',
    icon: Package,
  },
  {
    key: OrderStatus.SHIPPED,
    label: 'Shipped',
    description: 'Your order is on its way',
    icon: Truck,
  },
  {
    key: OrderStatus.DELIVERED,
    label: 'Delivered',
    description: 'Your order has been delivered',
    icon: CheckCircle,
  },
];

export function OrderStatusTracker({ 
  currentStatus, 
  orderDate, 
  className = '' 
}: OrderStatusTrackerProps) {
  const getCurrentStepIndex = () => {
    const index = statusSteps.findIndex(step => step.key === currentStatus);
    return index === -1 ? 0 : index;
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = currentStatus === OrderStatus.CANCELLED;
  const isRefunded = currentStatus === OrderStatus.REFUNDED;

  // Handle cancelled/refunded orders
  if (isCancelled || isRefunded) {
    return (
      <div className={cn('bg-white rounded-lg border p-6', className)}>
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Order {isCancelled ? 'Cancelled' : 'Refunded'}
              </h3>
              <p className="text-sm text-gray-500">
                {isCancelled 
                  ? 'Your order has been cancelled'
                  : 'Your order has been refunded'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg border p-6', className)}>
      <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
        <div 
          className="absolute left-6 top-12 w-0.5 bg-blue-600 transition-all duration-500"
          style={{ 
            height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` 
          }}
        />

        {/* Status Steps */}
        <div className="space-y-8">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={step.key} className="relative flex items-start">
                {/* Step Icon */}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                    {
                      'border-blue-600 bg-blue-600 text-white': isCompleted,
                      'border-blue-600 bg-white text-blue-600': isCurrent && !isCompleted,
                      'border-gray-300 bg-white text-gray-400': isPending,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn(
                        'text-sm font-medium',
                        {
                          'text-gray-900': isCompleted || isCurrent,
                          'text-gray-500': isPending,
                        }
                      )}
                    >
                      {step.label}
                    </h4>
                    
                    {isCompleted && (
                      <span className="text-xs text-gray-500">
                        {index === 0 
                          ? new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(orderDate)
                          : 'Completed'
                        }
                      </span>
                    )}
                  </div>
                  
                  <p
                    className={cn(
                      'text-sm mt-1',
                      {
                        'text-gray-600': isCompleted || isCurrent,
                        'text-gray-400': isPending,
                      }
                    )}
                  >
                    {step.description}
                  </p>

                  {/* Current Step Additional Info */}
                  {isCurrent && currentStatus === OrderStatus.SHIPPED && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        Your package is on its way! You'll receive tracking information via email.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated Delivery */}
      {currentStatus === OrderStatus.SHIPPED && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Estimated Delivery</h4>
              <p className="text-sm text-gray-600">
                {new Intl.DateTimeFormat('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                }).format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))}
              </p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
}