export function OrderDetailLoading() {
  return (
    <div className=\"space-y-8\">
      {/* Header skeleton */}
      <div className=\"flex items-center gap-4\">
        <div className=\"h-6 bg-gray-200 rounded animate-pulse w-32\"></div>
      </div>

      <div className=\"bg-white border border-gray-200 rounded-lg shadow-sm\">
        {/* Order Header skeleton */}
        <div className=\"p-6 border-b border-gray-200\">
          <div className=\"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4\">
            <div>
              <div className=\"h-8 bg-gray-200 rounded animate-pulse w-48 mb-2\"></div>
              <div className=\"flex items-center gap-4\">
                <div className=\"h-6 bg-gray-200 rounded-full animate-pulse w-20\"></div>
                <div className=\"h-4 bg-gray-200 rounded animate-pulse w-32\"></div>
              </div>
            </div>
            <div className=\"text-right\">
              <div className=\"h-8 bg-gray-200 rounded animate-pulse w-24 mb-1\"></div>
              <div className=\"h-4 bg-gray-200 rounded animate-pulse w-16\"></div>
            </div>
          </div>
        </div>

        {/* Order Tracking skeleton */}
        <div className=\"p-6 border-b border-gray-200\">
          <div className=\"h-6 bg-gray-200 rounded animate-pulse w-32 mb-4\"></div>
          <div className=\"space-y-4\">
            {[...Array(5)].map((_, i) => (
              <div key={i} className=\"flex items-center gap-3\">
                <div className=\"w-8 h-8 bg-gray-200 rounded-full animate-pulse\"></div>
                <div className=\"flex-1\">
                  <div className=\"h-4 bg-gray-200 rounded animate-pulse w-32 mb-1\"></div>
                  <div className=\"h-3 bg-gray-200 rounded animate-pulse w-48\"></div>
                </div>
                <div className=\"h-3 bg-gray-200 rounded animate-pulse w-16\"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items skeleton */}
        <div className=\"p-6 border-b border-gray-200\">
          <div className=\"h-6 bg-gray-200 rounded animate-pulse w-32 mb-4\"></div>
          <div className=\"space-y-4\">
            {[...Array(2)].map((_, i) => (
              <div key={i} className=\"flex items-center gap-4 p-4 bg-gray-50 rounded-lg\">
                <div className=\"w-20 h-20 bg-gray-200 rounded-md animate-pulse flex-shrink-0\"></div>
                <div className=\"flex-1 min-w-0\">
                  <div className=\"h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2\"></div>
                  <div className=\"h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-1\"></div>
                  <div className=\"h-4 bg-gray-200 rounded animate-pulse w-1/3 mb-1\"></div>
                  <div className=\"h-4 bg-gray-200 rounded animate-pulse w-1/4\"></div>
                </div>
                <div className=\"h-5 bg-gray-200 rounded animate-pulse w-20\"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary skeleton */}
        <div className=\"p-6 border-b border-gray-200\">
          <div className=\"h-6 bg-gray-200 rounded animate-pulse w-32 mb-4\"></div>
          <div className=\"space-y-2 max-w-sm ml-auto\">
            {[...Array(5)].map((_, i) => (
              <div key={i} className=\"flex justify-between\">
                <div className=\"h-4 bg-gray-200 rounded animate-pulse w-20\"></div>
                <div className=\"h-4 bg-gray-200 rounded animate-pulse w-16\"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment skeleton */}
        <div className=\"p-6\">
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
            <div>
              <div className=\"h-6 bg-gray-200 rounded animate-pulse w-32 mb-3\"></div>
              <div className=\"space-y-2\">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className=\"h-4 bg-gray-200 rounded animate-pulse w-full\"></div>
                ))}
              </div>
            </div>
            <div>
              <div className=\"h-6 bg-gray-200 rounded animate-pulse w-32 mb-3\"></div>
              <div className=\"h-4 bg-gray-200 rounded animate-pulse w-24\"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions skeleton */}
      <div className=\"flex flex-col sm:flex-row gap-4\">
        <div className=\"h-10 bg-gray-200 rounded animate-pulse w-32\"></div>
        <div className=\"h-10 bg-gray-200 rounded animate-pulse w-32\"></div>
      </div>
    </div>
  );
}