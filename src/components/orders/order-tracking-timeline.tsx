'use client';

import { OrderStatus } from '@prisma/client';
import { CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface OrderTrackingTimelineProps {
  status: OrderStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface TimelineStep {
  id: string;
  name: string;
  description: string;
  status: 'complete' | 'current' | 'upcoming' | 'cancelled';
  date?: string;
}

export function OrderTrackingTimeline({ status, createdAt, updatedAt }: OrderTrackingTimelineProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimelineSteps = (): TimelineStep[] => {
    const baseSteps = [
      {
        id: 'pending',
        name: 'Order Placed',
        description: 'Your order has been received and is being reviewed.',
      },
      {
        id: 'confirmed',
        name: 'Order Confirmed',
        description: 'Your order has been confirmed and payment processed.',
      },
      {
        id: 'processing',
        name: 'Processing',
        description: 'Your items are being prepared for shipment.',
      },
      {
        id: 'shipped',
        name: 'Shipped',
        description: 'Your order has been shipped and is on its way.',
      },
      {
        id: 'delivered',
        name: 'Delivered',
        description: 'Your order has been delivered successfully.',
      },
    ];

    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentStatusIndex = statusOrder.indexOf(status);

    if (status === 'CANCELLED') {
      return baseSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'complete' : 'cancelled',
        date: index === 0 ? formatDate(createdAt) : undefined,
      })) as TimelineStep[];
    }

    return baseSteps.map((step, index) => {
      let stepStatus: TimelineStep['status'];
      let date: string | undefined;

      if (index < currentStatusIndex) {
        stepStatus = 'complete';
        date = index === 0 ? formatDate(createdAt) : undefined;
      } else if (index === currentStatusIndex) {
        stepStatus = 'current';
        date = index === 0 ? formatDate(createdAt) : formatDate(updatedAt);
      } else {
        stepStatus = 'upcoming';
      }

      return {
        ...step,
        status: stepStatus,
        date,
      };
    }) as TimelineStep[];
  };

  const steps = getTimelineSteps();

  const getStepIcon = (stepStatus: TimelineStep['status']) => {
    switch (stepStatus) {
      case 'complete':
        return (
          <div className=\"flex h-8 w-8 items-center justify-center rounded-full bg-green-600\">
            <CheckIcon className=\"h-5 w-5 text-white\" />
          </div>
        );
      case 'current':
        return (
          <div className=\"flex h-8 w-8 items-center justify-center rounded-full bg-blue-600\">
            <ClockIcon className=\"h-5 w-5 text-white\" />
          </div>
        );
      case 'cancelled':
        return (
          <div className=\"flex h-8 w-8 items-center justify-center rounded-full bg-red-600\">
            <XMarkIcon className=\"h-5 w-5 text-white\" />
          </div>
        );
      default:
        return (
          <div className=\"flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white\">
            <div className=\"h-2.5 w-2.5 rounded-full bg-gray-300\" />
          </div>
        );
    }
  };

  const getStepLineColor = (stepStatus: TimelineStep['status'], nextStepStatus?: TimelineStep['status']) => {
    if (stepStatus === 'complete' && nextStepStatus !== 'cancelled') {
      return 'bg-green-600';
    }
    if (stepStatus === 'cancelled' || nextStepStatus === 'cancelled') {
      return 'bg-red-600';
    }
    return 'bg-gray-200';
  };

  return (
    <div className=\"flow-root\">
      <ul className=\"-mb-8\">
        {steps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className=\"relative pb-8\">
              {stepIdx !== steps.length - 1 ? (
                <span
                  className={`absolute left-4 top-8 -ml-px h-full w-0.5 ${getStepLineColor(
                    step.status,
                    steps[stepIdx + 1]?.status
                  )}`}
                  aria-hidden=\"true\"
                />
              ) : null}
              <div className=\"relative flex space-x-3\">
                <div>{getStepIcon(step.status)}</div>
                <div className=\"flex min-w-0 flex-1 justify-between space-x-4 pt-1.5\">
                  <div>
                    <p className={`text-sm font-medium ${
                      step.status === 'complete' || step.status === 'current'
                        ? 'text-gray-900'
                        : step.status === 'cancelled'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className={`mt-0.5 text-sm ${
                      step.status === 'cancelled' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {step.date && (
                    <div className=\"whitespace-nowrap text-right text-sm text-gray-500\">
                      {step.date}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}