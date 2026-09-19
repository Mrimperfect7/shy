export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-1/2 bg-gray-100 rounded mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
