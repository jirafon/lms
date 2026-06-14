import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import MainLayout from "./layout/MainLayout";
import LearnLayout from "./layout/LearnLayout";
import StudioLayout from "./layout/StudioLayout";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import DashboardV2 from "./pages/admin/DashboardV2";
import StudentsDashboard from "./pages/admin/StudentsDashboard";
import CourseTable from "./pages/admin/course/CourseTable";
import AddCourse from "./pages/admin/course/AddCourse";
import EditCourse from "./pages/admin/course/EditCourse";
import CreateLecture from "./pages/admin/lecture/CreateLecture";
import EditLecture from "./pages/admin/lecture/EditLecture";
import CourseDetail from "./pages/student/CourseDetail";
import CourseProgress from "./pages/student/CourseProgress";
import SearchPage from "./pages/student/SearchPage";
import {
  AdminRoute,
  AuthenticatedUser,
  ProtectedRoute,
} from "./components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute";
import {
  LegacyCourseDetailRedirect,
  LegacyCourseProgressRedirect,
  LegacySearchRedirect,
} from "./components/LegacyRedirects";

const appRouter = createBrowserRouter([
  {
    path: "/app/learn/:courseId",
    element: (
      <ProtectedRoute>
        <PurchaseCourseProtectedRoute>
          <LearnLayout />
        </PurchaseCourseProtectedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <CourseProgress variant="page" />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <StudioLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard-v2" replace />,
      },
      {
        path: "dashboard-v2",
        element: <DashboardV2 />,
      },
      {
        path: "students",
        element: <StudentsDashboard />,
      },
      {
        path: "course",
        element: <CourseTable />,
      },
      {
        path: "course/create",
        element: <AddCourse />,
      },
      {
        path: "course/:courseId",
        element: <EditCourse />,
      },
      {
        path: "course/:courseId/lecture",
        element: <CreateLecture />,
      },
      {
        path: "course/:courseId/lecture/:lectureId",
        element: <EditLecture />,
      },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: (
          <AuthenticatedUser>
            <Login />
          </AuthenticatedUser>
        ),
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password/:token",
        element: <ResetPassword />,
      },
      {
        path: "catalog",
        element: <SearchPage />,
      },
      {
        path: "courses/:courseId",
        element: <CourseDetail />,
      },
      {
        path: "app",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      {
        path: "app/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "studio",
        element: (
          <AdminRoute>
            <Navigate to="/admin/dashboard-v2" replace />
          </AdminRoute>
        ),
      },
      {
        path: "course-progress/:courseId",
        element: <LegacyCourseProgressRedirect />,
      },
      {
        path: "my-learning",
        element: <Navigate to="/app" replace />,
      },
      {
        path: "profile",
        element: <Navigate to="/app/profile" replace />,
      },
      {
        path: "course/search",
        element: <LegacySearchRedirect />,
      },
      {
        path: "course-detail/:courseId",
        element: <LegacyCourseDetailRedirect />,
      },
    ],
  },
]);

function App() {
  return (
    <main>
      <RouterProvider router={appRouter} />
    </main>
  );
}

export default App;
