import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import axios from "axios";
import { Loader2, MoreVertical, Settings, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

//const MEDIA_API = "http://localhost:3010/api/v1/media";

const MEDIA_API = import.meta.env.VITE_API_BASE_URL + "/media/";


const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDescription, setLectureDescription] = useState("");
  const [uploadVideInfo, setUploadVideoInfo] = useState(null);
  const [supportMaterials, setSupportMaterials] = useState([]);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const params = useParams();
  const { courseId, lectureId } = params;
  const navigate = useNavigate();

  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(()=>{
    if(lecture){
      setLectureTitle(lecture.lectureTitle);
      setLectureDescription(lecture.lectureDescription || "");
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo(
        lecture.videoUrl
          ? {
              videoUrl: lecture.videoUrl,
              publicId: lecture.publicId,
            }
          : null
      );
      setSupportMaterials(lecture.supportMaterials || []);
    }
  },[lecture])

  const [edtiLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();
    const [removeLecture,{data:removeData, isLoading:removeLoading, isSuccess:removeSuccess}] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("🎥 Video upload started from frontend");
      console.log("📁 File name:", file.name);
      console.log("📏 File size:", file.size, "bytes");
      console.log("🔧 File type:", file.type);
      
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        console.log("🚀 Sending video to server...");
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            const progress = Math.round((loaded * 100) / total);
            setUploadProgress(progress);
            console.log(`📊 Upload progress: ${progress}%`);
          },
        });

        if (res.data.success) {
          console.log("✅ Video upload successful");
          console.log("🔗 Video URL:", res.data.data.url);
          console.log("🔑 S3 Key:", res.data.data.key);
          
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.error("❌ Video upload failed");
        console.error("🔍 Error response:", error.response?.data);
        console.error("📋 Full error:", error);
        
        toast.error("Video upload failed");
      } finally {
        setMediaProgress(false);
        console.log("🏁 Video upload process completed");
      }
    }
  };

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
      toast.error(uploadError.response?.data?.message || "Material upload failed");
    } finally {
      setIsUploadingMaterial(false);
      e.target.value = "";
    }
  };

  const removeSupportMaterial = (materialUrl) => {
    setSupportMaterials((current) => current.filter((material) => material.url !== materialUrl));
  };

  const editLectureHandler = async () => {
    console.log({ lectureTitle, lectureDescription, uploadVideInfo, supportMaterials, isFree, courseId, lectureId });

    await edtiLecture({
      lectureTitle,
      lectureDescription,
      videoInfo:uploadVideInfo,
      supportMaterials,
      isPreviewFree:isFree,
      courseId,
      lectureId,
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setDeleteConfirmText("");
  };

  const removeLectureHandler = async () => {
    const expectedText = lecture?.lectureTitle || "";
    
    if (deleteConfirmText !== expectedText) {
      toast.error("El texto no coincide con el nombre de la lectura");
      return;
    }

    try {
      await removeLecture(lectureId);
      toast.success("Lectura eliminada exitosamente");
      navigate(`/admin/course/${courseId}/lecture`);
    } catch (error) {
      toast.error("Error al eliminar la lectura");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(()=>{
    if(removeSuccess){
      toast.success(removeData.message);
    }
  },[removeSuccess])

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración avanzada
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteClick} 
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={removeLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {removeLoading ? 'Eliminando...' : 'Eliminar lectura'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        <div className="mt-5">
          <Label>Description</Label>
          <textarea
            value={lectureDescription}
            onChange={(e) => setLectureDescription(e.target.value)}
            placeholder="Short description for this lecture"
            className="mt-2 flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="my-5">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            placeholder="Ex. Introduction to Javascript"
            className="w-fit"
          />
        </div>
        <div className="my-5">
          <Label>Downloadable files</Label>
          <Input
            type="file"
            multiple
            onChange={supportMaterialChangeHandler}
            className="w-fit"
          />
          {isUploadingMaterial && <p className="mt-2 text-sm text-muted-foreground">Uploading file...</p>}
          {supportMaterials.length > 0 && (
            <div className="mt-3 space-y-2">
              {supportMaterials.map((material) => (
                <div key={material.url} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <a href={material.url} target="_blank" rel="noreferrer" className="truncate text-blue-600 hover:underline">
                    {material.name}
                  </a>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSupportMaterial(material.url)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 my-5">
          <Switch checked={isFree} onCheckedChange={setIsFree} id="airplane-mode" />
          <Label htmlFor="airplane-mode">Is this video FREE</Label>
        </div>

        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}

        <div className="mt-4">
          <Button disabled={isLoading || isUploadingMaterial} onClick={editLectureHandler}>
              {
                isLoading ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Please wait
                </> : "Update Lecture"
              }
            
          </Button>
        </div>
      </CardContent>

      {/* Dialog de confirmación para eliminar lectura */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ Eliminar Lectura Permanentemente</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Esta acción <strong>NO SE PUEDE DESHACER</strong>.</p>
              <p>Se eliminará:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>La lectura completa</li>
                <li>El video asociado</li>
                <li>El quiz de esta lectura</li>
                <li>Todo el progreso de estudiantes en esta lectura</li>
                <li>Todos los intentos de quiz</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmText" className="text-sm font-medium">
                Para confirmar, escribe el nombre exacto de la lectura:
              </Label>
              <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-100 rounded">
                {lecture?.lectureTitle}
              </p>
              <Input
                id="confirmText"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Escribe el nombre de la lectura aquí"
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={removeLectureHandler}
              disabled={deleteConfirmText !== lecture?.lectureTitle || removeLoading}
            >
              {removeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar Permanentemente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LectureTab;
