export function DashboardLoading() {
  return (
    <div className=\"space-y-6\">
      {/* Stats skeleton */}
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

      {/* Charts skeleton */}
      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
        <div className=\"bg-white shadow rounded-lg p-6 animate-pulse\">
          <div className=\"flex items-center justify-between mb-4\">
            <div className=\"h-6 bg-gray-200 rounded w-32\"></div>
            <div className=\"h-8 bg-gray-200 rounded w-24\"></div>
          </div>
          <div className=\"h-64 bg-gray-200 rounded\"></div>
        </div>
        
        <div className=\"bg-white shadow rounded-lg p-6 animate-pulse\">
          <div className=\"flex items-center justify-between mb-4\">
            <div className=\"h-6 bg-gray-200 rounded w-32\"></div>
            <div className=\"h-4 bg-gray-200 rounded w-16\"></div>
          </div>
          <div className=\"space-y-4\">
            {[...Array(5)].map((_, i) => (
              <div key={i} className=\"flex items-center space-x-4\">
                <div className=\"w-6 h-6 bg-gray-200 rounded-full\"></div>
                <div className=\"w-12 h-12 bg-gray-200 rounded\"></div>
                <div className=\"flex-1\">
                  <div className=\"h-4 bg-gray-200 rounded w-3/4 mb-2\"></div>
                  <div className=\"h-3 bg-gray-200 rounded w-1/2\"></div>
                </div>
                <div className=\"text-right\">
                  <div className=\"h-4 bg-gray-200 rounded w-16 mb-1\"></div>
                  <div className=\"h-3 bg-gray-200 rounded w-12\"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders skeleton */}
      <div className=\"bg-white shadow rounded-lg animate-pulse\">
        <div className=\"px-4 py-5 sm:p-6\">
          <div className=\"flex items-center justify-between mb-4\">
            <div className=\"h-6 bg-gray-200 rounded w-32\"></div>
            <div className=\"h-4 bg-gray-200 rounded w-16\"></div>
          </div>
          <div className=\"space-y-4\">
            {[...Array(5)].map((_, i) => (
              <div key={i} className=\"flex items-center justify-between p-4 border border-gray-200 rounded-lg\">
                <div className=\"flex items-center space-x-4\">
                  <div className=\"h-4 bg-gray-200 rounded w-24\"></div>
                  <div className=\"h-4 bg-gray-200 rounded w-32\"></div>
                  <div className=\"h-6 bg-gray-200 rounded-full w-20\"></div>
                </div>
                <div className=\"h-4 bg-gray-200 rounded w-16\"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}