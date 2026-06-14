import {
  ArrowLeft,
  LayoutDashboard,
  SquareLibrary,
  Users,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/utils/routes";
import DarkMode from "@/DarkMode";
import LanguageSelector from "@/components/LanguageSelector";
import { StudioAccountMenu } from "@/components/StudioTopBar";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  }`;

const StudioSidebar = ({ onNavigate }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    {
      to: "/admin/dashboard-v2",
      label: t("studio.nav_dashboard"),
      icon: LayoutDashboard,
    },
    {
      to: "/admin/course",
      label: t("studio.nav_courses"),
      icon: SquareLibrary,
    },
    {
      to: "/admin/students",
      label: t("studio.nav_students"),
      icon: Users,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <Link
        to={ROUTES.studio}
        className="mb-5 inline-flex items-center gap-2.5"
        onClick={onNavigate}
      >
        <img src="/unbiax13.png" alt="Unbiax" className="h-8 w-auto" />
        <span className="font-display text-lg font-semibold leading-none text-foreground">
          Academia Studio
        </span>
      </Link>

      <Link
        to={ROUTES.app}
        className="mb-5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        onClick={onNavigate}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("studio.back_to_learning")}
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCourseNav = item.to === "/admin/course";

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={!isCourseNav}
              className={({ isActive }) =>
                navLinkClass({
                  isActive:
                    isActive ||
                    (isCourseNav && location.pathname.startsWith("/admin/course")),
                })
              }
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto hidden items-center justify-between border-t border-border pt-4 lg:flex">
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <DarkMode />
        </div>
        <StudioAccountMenu />
      </div>
    </div>
  );
};

export default StudioSidebar;
