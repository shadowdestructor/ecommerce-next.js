'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'MODERATOR' | 'CUSTOMER';
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }

    if (requiredRole && session.user.role !== requiredRole) {
      if (requiredRole === 'ADMIN' && session.user.role !== 'MODERATOR') {
        router.push('/unauthorized');
        return;
      }
    }
  }, [session, status, router, requiredRole]);

  if (status === 'loading') {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (requiredRole && session.user.role !== requiredRole) {
    if (requiredRole === 'ADMIN' && session.user.role !== 'MODERATOR') {
      return null;
    }
  }

  return <>{children}</>;
}

// Higher-order component for page-level protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'ADMIN' | 'MODERATOR' | 'CUSTOMER'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking user permissions
export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = !!session;
  const isLoading = status === 'loading';
  const user = session?.user;

  const hasRole = (role: 'ADMIN' | 'MODERATOR' | 'CUSTOMER') => {
    if (!user) return false;
    if (role === 'ADMIN') return user.role === 'ADMIN';
    if (role === 'MODERATOR') return user.role === 'ADMIN' || user.role === 'MODERATOR';
    return true; // Everyone has CUSTOMER access
  };

  const isAdmin = hasRole('ADMIN');
  const isModerator = hasRole('MODERATOR');
  const isCustomer = hasRole('CUSTOMER');

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    isAdmin,
    isModerator,
    isCustomer,
  };
}