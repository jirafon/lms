import RichTextEditor from "@/components/RichTextEditor";
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
import { Loader2, MoreVertical, Settings, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        flowPricingEnabled: Boolean(course.flowPricing?.enabled),
        flowPricingPrice: course.flowPricing?.price ?? "",
        flowPricingCurrency: course.flowPricing?.currency || "CLP",
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
    formData.append("courseLevel", input.courseLevel);
    
    // Only append coursePrice if it has a valid numeric value
    if (input.coursePrice && input.coursePrice !== "" && input.coursePrice !== "undefined" && !isNaN(Number(input.coursePrice))) {
      formData.append("coursePrice", Number(input.coursePrice));
    }

    formData.append("flowPricingEnabled", String(Boolean(input.flowPricingEnabled)));
    formData.append("flowPricingCurrency", input.flowPricingCurrency || "CLP");
    if (
      input.flowPricingPrice !== "" &&
      input.flowPricingPrice !== "undefined" &&
      !isNaN(Number(input.flowPricingPrice))
    ) {
      formData.append("flowPricingPrice", Number(input.flowPricingPrice));
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
                    
                    {/* Desarrollo Web */}
                    <SelectItem value="Next JS">Next JS</SelectItem>
                    <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                    <SelectItem value="Fullstack Development">Fullstack Development</SelectItem>
                    <SelectItem value="MERN Stack Development">MERN Stack Development</SelectItem>
                    <SelectItem value="Javascript">Javascript</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                    
                    {/* Ciencia de Datos */}
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    
                    {/* DevOps y Bases de Datos */}
                    <SelectItem value="Docker">Docker</SelectItem>
                    <SelectItem value="MongoDB">MongoDB</SelectItem>
                    
                    {/* GRDC - Gobierno, Riesgo, Datos y Cumplimiento */}
                    <SelectItem value="Governance">Gobierno Corporativo</SelectItem>
                    <SelectItem value="Risk Management">Gestión de Riesgos</SelectItem>
                    <SelectItem value="Data Governance">Gobierno de Datos</SelectItem>
                    <SelectItem value="Compliance">Cumplimiento Normativo</SelectItem>
                    <SelectItem value="Internal Audit">Auditoría Interna</SelectItem>
                    <SelectItem value="Regulatory Compliance">Cumplimiento Regulatorio</SelectItem>
                    
                    {/* Ética y Responsabilidad */}
                    <SelectItem value="Business Ethics">Ética Empresarial</SelectItem>
                    <SelectItem value="Corporate Social Responsibility">Responsabilidad Social Corporativa</SelectItem>
                    <SelectItem value="Anti-Corruption">Anticorrupción</SelectItem>
                    <SelectItem value="Whistleblowing">Protección al Denunciante</SelectItem>
                    
                    {/* Coaching y Liderazgo Ejecutivo */}
                    <SelectItem value="Executive Coaching">Coaching Ejecutivo</SelectItem>
                    <SelectItem value="Leadership Development">Desarrollo de Liderazgo</SelectItem>
                    <SelectItem value="Board Governance">Gobierno de Consejos</SelectItem>
                    <SelectItem value="Strategic Leadership">Liderazgo Estratégico</SelectItem>
                    <SelectItem value="Change Management">Gestión del Cambio</SelectItem>
                    <SelectItem value="Executive Communication">Comunicación Ejecutiva</SelectItem>
                    
                    {/* Alta Dirección */}
                    <SelectItem value="C-Suite Leadership">Liderazgo C-Suite</SelectItem>
                    <SelectItem value="Board of Directors">Consejo de Administración</SelectItem>
                    <SelectItem value="Corporate Strategy">Estrategia Corporativa</SelectItem>
                    <SelectItem value="Financial Leadership">Liderazgo Financiero</SelectItem>
                    <SelectItem value="Digital Transformation">Transformación Digital</SelectItem>
                    
                    {/* Cumplimiento Específico */}
                    <SelectItem value="SOX Compliance">Cumplimiento SOX</SelectItem>
                    <SelectItem value="GDPR Compliance">Cumplimiento GDPR</SelectItem>
                    <SelectItem value="ISO Standards">Estándares ISO</SelectItem>
                    <SelectItem value="Cybersecurity Compliance">Cumplimiento Ciberseguridad</SelectItem>
                    
                    {/* Gestión de Riesgos */}
                    <SelectItem value="Operational Risk">Riesgo Operacional</SelectItem>
                    <SelectItem value="Financial Risk">Riesgo Financiero</SelectItem>
                    <SelectItem value="Strategic Risk">Riesgo Estratégico</SelectItem>
                    <SelectItem value="Reputational Risk">Riesgo Reputacional</SelectItem>
                    
                    {/* Desarrollo Organizacional */}
                    <SelectItem value="Organizational Development">Desarrollo Organizacional</SelectItem>
                    <SelectItem value="Talent Management">Gestión del Talento</SelectItem>
                    <SelectItem value="Succession Planning">Planificación de Sucesión</SelectItem>
                    <SelectItem value="Performance Management">Gestión del Desempeño</SelectItem>
                    
                    {/* MPD, Privacidad e Integridad */}
                    <SelectItem value="MPD">MPD</SelectItem>
                    <SelectItem value="Data Privacy">Privacidad de Datos</SelectItem>
                    <SelectItem value="Integrity">Integridad</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('course.course_level')}</Label>
              <Select
                defaultValue={input.courseLevel}
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
                placeholder="29"
                className="w-fit"
              />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-base">Flow checkout pricing</Label>
                <p className="mt-1 text-sm text-slate-500">
                  Set a dedicated Flow price per course in the payment currency, or leave this disabled and use backend conversion.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(input.flowPricingEnabled)}
                  onChange={toggleFlowPricing}
                />
                Enable Flow pricing
              </label>
            </div>
            <div className="mt-4 flex items-center gap-5">
              <div>
                <Label>Flow amount</Label>
                <Input
                  type="number"
                  name="flowPricingPrice"
                  value={input.flowPricingPrice}
                  onChange={changeEventHandler}
                  placeholder="29000"
                  className="w-fit"
                />
              </div>
              <div>
                <Label>Flow currency</Label>
                <Select
                  value={input.flowPricingCurrency}
                  onValueChange={selectFlowCurrency}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Flow currency</SelectLabel>
                      <SelectItem value="CLP">CLP</SelectItem>
                      <SelectItem value="UF">UF</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div>
            <Label>{t('course.course_thumbnail')}</Label>
            <Input
              type="file"
              onChange={selectThumbnail}
              accept="image/*"
              className="w-fit"
            />
            {(previewThumbnail || courseByIdData?.course?.courseThumbnail) && (
              <div className="mt-2">
                <img
                  src={previewThumbnail || courseByIdData?.course?.courseThumbnail}
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
