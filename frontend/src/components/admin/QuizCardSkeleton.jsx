import React from "react";
import { Skeleton } from "../ui/skeleton";

const QuizCardSkeleton = () => {
  const skeletons = [1, 2, 3,4,5,6,7,8,9,10]; // number of skeleton cards

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {skeletons.map((_, index) => (
        <div
          key={index}
          className="border rounded-2xl shadow-md p-4 bg-white"
        >
          {/* Header row: title + delete button */}
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-6 w-32 rounded bg-gray-300" />
            <Skeleton className="h-8 w-8 rounded-full bg-gray-300" />
          </div>

          {/* Date, Time, Marks row */}
          <div className="flex gap-2 flex-wrap mb-3">
            <Skeleton className="h-6 w-24 rounded-md bg-gray-300" />
            <Skeleton className="h-6 w-20 rounded-md bg-gray-300" />
            <Skeleton className="h-6 w-20 rounded-md bg-gray-300" />
          </div>

          {/* Questions count */}
          <Skeleton className="h-6 w-28 rounded-md mb-3 bg-gray-300" />

          {/* Created on */}
          <Skeleton className="h-4 w-40 rounded mb-4 bg-gray-300" />

          {/* View Result button */}
          <Skeleton className="h-10 w-32 rounded-lg bg-gray-300" />
        </div>
      ))}
    </div>
  );
};

export default QuizCardSkeleton;
