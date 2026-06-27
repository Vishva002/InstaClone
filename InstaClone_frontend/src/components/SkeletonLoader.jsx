import React from 'react';

export const StorySkeleton = () => {
  return (
    <div className="flex gap-4 p-4 border border-ig-border rounded-lg overflow-x-auto no-scrollbar bg-ig-card mb-6 mt-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="flex flex-col items-center w-[74px] shrink-0 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-2"></div>
          <div className="w-12 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const PostSkeleton = () => {
  return (
    <div className="bg-ig-card border border-ig-border rounded-lg max-w-[470px] w-full mx-auto overflow-hidden mb-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ig-border">
        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="space-y-2">
          <div className="w-24 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="w-16 h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
      {/* Image */}
      <div className="w-full aspect-square bg-zinc-200 dark:bg-zinc-800"></div>
      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
          </div>
          <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        <div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="w-full h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="w-2/3 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="max-w-[935px] w-full mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 border-b border-ig-border pb-11 mb-8">
        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0"></div>
        <div className="flex-1 space-y-4 w-full">
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto md:mx-0"></div>
          <div className="flex justify-center md:justify-start gap-8">
            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto md:mx-0"></div>
            <div className="h-3 w-56 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto md:mx-0"></div>
          </div>
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-3 gap-1 md:gap-7 mt-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="aspect-square bg-zinc-200 dark:bg-zinc-800"></div>
        ))}
      </div>
    </div>
  );
};

export const UserRowSkeleton = () => {
  return (
    <div className="flex items-center justify-between py-2 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="space-y-1.5">
          <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="w-16 h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
      <div className="w-14 h-6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
    </div>
  );
};

export default { StorySkeleton, PostSkeleton, ProfileSkeleton, UserRowSkeleton };
