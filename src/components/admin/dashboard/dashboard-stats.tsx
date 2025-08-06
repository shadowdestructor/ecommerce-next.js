'use client';

import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface DashboardStatsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className=\"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4\">
        {[...Array(4)].map((_, i) => (
          <div key={i} className=\"bg-white overflow-hidden shadow rounded-lg animate-pulse\">
            <div className=\"p-5\">
              <div className=\"flex items-center\">
                <div className=\"flex-shrink-0\">
                  <div className=\"h-8 w-8 bg-gray-200 rounded\"></div>
                </div>
                <div className=\"ml-5 w-0 flex-1\">
                  <div className=\"h-4 bg-gray-200 rounded w-16 mb-2\"></div>
                  <div className=\"h-6 bg-gray-200 rounded w-20\"></div>
                </div>
              </div>
            </div>
            <div className=\"bg-gray-50 px-5 py-3\">
              <div className=\"h-3 bg-gray-200 rounded w-24\"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className=\"text-center py-4 text-gray-500\">
        Failed to load dashboard statistics
      </div>
    );
  }

  const statItems = [
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      icon: ClipboardDocumentListIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: stats.customersChange,
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      change: stats.productsChange,
      icon: ShoppingBagIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className=\"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4\">
      {statItems.map((item) => (
        <div key={item.name} className=\"bg-white overflow-hidden shadow rounded-lg\">
          <div className=\"p-5\">
            <div className=\"flex items-center\">
              <div className=\"flex-shrink-0\">
                <div className={`p-2 rounded-md ${item.bgColor}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
              </div>
              <div className=\"ml-5 w-0 flex-1\">
                <dl>
                  <dt className=\"text-sm font-medium text-gray-500 truncate\">
                    {item.name}
                  </dt>
                  <dd className=\"text-lg font-medium text-gray-900\">
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className=\"bg-gray-50 px-5 py-3\">
            <div className=\"text-sm\">
              <span
                className={`font-medium ${
                  item.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
              </span>
              <span className=\"text-gray-500\"> from last month</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}