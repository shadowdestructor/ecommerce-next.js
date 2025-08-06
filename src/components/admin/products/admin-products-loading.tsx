export function AdminProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Filters skeleton */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
      </div>

      {/* Products grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Checkbox */}
            <div className="p-3 border-b border-gray-100">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Image */}
            <div className="aspect-square bg-gray-200 animate-pulse"></div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}