const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden animate-pulse">
    <div className="w-full h-[170px] bg-gray-200 dark:bg-gray-700" />
    <div className="p-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
      <div className="flex justify-between">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-28 bg-gray-200 rounded-full mx-auto mt-3" />
    </div>
  </div>
);

const Shimmer = () => {
  return (
    <div className="max-w-6xl mx-auto px-12 py-8 mt-[70px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default Shimmer;
