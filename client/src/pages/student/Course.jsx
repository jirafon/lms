import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Course = ({course}) => {
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Debug logging
  console.log("🖼️ Course component data:", {
    courseTitle: course.courseTitle,
    courseThumbnail: course.courseThumbnail,
    creatorPhotoUrl: course.creator?.photoUrl,
    creatorName: course.creator?.name
  });

  // Test image accessibility
  useEffect(() => {
    if (course.courseThumbnail) {
      console.log("🖼️ Testing course thumbnail:", course.courseThumbnail);
      const testImg = new Image();
      testImg.onload = () => {
        console.log("✅ Course thumbnail loads successfully:", course.courseThumbnail);
      };
      testImg.onerror = () => {
        console.log("❌ Course thumbnail failed to load:", course.courseThumbnail);
        setImageError(true);
      };
      testImg.src = course.courseThumbnail;
    }

    if (course.creator?.photoUrl) {
      console.log("👤 Testing creator avatar:", course.creator.photoUrl);
      const testAvatar = new Image();
      testAvatar.onload = () => {
        console.log("✅ Creator avatar loads successfully:", course.creator.photoUrl);
      };
      testAvatar.onerror = () => {
        console.log("❌ Creator avatar failed to load:", course.creator.photoUrl);
        setAvatarError(true);
      };
      testAvatar.src = course.creator.photoUrl;
    }
  }, [course.courseThumbnail, course.creator?.photoUrl]);

  const handleImageError = () => {
    console.log("❌ Course thumbnail failed to load:", course.courseThumbnail);
    setImageError(true);
  };

  const handleAvatarError = () => {
    console.log("❌ Creator avatar failed to load:", course.creator?.photoUrl);
    setAvatarError(true);
  };

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
            <span>₹{course.coursePrice}</span>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};

export default Course;
