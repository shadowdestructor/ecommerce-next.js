import { Suspense } from 'react';
import { DashboardStats } from '@/components/admin/dashboard/dashboard-stats';
import { RecentOrders } from '@/components/admin/dashboard/recent-orders';
import { SalesChart } from '@/components/admin/dashboard/sales-chart';
import { TopProducts } from '@/components/admin/dashboard/top-products';
import { DashboardLoading } from '@/components/admin/dashboard/dashboard-loading';

export default function AdminDashboardPage() {
  return (
    <div className=\"space-y-6\">
      <div>
        <h1 className=\"text-2xl font-bold text-gray-900\">Dashboard</h1>
        <p className=\"mt-1 text-sm text-gray-500\">
          Welcome to your admin dashboard. Here's what's happening with your store today.
        </p>
      </div>

      <Suspense fallback={<DashboardLoading />}>
        <div className=\"space-y-6\">
          {/* Stats Overview */}
          <DashboardStats />

          {/* Charts and Analytics */}
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
            <SalesChart />
            <TopProducts />
          </div>

          {/* Recent Activity */}
          <RecentOrders />
        </div>
      </Suspense>
    </div>
  );
}