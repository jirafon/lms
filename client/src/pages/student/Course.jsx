import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookCheck, Clock3 } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const formatDate = (value) => {
  if (!value) {
    return "Sin actividad reciente";
  }

  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Course = ({course, progressSummary}) => {
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const courseProgress = progressSummary?.progress || 0;

  return (
    <Link to={`/course-detail/${course._id}`}>
    <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
      <div className="relative">
        <img
          src={imageError ? "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Course+Image" : course.courseThumbnail}
          alt="course"
          className="w-full h-36 object-cover rounded-t-lg"
          onError={handleImageError}
        />
      </div>
      <CardContent className="px-5 py-4 space-y-3">
        <h1 className="hover:underline font-bold text-lg truncate">
          {course.courseTitle}
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={avatarError ? "https://github.com/shadcn.png" : (course.creator?.photoUrl || "https://github.com/shadcn.png")} 
                alt="@shadcn" 
                onError={handleAvatarError}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className="font-medium text-sm">{course.creator?.name}</h1>
          </div>
          <Badge className={'bg-blue-600 text-white px-2 py-1 text-xs rounded-full'}>
            {course.courseLevel}
          </Badge>
        </div>
        <div className="text-lg font-bold">
          <span>US${course.coursePrice} por usuario</span>
        </div>
        {progressSummary && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Tu avance</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} className="h-2" />
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1">
                <BookCheck className="h-3.5 w-3.5" />
                {progressSummary.completedQuizzes}/{progressSummary.totalQuizzes} quizzes
              </div>
              <div className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDate(progressSummary.lastAccessedAt)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
};

export default Course;
