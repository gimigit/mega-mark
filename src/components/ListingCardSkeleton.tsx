export default function ListingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] animate-shimmer" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 animate-shimmer rounded w-3/4" />
        <div className="h-7 animate-shimmer rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 w-14 animate-shimmer rounded" />
          <div className="h-6 w-16 animate-shimmer rounded" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-dark-700">
          <div className="h-3 w-20 animate-shimmer rounded" />
          <div className="h-3 w-16 animate-shimmer rounded" />
        </div>
      </div>
    </div>
  )
}
