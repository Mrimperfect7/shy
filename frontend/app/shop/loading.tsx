export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory animate-pulse">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="h-8 w-40 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
