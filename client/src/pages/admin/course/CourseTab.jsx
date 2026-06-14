import RichTextEditor from "@/components/RichTextEditor";
import { resolveCourseThumbnail } from "@/utils/mediaUrl";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
} from "@/features/api/courseApi";
import { COURSE_CATEGORY_OPTIONS } from "@/constants/courseCategories";
import { Loader2, MoreVertical, Settings, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const VALID_COURSE_LEVELS = ["Beginner", "Medium", "Advance"];
const DEFAULT_FLOW_CURRENCY = "CLP";

const CourseTab = () => {
  const { t } = useTranslation();
  
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    flowPricingEnabled: false,
    flowPricingPrice: "",
    flowPricingCurrency: "CLP",
    courseThumbnail: "",
  });

  const params = useParams();
  const courseId = params.courseId;
  const { data: courseByIdData, isLoading: courseByIdLoading , refetch} =
    useGetCourseByIdQuery(courseId);

    const [publishCourse] = usePublishCourseMutation();
    const [removeCourse, { isLoading: isRemoving }] = useRemoveCourseMutation();
 
  useEffect(() => {
    if (courseByIdData?.course) { 
        const course = courseByIdData?.course;
      const configuredPrice = course.flowPricing?.price ?? course.coursePrice ?? "";
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: configuredPrice,
        flowPricingEnabled: Boolean(course.flowPricing?.enabled ?? configuredPrice),
        flowPricingPrice: configuredPrice,
        flowPricingCurrency: course.flowPricing?.currency || DEFAULT_FLOW_CURRENCY,
        courseThumbnail: "",
      });
    }
  }, [courseByIdData]);

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const navigate = useNavigate();

  const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;

    if (name === "coursePrice") {
      setInput({
        ...input,
        coursePrice: value,
        flowPricingPrice: value,
        flowPricingEnabled: value !== "" && value !== "undefined",
        flowPricingCurrency: DEFAULT_FLOW_CURRENCY,
      });
      return;
    }

    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };
  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };
  const selectFlowCurrency = (value) => {
    setInput({ ...input, flowPricingCurrency: value });
  };
  const toggleFlowPricing = (event) => {
    setInput({ ...input, flowPricingEnabled: event.target.checked });
  };
  // get file
  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('course.please_select_valid_image'));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('course.file_too_large'));
        return;
      }
      
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async () => {
    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description);
    formData.append("category", input.category);

    if (VALID_COURSE_LEVELS.includes(input.courseLevel)) {
      formData.append("courseLevel", input.courseLevel);
    }
    
    const normalizedPrice =
      input.coursePrice !== "" &&
      input.coursePrice !== "undefined" &&
      !isNaN(Number(input.coursePrice))
        ? Number(input.coursePrice)
        : null;

    if (normalizedPrice !== null) {
      formData.append("coursePrice", normalizedPrice);
    }

    formData.append("flowPricingEnabled", String(normalizedPrice !== null));
    formData.append("flowPricingCurrency", DEFAULT_FLOW_CURRENCY);
    if (normalizedPrice !== null) {
      formData.append("flowPricingPrice", normalizedPrice);
    }
    
    // Only append courseThumbnail if a new file is selected
    if (input.courseThumbnail && input.courseThumbnail instanceof File) {
      formData.append("courseThumbnail", input.courseThumbnail);
    }

    await editCourse({ formData, courseId });
  };

  const publishStatusHandler = async (action) => {
    try {
      const response = await publishCourse({courseId, query:action});
      if(response.data){
        refetch();
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(t('course.failed_to_publish_course'));
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setDeleteConfirmText("");
  };

  const removeCourseHandler = async () => {
    const expectedText = courseByIdData?.course?.courseTitle || "";
    
    if (deleteConfirmText !== expectedText) {
      toast.error("El texto no coincide con el nombre del curso");
      return;
    }

    try {
      const response = await removeCourse(courseId);
      if (response.data) {
        toast.success(response.data.message || t('course.course_removed_successfully'));
        navigate("/admin/course");
      }
    } catch (error) {
      toast.error(error.data?.message || t('course.error_removing_course'));
    } finally {
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || t('course.course_update_success'));
    }
    if (error) {
      toast.error(error.data.message || t('course.failed_to_update_course'));
    }
  }, [isSuccess, error, data?.message, t]);

  if(courseByIdLoading) return <h1>{t('course.loading')}</h1>

  const existingThumbnailSrc = resolveCourseThumbnail(courseByIdData?.course);
 
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>{t('course.basic_course_information')}</CardTitle>
          <CardDescription>
            {t('course.make_changes_description')}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button disabled={courseByIdData?.course.lectures.length === 0} variant="outline" onClick={()=> publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}>
            {courseByIdData?.course.isPublished ? t('course.unpublished') : t('course.publish_course')}
          </Button>
          
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
                disabled={isRemoving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isRemoving ? 'Eliminando...' : 'Eliminar curso'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-5">
          <div>
            <Label>{t('course.title')}</Label>
            <Input
              type="text"
              name="courseTitle"
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Fullstack developer"
            />
          </div>
          <div>
            <Label>{t('course.subtitle')}</Label>
            <Input
              type="text"
              name="subTitle"
              value={input.subTitle}
              onChange={changeEventHandler}
              placeholder="Ex. Become a Fullstack developer from zero to hero in 2 months"
            />
          </div>
          <div>
            <Label>{t('course.description')}</Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>
          <div className="flex items-center gap-5">
            <div>
              <Label>{t('course.category')}</Label>
              <Select
                defaultValue={input.category}
                onValueChange={selectCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('course.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('course.category')}</SelectLabel>
                    {COURSE_CATEGORY_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {t(item.labelKey, { defaultValue: item.value })}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('course.course_level')}</Label>
              <Select
                value={VALID_COURSE_LEVELS.includes(input.courseLevel) ? input.courseLevel : undefined}
                onValueChange={selectCourseLevel}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('course.course_level')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('course.course_level')}</SelectLabel>
                    <SelectItem value="Beginner">{t('course.beginner')}</SelectItem>
                    <SelectItem value="Medium">{t('course.medium')}</SelectItem>
                    <SelectItem value="Advance">{t('course.advance')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('course.price_usd')}</Label>
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                min="10000"
                step="1"
                placeholder="29990"
                className="w-fit"
              />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <Label className="text-base">Flow</Label>
            <p className="mt-1 text-sm text-slate-500">
              Este precio se configura una sola vez y se usa como precio actual en Flow y en las tarjetas del curso en CLP.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-700">
              Moneda: {DEFAULT_FLOW_CURRENCY}
            </p>
          </div>
          <div>
            <Label>{t('course.course_thumbnail')}</Label>
            <Input
              type="file"
              onChange={selectThumbnail}
              accept="image/*"
              className="w-fit"
            />
            {(previewThumbnail || existingThumbnailSrc) && (
              <div className="mt-2">
                <img
                  src={previewThumbnail || existingThumbnailSrc}
                  className="w-64 h-32 object-cover rounded-md border"
                  alt="Course Thumbnail"
                />
                {previewThumbnail && (
                  <p className="text-sm text-green-600 mt-1">{t('course.new_image_selected')}</p>
                )}
              </div>
            )}
          </div>
          <div>
            <Button onClick={() => navigate("/admin/course")} variant="outline">
              {t('course.cancel')}
            </Button>
            <Button disabled={isLoading} onClick={updateCourseHandler}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('course.please_wait')}
                </>
              ) : (
                t('course.save')
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Dialog de confirmación para eliminar curso */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ Eliminar Curso Permanentemente</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Esta acción <strong>NO SE PUEDE DESHACER</strong>.</p>
              <p>Se eliminará:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>El curso completo</li>
                <li>Todas las lecturas</li>
                <li>Todos los quizzes</li>
                <li>Todo el progreso de estudiantes</li>
                <li>Todas las compras asociadas</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmText" className="text-sm font-medium">
                Para confirmar, escribe el nombre exacto del curso:
              </Label>
              <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-100 rounded">
                {courseByIdData?.course?.courseTitle}
              </p>
              <Input
                id="confirmText"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Escribe el nombre del curso aquí"
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
              onClick={removeCourseHandler}
              disabled={deleteConfirmText !== courseByIdData?.course?.courseTitle || isRemoving}
            >
              {isRemoving ? (
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

export default CourseTab;
