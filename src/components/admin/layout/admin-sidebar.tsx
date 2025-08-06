'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Categories', href: '/admin/categories', icon: TagIcon },
  { name: 'Blog', href: '/admin/blog', icon: ChatBubbleLeftRightIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isSuperAdmin } = useAdmin();

  const filteredNavigation = navigation.filter(item => {
    // Hide certain items for non-super admins if needed
    if (item.href === '/admin/settings' && !isSuperAdmin) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className=\"fixed inset-0 bg-gray-900/80\" onClick={() => setSidebarOpen(false)} />
        
        <div className=\"fixed inset-0 flex\">
          <div className=\"relative mr-16 flex w-full max-w-xs flex-1\">
            <div className=\"absolute left-full top-0 flex w-16 justify-center pt-5\">
              <button
                type=\"button\"
                className=\"-m-2.5 p-2.5\"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className=\"h-6 w-6 text-white\" />
              </button>
            </div>
            
            <div className=\"flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2\">
              <div className=\"flex h-16 shrink-0 items-center\">
                <Link href=\"/admin/dashboard\" className=\"text-xl font-bold text-gray-900\">
                  Admin Panel
                </Link>
              </div>
              <nav className=\"flex flex-1 flex-col\">
                <ul className=\"flex flex-1 flex-col gap-y-7\">
                  <li>
                    <ul className=\"-mx-2 space-y-1\">
                      {filteredNavigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                                isActive
                                  ? 'bg-gray-50 text-blue-600'
                                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                              }`}
                            >
                              <item.icon
                                className={`h-6 w-6 shrink-0 ${
                                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                                }`}
                              />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className=\"hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col\">
        <div className=\"flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6\">
          <div className=\"flex h-16 shrink-0 items-center\">
            <Link href=\"/admin/dashboard\" className=\"text-xl font-bold text-gray-900\">
              Admin Panel
            </Link>
          </div>
          <nav className=\"flex flex-1 flex-col\">
            <ul className=\"flex flex-1 flex-col gap-y-7\">
              <li>
                <ul className=\"-mx-2 space-y-1\">
                  {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                            isActive
                              ? 'bg-gray-50 text-blue-600'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              {/* User info at bottom */}
              {user && (
                <li className=\"mt-auto\">
                  <div className=\"-mx-2 p-2 border-t border-gray-200\">
                    <div className=\"flex items-center gap-x-3\">
                      <div className=\"flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium\">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className=\"flex-1 min-w-0\">
                        <p className=\"text-sm font-medium text-gray-900 truncate\">{user.name}</p>
                        <p className=\"text-xs text-gray-500 capitalize\">{user.role.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className=\"sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden\">
        <button
          type=\"button\"
          className=\"-m-2.5 p-2.5 text-gray-700 lg:hidden\"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className=\"h-6 w-6\" />
        </button>
        <div className=\"flex-1 text-sm font-semibold leading-6 text-gray-900\">
          Admin Panel
        </div>
      </div>
    </>
  );
}