import React from 'react';

export const TimelineSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 my-8">
      {/* State Summary Skeleton */}
      <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Nodes Skeleton */}
      <div className="relative pl-6 sm:pl-8 space-y-8 border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative">
            {/* Circle Node */}
            <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-950"></div>
            
            {/* Card Content */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineSkeleton;
