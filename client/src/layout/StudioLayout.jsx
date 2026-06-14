import React, { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Breadcrumbs from "@/components/Breadcrumbs";
import StudioSidebar from "@/components/StudioSidebar";
import { StudioTopBar } from "@/components/StudioTopBar";
import { ROUTES } from "@/utils/routes";

const getStudioPageBreadcrumbs = (pathname, t) => {
  const items = [
    { label: t("navigation.my_space"), to: ROUTES.app },
    { label: t("navigation.studio"), to: ROUTES.studio },
  ];

  if (pathname.includes("/admin/dashboard-v2")) {
    items.push({ label: t("studio.nav_dashboard") });
    return items;
  }

  if (pathname.includes("/admin/students")) {
    items.push({ label: t("studio.nav_students") });
    return items;
  }

  if (pathname.includes("/admin/course/create")) {
    items.push(
      { label: t("studio.nav_courses"), to: "/admin/course" },
      { label: t("studio.create_course") }
    );
    return items;
  }

  if (pathname.includes("/admin/course/") && pathname.includes("/lecture/")) {
    items.push(
      { label: t("studio.nav_courses"), to: "/admin/course" },
      { label: t("studio.edit_lecture") }
    );
    return items;
  }

  if (pathname.includes("/admin/course/") && pathname.includes("/lecture")) {
    items.push(
      { label: t("studio.nav_courses"), to: "/admin/course" },
      { label: t("studio.add_lecture") }
    );
    return items;
  }

  if (/\/admin\/course\/[^/]+$/.test(pathname)) {
    items.push(
      { label: t("studio.nav_courses"), to: "/admin/course" },
      { label: t("studio.edit_course") }
    );
    return items;
  }

  if (pathname.includes("/admin/course")) {
    items.push({ label: t("studio.nav_courses") });
    return items;
  }

  return items;
};

const StudioLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const breadcrumbItems = useMemo(
    () => getStudioPageBreadcrumbs(location.pathname, t),
    [location.pathname, t]
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <StudioTopBar onOpenMenu={() => setMobileNavOpen(true)} />

      <div className="flex flex-1 lg:flex-row">
        <aside className="hidden w-[260px] shrink-0 border-r border-border bg-card p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <StudioSidebar />
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <Breadcrumbs items={breadcrumbItems} />
          <Outlet />
        </main>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[280px] border-r border-border bg-card p-5">
          <SheetHeader className="sr-only">
            <SheetTitle>{t("navigation.studio")}</SheetTitle>
          </SheetHeader>
          <StudioSidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StudioLayout;
