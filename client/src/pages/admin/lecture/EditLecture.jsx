import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link, useParams } from "react-router-dom";
import LectureTab from "./LectureTab";
import QuizManager from "@/components/QuizManager";
import { useGetLectureByIdQuery } from "@/features/api/courseApi";

const EditLecture = () => {
  const params = useParams();
  const { courseId, lectureId } = params;
  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Link to={`/admin/course/${courseId}/lecture`}>
            <Button size="icon" variant="outline" className="rounded-full">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <h1 className="font-bold text-xl">Update Your Lecture</h1>
        </div>
      </div>
      <LectureTab />
      <QuizManager 
        courseId={courseId} 
        lectureId={lectureId} 
        lectureName={lecture?.lectureTitle || 'Lectura'}
      />
    </div>
  );
};

export default EditLecture;
