import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminLoginForm } from '@/components/admin/auth/admin-login-form';
import { isAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  // If user is already logged in, check if they're admin
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (user && user.isActive && isAdmin(user.role)) {
      redirect('/admin/dashboard');
    }
  }

  return (
    <div className=\"min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8\">
      <div className=\"sm:mx-auto sm:w-full sm:max-w-md\">
        <div className=\"text-center\">
          <h1 className=\"text-3xl font-bold text-gray-900\">E-Commerce Admin</h1>
          <p className=\"mt-2 text-sm text-gray-600\">
            Sign in to your admin account
          </p>
        </div>
      </div>

      <div className=\"mt-8 sm:mx-auto sm:w-full sm:max-w-md\">
        <div className=\"bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10\">
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>

      <div className=\"mt-8 text-center\">
        <p className=\"text-xs text-gray-500\">
          This is a restricted area. Only authorized personnel may access.
        </p>
      </div>
    </div>
  );
}