export default function LoadingSkeleton({ count = 10, type = 'card' }: { count?: number; type?: 'card' | 'list' | 'detail' }) {
  if (type === 'detail') {
    return (
      <div className="min-h-screen animate-pulse">
        <div className="h-[50vh] min-h-[300px] bg-[#1a1a2e]" />
        <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-48 md:w-64 aspect-[3/4] bg-[#1a1a2e] rounded-xl mx-auto md:mx-0" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-10 w-3/4 rounded" />
              <div className="flex gap-3">
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="skeleton w-24 h-16 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="skeleton aspect-[2/3] rounded-xl mb-2" />
          <div className="skeleton h-4 rounded w-3/4 mb-1" />
          <div className="skeleton h-3 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
