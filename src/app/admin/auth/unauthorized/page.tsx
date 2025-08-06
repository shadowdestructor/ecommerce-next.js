import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function UnauthorizedPage() {
  return (
    <div className=\"min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8\">
      <div className=\"sm:mx-auto sm:w-full sm:max-w-md\">
        <div className=\"text-center\">
          <ExclamationTriangleIcon className=\"mx-auto h-16 w-16 text-red-500\" />
          <h1 className=\"mt-4 text-3xl font-bold text-gray-900\">Access Denied</h1>
          <p className=\"mt-2 text-sm text-gray-600\">
            You don't have permission to access this area.
          </p>
        </div>
      </div>

      <div className=\"mt-8 sm:mx-auto sm:w-full sm:max-w-md\">
        <div className=\"bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center\">
          <p className=\"text-gray-700 mb-6\">
            This area is restricted to administrators only. If you believe you should have access, 
            please contact your system administrator.
          </p>
          
          <div className=\"space-y-3\">
            <Link
              href=\"/\"
              className=\"w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500\"
            >
              Go to Homepage
            </Link>
            
            <Link
              href=\"/admin/auth/login\"
              className=\"w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500\"
            >
              Try Different Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}