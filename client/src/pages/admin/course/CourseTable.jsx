import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCourseQuery, useLazyGetCourseStudentsQuery } from "@/features/api/courseApi";
import { Edit, Users } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const formatCoursePrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return "NA";
  }

  return `US$${value}`;
};

const CourseTable = () => {
    const {data, isLoading, error} = useGetCreatorCourseQuery();
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
  const [getCourseStudents, { data: studentsData, isFetching: isStudentsLoading, error: studentsError }] = useLazyGetCourseStudentsQuery();
  const navigate = useNavigate();

  const handleOpenStudents = async (course) => {
    setSelectedCourseTitle(course.courseTitle);
    setStudentsDialogOpen(true);
    getCourseStudents(course._id);
  };

  if(isLoading) return <h1>Loading...</h1>;
  if(error) return <h1>Error loading courses.</h1>;
  if(!data || !Array.isArray(data.courses)) return <h1>No courses found.</h1>;
 
  return (
    <div>
      <Button onClick={() => navigate(`create`)}>Create a new course</Button>
      <Table>
        <TableCaption>A list of your recent courses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Precio por usuario</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.courses?.map((course) => (
            <TableRow key={course._id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{formatCoursePrice(course?.coursePrice)}</span>
                  <span className="text-xs text-muted-foreground">por usuario</span>
                </div>
              </TableCell>
              <TableCell> <Badge>{course.isPublished ? "Published" : "Draft"}</Badge> </TableCell>
              <TableCell>{course.courseTitle}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button size='sm' variant='ghost' onClick={() => handleOpenStudents(course)}>
                    <Users />
                  </Button>
                  <Button size='sm' variant='ghost' onClick={() => navigate(`${course._id}`)}><Edit/></Button>
                </div>
              </TableCell>
            </TableRow>
          )) || []}
        </TableBody>
      </Table>

      <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Students</DialogTitle>
            <DialogDescription>
              {selectedCourseTitle ? `Students enrolled in ${selectedCourseTitle}` : "Students enrolled in this course"}
            </DialogDescription>
          </DialogHeader>

          {isStudentsLoading ? (
            <p>Loading students...</p>
          ) : studentsError ? (
            <p className="text-red-500">Failed to load students.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID Contract</TableHead>
                  <TableHead>Client</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsData?.students?.length ? (
                  studentsData.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.idcontrato}</TableCell>
                      <TableCell>{student.clientName}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseTable;
