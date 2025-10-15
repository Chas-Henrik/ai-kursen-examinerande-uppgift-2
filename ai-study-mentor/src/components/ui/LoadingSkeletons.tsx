"use client";

// Chat Message Skeleton
export function ChatMessageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-4 p-4">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

// Multiple Chat Messages Skeleton
export function ChatMessagesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <ChatMessageSkeleton key={index} />
      ))}
    </div>
  );
}

// Document List Skeleton
export function DocumentListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-3">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
                <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Session List Skeleton (for sidebar)
export function SessionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Study Question Skeleton
export function StudyQuestionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        {/* Question header */}
        <div className="mb-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>

        {/* Question content */}
        <div className="mb-6">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-full mb-4"></div>

          {/* Answer options */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md"
              >
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

// File Upload Skeleton
export function FileUploadSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-4"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

// Generic Card Skeleton
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6 mb-4"></div>
        <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="animate-pulse">
      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
        {/* Table header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="p-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner({
  size = "md",
  text,
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
      ></div>
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
}

// Page Loading Skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
