import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getUserRole } from "@/utils/userRole";
import { ROUTES } from "@/utils/routes";
import HeroSection from "@/pages/student/HeroSection";
import Courses from "@/pages/student/Courses";
import { useTranslation } from "react-i18next";

const HomeFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-white px-4 py-5 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <p>{t("home.footer_copyright", { year: new Date().getFullYear() })}</p>
        <a
          href="mailto:hello@unbiax.com"
          className="text-foreground/80 underline-offset-2 hover:text-primary hover:underline"
        >
          hello@unbiax.com
        </a>
      </div>
    </footer>
  );
};

const HomePage = () => {
  const { user, isAuthenticated, authChecked } = useSelector(
    (store) => store.auth
  );
  const userRole = getUserRole(user);

  if (!authChecked) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={userRole === "instructor" ? ROUTES.studio : ROUTES.app}
        replace
      />
    );
  }

  return (
    <>
      <HeroSection />
      <Courses />
      <HomeFooter />
    </>
  );
};

export default HomePage;
