'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { addressSchema } from '@/lib/validations/order';
import { Address } from '@/types/order';
import { z } from 'zod';

const paymentFormSchema = z.object({
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  billingAddress: addressSchema.optional(),
  cardDetails: z.object({
    cardNumber: z.string().min(1, 'Card number is required'),
    expiryMonth: z.string().min(1, 'Expiry month is required'),
    expiryYear: z.string().min(1, 'Expiry year is required'),
    cvv: z.string().min(3, 'CVV is required'),
    cardholderName: z.string().min(1, 'Cardholder name is required'),
  }).optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  initialData?: {
    paymentMethod: string;
    billingAddress: Address | null;
    useSameAddress: boolean;
  };
  shippingAddress: Address;
  onSubmit: (data: PaymentFormData & { useSameAddress: boolean }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const paymentMethods = [
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: Truck },
];

export function PaymentForm({ 
  initialData, 
  shippingAddress, 
  onSubmit, 
  onBack, 
  isLoading = false 
}: PaymentFormProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    initialData?.paymentMethod || ''
  );
  const [useSameAddress, setUseSameAddress] = useState(
    initialData?.useSameAddress ?? true
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: initialData?.paymentMethod || '',
      billingAddress: initialData?.billingAddress || {
        firstName: '',
        lastName: '',
        company: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        phone: '',
      },
    },
  });

  const handleFormSubmit = (data: PaymentFormData) => {
    onSubmit({
      ...data,
      useSameAddress,
    });
  };

  const requiresCreditCard = selectedPaymentMethod === 'credit_card';
  const requiresBillingAddress = !useSameAddress;

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Method
        </h2>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedPaymentMethod === method.value;
            
            return (
              <label
                key={method.value}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={method.value}
                  checked={isSelected}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  {...register('paymentMethod')}
                  className="sr-only"
                />
                <Icon className="h-5 w-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-900">{method.label}</span>
              </label>
            );
          })}
        </div>
        
        {errors.paymentMethod && (
          <p className="text-sm text-red-600 mt-2">{errors.paymentMethod.message}</p>
        )}
      </div>

      {/* Credit Card Details */}
      {requiresCreditCard && (
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Card Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="Name on card"
                {...register('cardDetails.cardholderName')}
              />
              {errors.cardDetails?.cardholderName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.cardDetails.cardholderName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...register('cardDetails.cardNumber')}
              />
              {errors.cardDetails?.cardNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.cardDetails.cardNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expiryMonth">Month *</Label>
                <Select {...register('cardDetails.expiryMonth')}>
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </Select>
                {errors.cardDetails?.expiryMonth && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.cardDetails.expiryMonth.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="expiryYear">Year *</Label>
                <Select {...register('cardDetails.expiryYear')}>
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString();
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </Select>
                {errors.cardDetails?.expiryYear && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.cardDetails.expiryYear.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  {...register('cardDetails.cvv')}
                />
                {errors.cardDetails?.cvv && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.cardDetails.cvv.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Address */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">
          Billing Address
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useSameAddress}
              onChange={(e) => setUseSameAddress(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Same as shipping address
            </span>
          </label>

          {!useSameAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Billing address fields - similar to shipping form */}
              <div>
                <Label htmlFor="billingFirstName">First Name *</Label>
                <Input
                  id="billingFirstName"
                  placeholder="First name"
                  {...register('billingAddress.firstName')}
                />
              </div>

              <div>
                <Label htmlFor="billingLastName">Last Name *</Label>
                <Input
                  id="billingLastName"
                  placeholder="Last name"
                  {...register('billingAddress.lastName')}
                />
              </div>

              {/* Add more billing address fields as needed */}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Back to Shipping
        </Button>
        
        <Button
          type="submit"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Processing...' : 'Review Order'}
        </Button>
      </div>
    </div>
  );
}