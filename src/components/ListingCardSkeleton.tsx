export default function ListingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl overflow-hidden">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200 dark:bg-dark-700 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 dark:bg-dark-700 rounded animate-pulse w-3/4" />

        {/* Price */}
        <div className="h-7 bg-gray-200 dark:bg-dark-700 rounded animate-pulse w-1/2" />

        {/* Specs */}
        <div className="flex gap-2">
          <div className="h-6 w-14 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-dark-700">
          <div className="h-3 w-20 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
