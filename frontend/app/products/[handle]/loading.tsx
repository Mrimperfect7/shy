export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Product hero skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery skeleton */}
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          {/* Info skeleton */}
          <div className="flex flex-col gap-6 pt-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 w-28 bg-gray-200 rounded" />
            <div className="space-y-2 mt-4">
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-5/6 bg-gray-100 rounded" />
              <div className="h-3 w-4/6 bg-gray-100 rounded" />
            </div>
            <div className="flex gap-3 mt-6">
              <div className="h-12 w-12 bg-gray-200 rounded-lg" />
              <div className="h-12 w-12 bg-gray-200 rounded-lg" />
              <div className="h-12 w-12 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-14 w-full bg-gray-300 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
