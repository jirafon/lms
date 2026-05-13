import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HeroSection from "./pages/student/HeroSection";
import MainLayout from "./layout/MainLayout";
import Courses from "./pages/student/Courses";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import Sidebar from "./pages/admin/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
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
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const HomeFooter = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8f3ea_100%)] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.14),transparent)]" />
      <div className="mx-auto grid max-w-7xl gap-6 rounded-[34px] border border-[#e7dccd] bg-[linear-gradient(135deg,rgba(255,253,249,0.95)_0%,rgba(245,239,230,0.92)_100%)] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1.2fr_auto] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d8cab7] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            {t("home.footer_badge")}
          </div>
          <h3 className="mt-5 max-w-2xl font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {t("home.footer_title")}
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
            {t("home.footer_description")}
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/70 p-6 backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">{t("home.footer_panel_label")}</p>
          <div className="space-y-2">
            <p className="text-3xl font-semibold text-slate-950">CLP</p>
            <p className="text-sm text-slate-600">{t("home.footer_panel_text")}</p>
          </div>
          <a href="/course/search?query" className="inline-flex items-center text-sm font-semibold text-slate-900 transition-colors hover:text-amber-800">
            {t("home.footer_cta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
            <HomeFooter />
          </>
        ),
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
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-detail/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute>
            <CourseProgress />
            </PurchaseCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },

      // admin routes start from here
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Sidebar />
          </AdminRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="course" replace />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
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
