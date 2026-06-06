export default function LoadingSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton aspect-[2/3] rounded-xl" />
          <div className="skeleton h-4 rounded w-3/4" />
          <div className="skeleton h-3 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
