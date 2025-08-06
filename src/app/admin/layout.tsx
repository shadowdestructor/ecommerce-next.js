import { AdminRouteGuard } from '@/components/admin/auth/admin-route-guard';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';
import { AdminHeader } from '@/components/admin/layout/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <div className=\"min-h-screen bg-gray-50\">
        <AdminSidebar />
        <div className=\"lg:pl-64\">
          <AdminHeader />
          <main className=\"py-6\">
            <div className=\"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8\">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}