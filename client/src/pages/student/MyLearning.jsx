import React from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetUserProgressQuery } from "@/features/api/courseProgressApi";

const MyLearning = () => { 
  const {data, isLoading, error} = useLoadUserQuery();
  const { data: progressData } = useGetUserProgressQuery();

  const myLearning = data?.user?.enrolledCourses || [];
  const progressByCourseId = new Map(
    (progressData?.progress || []).map((entry) => [String(entry.courseId?._id || entry.courseId), entry])
  );

  return (
    <div className="max-w-4xl mx-auto my-10 px-4 md:px-0">
      <h1 className="font-bold text-2xl">MY LEARNING</h1>
      <div className="my-5">
        {isLoading ? (
          <MyLearningSkeleton />
        ) : error ? (
          <div className="text-red-500">
            <p>Error loading courses: {error?.message || 'Unknown error'}</p>
            <p>Please try refreshing the page.</p>
          </div>
        ) : myLearning.length === 0 ? (
          <p>You are not enrolled in any course.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myLearning.map((course, index) => (
              <Course
                key={index}
                course={course}
                progressSummary={progressByCourseId.get(String(course._id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

// Skeleton component for loading state
const MyLearningSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-300 dark:bg-gray-700 rounded-lg h-40 animate-pulse"
      ></div>
    ))}
  </div>
);
