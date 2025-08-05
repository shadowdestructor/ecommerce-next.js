'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { addressSchema } from '@/lib/validations/order';
import { Address } from '@/types/order';
import { z } from 'zod';

const shippingFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  shippingAddress: addressSchema,
});

type ShippingFormData = z.infer<typeof shippingFormSchema>;

interface ShippingFormProps {
  initialData?: {
    email: string;
    shippingAddress: Address | null;
  };
  onSubmit: (data: ShippingFormData) => void;
  isLoading?: boolean;
}

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'TR', label: 'Turkey' },
  // Add more countries as needed
];

const states = [
  { value: 'AL', label: 'Alabama' },
  { value: 'CA', label: 'California' },
  { value: 'FL', label: 'Florida' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  // Add more states as needed
];

export function ShippingForm({ initialData, onSubmit, isLoading = false }: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      email: initialData?.email || '',
      shippingAddress: initialData?.shippingAddress || {
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

  const selectedCountry = watch('shippingAddress.country');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Shipping Address
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="First name"
              {...register('shippingAddress.firstName')}
            />
            {errors.shippingAddress?.firstName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.shippingAddress.firstName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Last name"
              {...register('shippingAddress.lastName')}
            />
            {errors.shippingAddress?.lastName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.shippingAddress.lastName.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              placeholder="Company name"
              {...register('shippingAddress.company')}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="addressLine1">Address *</Label>
            <Input
              id="addressLine1"
              placeholder="Street address"
              {...register('shippingAddress.addressLine1')}
            />
            {errors.shippingAddress?.addressLine1 && (
              <p className="text-sm text-red-600 mt-1">
                {errors.shippingAddress.addressLine1.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="addressLine2">Apartment, suite, etc. (Optional)</Label>
            <Input
              id="addressLine2"
              placeholder="Apartment, suite, etc."
              {...register('shippingAddress.addressLine2')}
            />
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="City"
              {...register('shippingAddress.city')}
            />
            {errors.shippingAddress?.city && (
              <p className="text-sm text-red-600 mt-1">
                {errors.shippingAddress.city.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Select {...register('shippingAddress.state')}>
              <option value="">Select state</option>
              {states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </Select>
            {errors.shippingAddress?.state && (
              <p className="text-sm text-red-600 mt-1">
                {errors.shippingAddress.state.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              placeholder="Postal code"
              {...register('shippingAddress.postalCode')}
            />
            {errors.shippingAddress?.postalCode && (
              <p className="text-sm text-red-600 mt-1">
                {errors.shippingAddress.postalCode.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Select {...register('shippingAddress.country')}>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </Select>
            {errors.shippingAddress?.country && (
              <p className="text-sm text-red-600 mt-1">
                {errors.shippingAddress.country.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone number"
              {...register('shippingAddress.phone')}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </Button>
      </div>
    </div>
  );
}