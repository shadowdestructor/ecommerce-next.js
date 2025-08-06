import { Suspense } from 'react';
import { AdminUsersClient } from '@/components/admin/users/admin-users-client';
import { AdminUsersLoading } from '@/components/admin/users/admin-users-loading';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage customer accounts, roles, and user activity.
        </p>
      </div>

      <Suspense fallback={<AdminUsersLoading />}>
        <AdminUsersClient />
      </Suspense>
    </div>
  );
}