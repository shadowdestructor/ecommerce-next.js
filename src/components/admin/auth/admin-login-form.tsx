'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      if (result?.ok) {
        // Verify admin access
        const response = await fetch('/api/admin/verify');
        
        if (response.ok) {
          router.push(callbackUrl);
          router.refresh();
        } else {
          setError('Access denied. Admin privileges required.');
          // Sign out the user since they don't have admin access
          await signIn('credentials', { redirect: false });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=\"space-y-6\">
      {error && (
        <div className=\"bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm\">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor=\"email\">Email Address</Label>
        <Input
          id=\"email\"
          type=\"email\"
          autoComplete=\"email\"
          {...register('email')}
          className={errors.email ? 'border-red-300' : ''}
        />
        {errors.email && (
          <p className=\"mt-1 text-sm text-red-600\">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor=\"password\">Password</Label>
        <div className=\"relative\">
          <Input
            id=\"password\"
            type={showPassword ? 'text' : 'password'}
            autoComplete=\"current-password\"
            {...register('password')}
            className={errors.password ? 'border-red-300 pr-10' : 'pr-10'}
          />
          <button
            type=\"button\"
            className=\"absolute inset-y-0 right-0 pr-3 flex items-center\"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className=\"h-5 w-5 text-gray-400\" />
            ) : (
              <EyeIcon className=\"h-5 w-5 text-gray-400\" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className=\"mt-1 text-sm text-red-600\">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Button
          type=\"submit\"
          className=\"w-full\"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>

      <div className=\"text-center\">
        <p className=\"text-sm text-gray-600\">
          Forgot your password?{' '}
          <button
            type=\"button\"
            className=\"font-medium text-blue-600 hover:text-blue-500\"
            onClick={() => {
              // TODO: Implement admin password reset
              alert('Please contact your system administrator for password reset.');
            }}
          >
            Contact Administrator
          </button>
        </p>
      </div>
    </form>
  );
}