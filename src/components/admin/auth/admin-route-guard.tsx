'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackUrl?: string;
}

export function AdminRouteGuard({ 
  children, 
  requiredRole = 'ADMIN',
  fallbackUrl = '/admin/auth/login'
}: AdminRouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      if (status === 'loading') {
        return;
      }

      if (!session) {
        router.push(fallbackUrl);
        return;
      }

      try {
        const response = await fetch('/api/admin/verify');
        
        if (response.ok) {
          const data = await response.json();
          const userRole = data.user.role;
          
          // Check if user has required role
          const roleHierarchy = {
            CUSTOMER: 0,
            ADMIN: 1,
            SUPER_ADMIN: 2,
          };

          const hasRequiredRole = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
          
          if (hasRequiredRole) {
            setHasAccess(true);
          } else {
            router.push('/admin/auth/unauthorized');
          }
        } else {
          router.push(fallbackUrl);
        }
      } catch (error) {
        console.error('Access verification failed:', error);
        router.push(fallbackUrl);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [session, status, router, requiredRole, fallbackUrl]);

  if (status === 'loading' || isVerifying) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto\"></div>
          <p className=\"mt-4 text-gray-600\">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}