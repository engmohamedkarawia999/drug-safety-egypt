export default function SkeletonLoader() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Drug interaction skeleton */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            </div>

            {/* Another skeleton */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
            </div>

            {/* Another skeleton */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
