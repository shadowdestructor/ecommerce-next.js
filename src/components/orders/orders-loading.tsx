export function OrdersLoading() {
  return (
    <div className=\"space-y-6\">
      {/* Filters skeleton */}
      <div className=\"flex flex-col sm:flex-row gap-4\">
        <div className=\"h-10 bg-gray-200 rounded animate-pulse flex-1\"></div>
        <div className=\"h-10 bg-gray-200 rounded animate-pulse w-32\"></div>
      </div>

      {/* Orders skeleton */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className=\"bg-white border border-gray-200 rounded-lg shadow-sm\">
          {/* Header skeleton */}
          <div className=\"p-6 border-b border-gray-200\">
            <div className=\"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4\">
              <div className=\"flex-1\">
                <div className=\"flex items-center gap-4 mb-2\">
                  <div className=\"h-6 bg-gray-200 rounded animate-pulse w-32\"></div>
                  <div className=\"h-6 bg-gray-200 rounded-full animate-pulse w-20\"></div>
                </div>
                <div className=\"h-4 bg-gray-200 rounded animate-pulse w-24\"></div>
              </div>
              <div className=\"text-right\">
                <div className=\"h-6 bg-gray-200 rounded animate-pulse w-20 mb-1\"></div>
                <div className=\"h-4 bg-gray-200 rounded animate-pulse w-16\"></div>
              </div>
            </div>
          </div>

          {/* Items skeleton */}
          <div className=\"p-6\">
            <div className=\"space-y-3\">
              {[...Array(2)].map((_, j) => (
                <div key={j} className=\"flex items-center gap-4\">
                  <div className=\"w-16 h-16 bg-gray-200 rounded-md animate-pulse flex-shrink-0\"></div>
                  <div className=\"flex-1 min-w-0\">
                    <div className=\"h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2\"></div>
                    <div className=\"h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-1\"></div>
                    <div className=\"h-3 bg-gray-200 rounded animate-pulse w-1/4\"></div>
                  </div>
                  <div className=\"h-4 bg-gray-200 rounded animate-pulse w-16\"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions skeleton */}
          <div className=\"px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg\">
            <div className=\"flex gap-3\">
              <div className=\"h-4 bg-gray-200 rounded animate-pulse w-20\"></div>
              <div className=\"h-4 bg-gray-200 rounded animate-pulse w-24\"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}