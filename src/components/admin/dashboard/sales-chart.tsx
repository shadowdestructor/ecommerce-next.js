'use client';

import { useState, useEffect } from 'react';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/dashboard/sales-chart?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          setSalesData(data.salesData);
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [period]);

  if (loading) {
    return (
      <div className=\"bg-white shadow rounded-lg p-6\">
        <div className=\"flex items-center justify-between mb-4\">
          <div className=\"h-6 bg-gray-200 rounded w-32 animate-pulse\"></div>
          <div className=\"h-8 bg-gray-200 rounded w-24 animate-pulse\"></div>
        </div>
        <div className=\"h-64 bg-gray-200 rounded animate-pulse\"></div>
      </div>
    );
  }

  const maxSales = Math.max(...salesData.map(d => d.sales));
  const maxOrders = Math.max(...salesData.map(d => d.orders));

  return (
    <div className=\"bg-white shadow rounded-lg p-6\">
      <div className=\"flex items-center justify-between mb-4\">
        <h3 className=\"text-lg leading-6 font-medium text-gray-900\">
          Sales Overview
        </h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
          className=\"text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500\"
        >
          <option value=\"7d\">Last 7 days</option>
          <option value=\"30d\">Last 30 days</option>
          <option value=\"90d\">Last 90 days</option>
        </select>
      </div>

      {salesData.length === 0 ? (
        <div className=\"h-64 flex items-center justify-center text-gray-500\">
          No sales data available
        </div>
      ) : (
        <div className=\"h-64\">
          {/* Simple bar chart representation */}
          <div className=\"flex items-end justify-between h-full space-x-1\">
            {salesData.map((data, index) => (
              <div key={index} className=\"flex-1 flex flex-col items-center\">
                <div className=\"w-full flex flex-col items-end justify-end h-full space-y-1\">
                  {/* Sales bar */}
                  <div
                    className=\"w-full bg-blue-500 rounded-t\"
                    style={{
                      height: `${(data.sales / maxSales) * 80}%`,
                      minHeight: data.sales > 0 ? '4px' : '0px',
                    }}
                    title={`Sales: $${data.sales.toLocaleString()}`}
                  ></div>
                  {/* Orders bar */}
                  <div
                    className=\"w-full bg-green-500 rounded-t\"
                    style={{
                      height: `${(data.orders / maxOrders) * 20}%`,
                      minHeight: data.orders > 0 ? '2px' : '0px',
                    }}
                    title={`Orders: ${data.orders}`}
                  ></div>
                </div>
                <div className=\"text-xs text-gray-500 mt-2 transform -rotate-45 origin-left\">
                  {new Date(data.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className=\"flex items-center justify-center space-x-6 mt-4\">
            <div className=\"flex items-center space-x-2\">
              <div className=\"w-3 h-3 bg-blue-500 rounded\"></div>
              <span className=\"text-sm text-gray-600\">Sales ($)</span>
            </div>
            <div className=\"flex items-center space-x-2\">
              <div className=\"w-3 h-3 bg-green-500 rounded\"></div>
              <span className=\"text-sm text-gray-600\">Orders</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}