import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollStudentByEmailMutation, useGetCreatorCourseQuery, useGetStudentsDashboardQuery, useRemoveStudentFromDashboardMutation, useUnenrollStudentFromCourseMutation } from "@/features/api/courseApi";
import { Download, Search, Users } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StudentsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedContract = String(searchParams.get("idcontrato") || "").trim();
  const [contractSearchTerm, setContractSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrollmentEmail, setEnrollmentEmail] = useState("");
  const [enrollmentCourseId, setEnrollmentCourseId] = useState("");
  const { data, isLoading, isError, error, isFetching } = useGetStudentsDashboardQuery(selectedContract);
  const { data: creatorCoursesData } = useGetCreatorCourseQuery();
  const [enrollStudentByEmail, { isLoading: isEnrollingStudent }] = useEnrollStudentByEmailMutation();
  const [unenrollStudentFromCourse, { isLoading: isRemovingEnrollment }] = useUnenrollStudentFromCourseMutation();
  const [removeStudentFromDashboard, { isLoading: isRemovingStudent }] = useRemoveStudentFromDashboardMutation();

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedContract]);

  const handleClear = () => {
    setContractSearchTerm("");
    setSearchParams({});
  };

  const handleContractChange = (value) => {
    if (!value || value === "all") {
      setSearchParams({});
      return;
    }

    setSearchParams({ idcontrato: value });
  };

  const handleExportCsv = () => {
    const students = data?.students || [];
    if (!students.length) {
      return;
    }

    const rows = [
      ["Name", "Email", "Client", "ID Contract", "Total Courses", "Courses", "Last Purchase"],
      ...students.map((student) => [
        student.name,
        student.email,
        student.clientName,
        student.idcontrato,
        student.totalCourses,
        (student.enrolledCourses || []).map((course) => course.title).join(" | "),
        formatDate(student.lastPurchaseAt),
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const suffix = selectedContract ? `-${selectedContract}` : "";

    link.href = url;
    link.setAttribute("download", `students-dashboard${suffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleEnrollDialogChange = (isOpen) => {
    setEnrollDialogOpen(isOpen);
    if (!isOpen) {
      setEnrollmentEmail("");
      setEnrollmentCourseId("");
    }
  };

  const handleEnrollStudent = async () => {
    const trimmedEmail = enrollmentEmail.trim().toLowerCase();

    if (!trimmedEmail || !enrollmentCourseId) {
      toast.error("Debes ingresar el email y seleccionar un curso.");
      return;
    }

    try {
      const response = await enrollStudentByEmail({
        email: trimmedEmail,
        courseId: enrollmentCourseId,
      }).unwrap();

      toast.success(response?.message || "Estudiante inscrito exitosamente.");
      handleEnrollDialogChange(false);
    } catch (enrollError) {
      toast.error(enrollError?.data?.message || "No se pudo inscribir al estudiante.");
    }
  };

  const handleRemoveEnrollment = async (course) => {
    if (!selectedStudent?.id || !course?.id) {
      return;
    }

    try {
      const response = await unenrollStudentFromCourse({
        studentId: selectedStudent.id,
        courseId: course.id,
      }).unwrap();

      toast.success(response?.message || "Inscripción eliminada.");

      setSelectedStudent((currentStudent) => {
        if (!currentStudent) {
          return currentStudent;
        }

        const updatedCourses = (currentStudent.enrolledCourses || []).filter(
          (enrolledCourse) => enrolledCourse.id !== course.id
        );

        if (!updatedCourses.length) {
          return null;
        }

        return {
          ...currentStudent,
          enrolledCourses: updatedCourses,
          totalCourses: updatedCourses.length,
        };
      });
    } catch (removeError) {
      toast.error(removeError?.data?.message || "No se pudo eliminar la inscripción.");
    }
  };

  const handleRemoveStudent = async (event, student) => {
    event.stopPropagation();

    if (!student?.id) {
      return;
    }

    const confirmed = window.confirm(`Eliminar a ${student.name} de todos tus cursos?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await removeStudentFromDashboard({ studentId: student.id }).unwrap();
      toast.success(response?.message || "Estudiante eliminado.");

      setSelectedStudent((currentStudent) => {
        if (!currentStudent || currentStudent.id !== student.id) {
          return currentStudent;
        }

        return null;
      });
    } catch (removeError) {
      toast.error(removeError?.data?.message || "No se pudo eliminar al estudiante.");
    }
  };

  const summary = data?.summary || {};
  const students = data?.students || [];
  const contractOptions = data?.contractOptions || [];
  const creatorCourses = creatorCoursesData?.courses || [];
  const filteredContractOptions = useMemo(() => {
    const normalizedSearch = contractSearchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return contractOptions;
    }

    return contractOptions.filter((contractId) => contractId.toLowerCase().includes(normalizedSearch));
  }, [contractOptions, contractSearchTerm]);
  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return students.slice(startIndex, startIndex + PAGE_SIZE);
  }, [students, currentPage]);

  if (isLoading) {
    return <h1>Loading students dashboard...</h1>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {error?.data?.message || "Failed to load students dashboard."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500">
            Dashboard de estudiantes del instructor con filtro por ID de contrato.
          </p>
        </div>

        <div className="flex w-full max-w-4xl flex-col gap-2 md:items-end">
          <div className="grid w-full gap-2 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={contractSearchTerm}
                onChange={(event) => setContractSearchTerm(event.target.value)}
                placeholder="Buscar contrato disponible"
                className="pl-9"
              />
            </div>
            <Select value={selectedContract || "all"} onValueChange={handleContractChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los contratos</SelectItem>
                {filteredContractOptions.map((contractId) => (
                  <SelectItem key={contractId} value={contractId}>
                    {contractId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={handleClear}>
              Limpiar
            </Button>
            <Button type="button" className="gap-2" onClick={handleExportCsv} disabled={!students.length}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button type="button" onClick={() => setEnrollDialogOpen(true)}>
              Enrolar por email
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            {filteredContractOptions.length} contratos disponibles en el selector.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{summary.totalStudents || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{summary.totalContracts || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-violet-600">{summary.totalEnrollments || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students by Contract
            </CardTitle>
          </div>
          <div>
            <Badge variant="outline">
              {selectedContract ? `Filtro: ${selectedContract}` : "Todos los contratos"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isFetching ? <p className="mb-3 text-sm text-slate-500">Actualizando resultados...</p> : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>ID Contract</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.length ? (
                paginatedStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.clientName}</TableCell>
                    <TableCell>{student.idcontrato}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{student.totalCourses}</span>
                        <span className="text-xs text-muted-foreground">
                          {(student.enrolledCourses || []).map((course) => course.title).join(", ") || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(student.lastPurchaseAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => handleRemoveStudent(event, student)}
                        disabled={isRemovingStudent}
                      >
                        Borrar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No se encontraron estudiantes para este filtro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {!!students.length && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1} a {Math.min(currentPage * PAGE_SIZE, students.length)} de {students.length} estudiantes.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Badge variant="outline">
                  Página {currentPage} de {totalPages}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedStudent} onOpenChange={(isOpen) => !isOpen && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name || "Student detail"}</DialogTitle>
          </DialogHeader>

          {selectedStudent ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Email</CardTitle>
                  </CardHeader>
                  <CardContent>{selectedStudent.email}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Client</CardTitle>
                  </CardHeader>
                  <CardContent>{selectedStudent.clientName}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ID Contract</CardTitle>
                  </CardHeader>
                  <CardContent>{selectedStudent.idcontrato}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Last Purchase</CardTitle>
                  </CardHeader>
                  <CardContent>{formatDate(selectedStudent.lastPurchaseAt)}</CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(selectedStudent.enrolledCourses || []).length ? (
                    selectedStudent.enrolledCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                        <span>{course.title}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveEnrollment(course)}
                          disabled={isRemovingEnrollment}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin cursos inscritos.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enrolar estudiante por email</DialogTitle>
            <DialogDescription>
              Selecciona un curso propio e ingresa el email exacto del estudiante para inscribirlo manualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email del estudiante</p>
              <Input
                type="email"
                value={enrollmentEmail}
                onChange={(event) => setEnrollmentEmail(event.target.value)}
                placeholder="correo@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Curso</p>
              <Select value={enrollmentCourseId} onValueChange={setEnrollmentCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {creatorCourses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleEnrollDialogChange(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleEnrollStudent} disabled={isEnrollingStudent || !creatorCourses.length}>
                {isEnrollingStudent ? "Inscribiendo..." : "Inscribir estudiante"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsDashboard;