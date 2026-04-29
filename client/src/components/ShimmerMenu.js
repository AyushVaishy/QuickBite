import React from 'react';

const ShimmerMenuItemRow = () => (
  <div className="flex justify-between items-center p-4 border-b">
    <div className="flex-1 pr-4">
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
    </div>
    <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
  </div>
);

const ShimmerMenuCategory = () => (
  <div className="mb-8">
    <div className="h-5 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
    <ShimmerMenuItemRow />
    <ShimmerMenuItemRow />
    <ShimmerMenuItemRow />
  </div>
);

const ShimmerMenu = () => {
  return (
    <div>
      <div className="w-full h-[200px] mt-[90px] bg-gradient-to-r from-muted to-muted animate-pulse" />
      <div className="max-w-screen-2xl mx-auto py-12 px-16">
        <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-10 animate-pulse" />
        <ShimmerMenuCategory />
        <ShimmerMenuCategory />
        <ShimmerMenuCategory />
      </div>
    </div>
  );
};

export default ShimmerMenu;
