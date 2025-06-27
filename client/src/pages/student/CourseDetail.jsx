import BuyCourseButton from "@/components/BuyCourseButton";
import CourseProgress from "@/components/CourseProgress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import TakeQuiz from "@/components/TakeQuiz";
import axios from "axios";
import CreateQuiz from "@/components/CreateQuiz";

const CourseDetail = () => {
  const params = useParams();
  const { courseId, lectureId } = params;
  const navigate = useNavigate();
  const [showProgress, setShowProgress] = useState(false);
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (data && data.course && data.course.lectures && data.course.lectures.length > 0) {
      const firstLectureId = data.course.lectures[0]._id;
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/quiz/lecture/${firstLectureId}`)
        .then((res) => setQuiz(res.data.quiz))
        .catch(() => setQuiz(null));
    }
  }, [data]);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h>Failed to load course details</h>;

  const { course, purchased } = data;
  console.log(purchased);

  const handleContinueCourse = () => {
    if(purchased){
      navigate(`/course-progress/${courseId}`)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle}
          </h1>
          <p className="text-base md:text-lg">Course Sub-title</p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator.name}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt.split("T")[0]}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents.length}</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>{course.lectures.length} lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span>
                    {purchased ? <PlayCircle size={14} /> : <Lock size={14} />}
                  </span>
                  <p>{lecture.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                <ReactPlayer
                  width="100%"
                  height={"100%"}
                  url={course.lectures[0].videoUrl}
                  controls={true}
                />
              </div>
              {/* Quiz Section for the first lecture */}
              {quiz && (
                <div className="my-6">
                  <h3 className="text-lg font-semibold mb-2">Quiz for this Lecture</h3>
                  <TakeQuiz quizId={quiz._id} />
                </div>
              )}
              <h1>Lecture title</h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">Course Price</h1>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4">
              {purchased ? (
                <>
                  <Button onClick={handleContinueCourse} className="w-full">
                    Continue Course
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowProgress(!showProgress)}
                    className="w-full flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {showProgress ? 'Ocultar Progreso' : 'Ver Progreso'}
                  </Button>
                </>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Course Progress Section */}
      {purchased && showProgress && (
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <CourseProgress courseId={courseId} />
        </div>
      )}

      <CreateQuiz courseId={courseId} lectureId={lectureId} />
    </div>
  );
};

export default CourseDetail;
