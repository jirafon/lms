import { ArrowDown, ArrowUp, Edit, Loader2 } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useReorderLectureMutation } from "@/features/api/courseApi";
import { toast } from "sonner";

const getVideoFileName = (videoUrl) => {
  if (!videoUrl) {
    return "No video uploaded yet";
  }

  try {
    const decodedUrl = decodeURIComponent(videoUrl);
    const fileName = decodedUrl.split("/").pop() || "";
    return fileName.replace(/^\d+-/, "").replace(/\+/g, " ");
  } catch {
    return videoUrl.split("/").pop() || "Video uploaded";
  }
};

const Lecture = ({ lecture, courseId, index, totalLectures }) => {
  const navigate = useNavigate();
  const [reorderLecture, { isLoading }] = useReorderLectureMutation();

  const goToUpdateLecture = () => {
    navigate(`${lecture._id}`);
  };

  const handleReorder = async (direction) => {
    try {
      await reorderLecture({ courseId, lectureId: lecture._id, direction }).unwrap();
      toast.success("Orden de capítulos actualizado.");
    } catch (error) {
      toast.error(error?.data?.message || "No se pudo reordenar la lectura.");
    }
  };

  return (
    <div className="flex items-center justify-between bg-[#F7F9FA] dark:bg-[#1F1F1F] px-4 py-2 rounded-md my-2">
      <div>
        <h1 className="font-bold text-gray-800 dark:text-gray-100">
          Lecture - {index+1}: {lecture.lectureTitle}
        </h1>
        {lecture.lectureDescription && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{lecture.lectureDescription}</p>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Video: {getVideoFileName(lecture.videoUrl)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="sm" onClick={goToUpdateLecture}>
          {lecture.videoUrl ? "Replace video" : "Upload video"}
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={isLoading || index === 0} onClick={() => handleReorder("up")}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={isLoading || index === totalLectures - 1} onClick={() => handleReorder("down")}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Edit
          onClick={goToUpdateLecture}
          size={20}
          className=" cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        />
      </div>
    </div>
  );
};

export default Lecture;
