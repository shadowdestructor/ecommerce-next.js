'use client';

import { Check } from 'lucide-react';
import { CheckoutStep } from '@/types/checkout';
import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
}

const steps = [
  { key: CheckoutStep.SHIPPING, label: 'Shipping', description: 'Address & Contact' },
  { key: CheckoutStep.PAYMENT, label: 'Payment', description: 'Payment Method' },
  { key: CheckoutStep.REVIEW, label: 'Review', description: 'Order Summary' },
];

export function CheckoutSteps({ currentStep, completedSteps }: CheckoutStepsProps) {
  const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-6">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.key);
            const isCurrent = step.key === currentStep;
            const isPast = index < currentStepIndex;

            return (
              <li key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium',
                      {
                        'border-blue-600 bg-blue-600 text-white': isCurrent,
                        'border-green-600 bg-green-600 text-white': isCompleted || isPast,
                        'border-gray-300 bg-white text-gray-500': !isCurrent && !isCompleted && !isPast,
                      }
                    )}
                  >
                    {isCompleted || isPast ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        {
                          'text-blue-600': isCurrent,
                          'text-green-600': isCompleted || isPast,
                          'text-gray-500': !isCurrent && !isCompleted && !isPast,
                        }
                      )}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'ml-8 h-0.5 w-16',
                      {
                        'bg-green-600': index < currentStepIndex,
                        'bg-gray-300': index >= currentStepIndex,
                      }
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}