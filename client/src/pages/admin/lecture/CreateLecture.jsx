import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Lecture from "./Lecture";

const MEDIA_API = import.meta.env.VITE_API_BASE_URL + "/media/";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDescription, setLectureDescription] = useState("");
  const [supportMaterials, setSupportMaterials] = useState([]);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const [createLecture, { data, isLoading, isSuccess, error }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery(courseId);

  const supportMaterialChangeHandler = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }
    setIsUploadingMaterial(true);

    try {
      const uploadedMaterials = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post(`${MEDIA_API}/upload-support-material`, formData);
        if (res.data.success) {
          uploadedMaterials.push({
            name: file.name,
            url: res.data.data.url,
            key: res.data.data.key,
          });
        }
      }

      if (uploadedMaterials.length > 0) {
        setSupportMaterials((current) => [...current, ...uploadedMaterials]);
        toast.success(`${uploadedMaterials.length} file(s) uploaded successfully.`);
      }
    } catch (uploadError) {
      toast.error(uploadError.response?.data?.message || "Failed to upload support material");
    } finally {
      setIsUploadingMaterial(false);
      e.target.value = "";
    }
  };

  const removeSupportMaterial = (materialUrl) => {
    setSupportMaterials((current) => current.filter((material) => material.url !== materialUrl));
  };

  const createLectureHandler = async () => {
    await createLecture({ lectureTitle, lectureDescription, supportMaterials, courseId });
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message);
      setLectureTitle("");
      setLectureDescription("");
      setSupportMaterials([]);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  console.log(lectureData);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Let's add lectures, add some basic details for your new lecture
        </h1>
        <p className="text-sm">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus,
          laborum!
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Your Title Name"
          />
        </div>
        <div>
          <Label>Description</Label>
          <textarea
            value={lectureDescription}
            onChange={(e) => setLectureDescription(e.target.value)}
            placeholder="Short description for this lecture"
            className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <Label>Downloadable files</Label>
          <Input
            type="file"
            multiple
            onChange={supportMaterialChangeHandler}
            className="w-fit"
          />
          {isUploadingMaterial && <p className="text-sm text-muted-foreground mt-2">Uploading file...</p>}
          {supportMaterials.length > 0 && (
            <div className="mt-3 space-y-2">
              {supportMaterials.map((material) => (
                <div key={material.url} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <span className="truncate">{material.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSupportMaterial(material.url)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
          >
            Back to course
          </Button>
          <Button disabled={isLoading || isUploadingMaterial} onClick={createLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create lecture"
            )}
          </Button>
        </div>
        <div className="mt-10">
          {lectureLoading ? (
            <p>Loading lectures...</p>
          ) : lectureError ? (
            <p>Failed to load lectures.</p>
          ) : lectureData.lectures.length === 0 ? (
            <p>No lectures availabe</p>
          ) : (
            lectureData.lectures.map((lecture, index) => (
              <Lecture
                key={lecture._id}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
