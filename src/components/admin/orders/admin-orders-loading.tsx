export function AdminOrdersLoading() {
  return (
    <div className="space-y-6">
      {/* Filters skeleton */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-40"></div>
        </div>
      </div>

      {/* Orders skeleton */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header skeleton */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>

          {/* Actions skeleton */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-28"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}