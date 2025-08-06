'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useAdmin } from '@/hooks/use-admin';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

export function AdminHeader() {
  const { user } = useAdmin();
  const [notifications] = useState([]); // TODO: Implement notifications

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/auth/login' });
  };

  return (
    <div className=\"sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8\">
      <div className=\"flex flex-1 gap-x-4 self-stretch lg:gap-x-6\">
        <div className=\"flex flex-1\"></div>
        
        <div className=\"flex items-center gap-x-4 lg:gap-x-6\">
          {/* Notifications */}
          <button
            type=\"button\"
            className=\"-m-2.5 p-2.5 text-gray-400 hover:text-gray-500\"
          >
            <span className=\"sr-only\">View notifications</span>
            <BellIcon className=\"h-6 w-6\" />
            {notifications.length > 0 && (
              <span className=\"absolute -mt-5 ml-2 inline-flex h-2 w-2 rounded-full bg-red-400\"></span>
            )}
          </button>

          {/* Separator */}
          <div className=\"hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200\" />

          {/* Profile dropdown */}
          <Menu as=\"div\" className=\"relative\">
            <Menu.Button className=\"-m-1.5 flex items-center p-1.5\">
              <span className=\"sr-only\">Open user menu</span>
              <div className=\"flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium\">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className=\"hidden lg:flex lg:items-center\">
                <span className=\"ml-4 text-sm font-semibold leading-6 text-gray-900\">
                  {user?.name || 'Admin'}
                </span>
              </span>
            </Menu.Button>
            
            <Transition
              as={Fragment}
              enter=\"transition ease-out duration-100\"
              enterFrom=\"transform opacity-0 scale-95\"
              enterTo=\"transform opacity-100 scale-100\"
              leave=\"transition ease-in duration-75\"
              leaveFrom=\"transform opacity-100 scale-100\"
              leaveTo=\"transform opacity-0 scale-95\"
            >
              <Menu.Items className=\"absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none\">
                <div className=\"px-3 py-2 border-b border-gray-100\">
                  <p className=\"text-sm font-medium text-gray-900\">{user?.name}</p>
                  <p className=\"text-xs text-gray-500\">{user?.email}</p>
                  <p className=\"text-xs text-blue-600 capitalize\">{user?.role?.toLowerCase()}</p>
                </div>
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-3 py-2 text-sm text-gray-700`}
                    >
                      <UserCircleIcon className=\"mr-3 h-5 w-5 text-gray-400\" />
                      Profile
                    </button>
                  )}
                </Menu.Item>
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-3 py-2 text-sm text-gray-700`}
                    >
                      <CogIcon className=\"mr-3 h-5 w-5 text-gray-400\" />
                      Settings
                    </button>
                  )}
                </Menu.Item>
                
                <div className=\"border-t border-gray-100 my-1\"></div>
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-3 py-2 text-sm text-gray-700`}
                    >
                      <ArrowRightOnRectangleIcon className=\"mr-3 h-5 w-5 text-gray-400\" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}