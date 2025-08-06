'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface UseAdminReturn {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
  refetch: () => Promise<void>;
}

export function useAdmin(): UseAdminReturn {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!session) {
        setUser(null);
        return;
      }

      const response = await fetch('/api/admin/verify');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        if (response.status === 403) {
          setError('Admin access required');
        } else if (response.status === 401) {
          setError('Authentication required');
        } else {
          setError('Failed to verify admin access');
        }
      }
    } catch (error) {
      console.error('Admin verification error:', error);
      setError('Failed to verify admin access');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'loading') {
      fetchAdminUser();
    }
  }, [session, status]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    
    const roleHierarchy = {
      CUSTOMER: 0,
      ADMIN: 1,
      SUPER_ADMIN: 2,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return {
    user,
    isLoading: status === 'loading' || isLoading,
    error,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    hasRole,
    refetch: fetchAdminUser,
  };
}