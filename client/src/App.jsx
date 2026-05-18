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
import { useTranslation } from "react-i18next";
import {
  AdminRoute,
  AuthenticatedUser,
  ProtectedRoute,
} from "./components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute";
import { BrainCircuit, Link2, Mail, Phone, ShieldCheck } from "lucide-react";

const HomeFooter = () => {
  const { t } = useTranslation();
  const footerCapabilities = t("home.footer_capabilities", { returnObjects: true });

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fbfaf7_0%,#f3ecdf_100%)] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.14),transparent)]" />
      <div className="absolute left-[-3rem] top-10 h-48 w-48 rounded-full bg-[#0f172a]/6 blur-3xl" />
      <div className="absolute bottom-[-4rem] right-0 h-64 w-64 rounded-full bg-[#b45309]/8 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-6 rounded-[38px] border border-[#e7dccd] bg-[linear-gradient(135deg,rgba(255,253,249,0.96)_0%,rgba(245,239,230,0.94)_100%)] p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] lg:grid-cols-[1.2fr_0.9fr] lg:p-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d8cab7] bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            Unbiax Platform
          </div>
          <h3 className="mt-5 max-w-2xl font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Unbiax Solutions
          </h3>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
            Plataforma enterprise para desarrollar agentes de IA,
            automatizaciones y soluciones de gobernanza operacional bajo un
            enfoque seguro, trazable y compliant.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {t("home.footer_capabilities_label")}
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {footerCapabilities.map((item) => (
                  <div key={item} className="flex gap-3">
                    <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Alcance
              </p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
                <p>
                  Integra modulos de GRC, privacidad de datos, prevencion de
                  delitos, gestion de riesgos, gobernanza y sesgos de IA.
                </p>
                <p>
                  Incorpora librerias de riesgos, controles, consentimientos y
                  compliance para acelerar implementaciones y fortalecer la
                  trazabilidad organizacional.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-[32px] border border-[#d8cab7] bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(23,32,51,0.94)_100%)] p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Formacion corporativa
            </p>
            <p className="mt-3 text-base leading-7 text-slate-200">
              El LMS de Unbiax integra cursos de privacidad, etica,
              compliance, IA responsable y ciberseguridad para fortalecer la
              capacitacion de colaboradores, directores y equipos de primera
              linea.
            </p>
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-4 text-sm text-slate-200">
            <a
              href="mailto:ncastillo@unbiax.com"
              className="flex items-center gap-3 transition-colors hover:text-amber-200"
            >
              <Mail className="h-4 w-4 text-amber-700" />
              <span>ncastillo@unbiax.com</span>
            </a>
            <a
              href="tel:+56987375517"
              className="flex items-center gap-3 transition-colors hover:text-amber-200"
            >
              <Phone className="h-4 w-4 text-amber-300" />
              <span>+56 9 87375517</span>
            </a>
            <div className="flex items-center gap-3 text-slate-300">
              <Link2 className="h-4 w-4 text-amber-300" />
              <span>Soluciones enterprise con enfoque seguro y compliant</span>
            </div>
          </div>

          <div className="mt-auto rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            Diseñado para organizaciones que necesitan automatizacion,
            gobernanza y aprendizaje corporativo en una misma plataforma.
          </div>
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
