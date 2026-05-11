import React from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetUserProgressQuery } from "@/features/api/courseProgressApi";
import { useTranslation } from "react-i18next";

const MyLearning = () => { 
  const { t } = useTranslation();
  const {data, isLoading, error} = useLoadUserQuery();
  const { data: progressData } = useGetUserProgressQuery();

  const myLearning = data?.user?.enrolledCourses || [];
  const progressByCourseId = new Map(
    (progressData?.progress || []).map((entry) => [String(entry.courseId?._id || entry.courseId), entry])
  );

  return (
    <div className="max-w-6xl mx-auto my-10 px-4 md:px-0">
      <h1 className="font-bold text-2xl">{t("navigation.my_learning")}</h1>
      <div className="my-5">
        {isLoading ? (
          <MyLearningSkeleton />
        ) : error ? (
          <div className="text-red-500">
            <p>Error loading courses: {error?.message || 'Unknown error'}</p>
            <p>Please try refreshing the page.</p>
          </div>
        ) : myLearning.length === 0 ? (
          <p>{t("student.no_enrolled_courses")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {myLearning.map((course, index) => (
              <Course
                key={index}
                course={course}
                progressSummary={progressByCourseId.get(String(course._id))}
                size="large"
                showPrice={false}
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
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-300 dark:bg-gray-700 rounded-lg h-56 animate-pulse"
      ></div>
    ))}
  </div>
);
