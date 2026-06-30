import React, { useMemo, useState } from "react";
import Filter from "./Filter";
import SearchResult from "./SearchResult";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ROUTES } from "@/utils/routes";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { COURSE_CATEGORY_OPTIONS } from "@/constants/courseCategories";

const normalizeCategory = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [selectedCategories, setSelectedCatgories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  const { data, isLoading } = useGetSearchCourseQuery({
    searchQuery: query,
    categories: selectedCategories,
    sortByPrice,
  });

  const isEmpty = !isLoading && data?.courses.length === 0;
  const categoryLabelMap = useMemo(() => {
    const map = new Map();
    COURSE_CATEGORY_OPTIONS.forEach(({ value, labelKey }) => {
      map.set(normalizeCategory(value), t(labelKey));
    });
    return map;
  }, [t]);

  const groupedCourses = useMemo(() => {
    const groupsMap = new Map();
    const courses = data?.courses ?? [];

    courses.forEach((course) => {
      const rawCategory = course?.courseCategory?.trim() || t("course.course_category");
      const normalized = normalizeCategory(rawCategory);
      const categoryTitle = categoryLabelMap.get(normalized) || rawCategory;

      if (!groupsMap.has(normalized)) {
        groupsMap.set(normalized, {
          categoryKey: normalized,
          categoryTitle,
          courses: [],
        });
      }

      groupsMap.get(normalized).courses.push(course);
    });

    return Array.from(groupsMap.values())
      .map((group) => ({
        ...group,
        courses: [...group.courses].sort((a, b) =>
          String(a?.courseTitle || "").localeCompare(String(b?.courseTitle || ""), "es", {
            sensitivity: "base",
          })
        ),
      }))
      .sort((a, b) =>
        a.categoryTitle.localeCompare(b.categoryTitle, "es", {
          sensitivity: "base",
        })
      );
  }, [data?.courses, categoryLabelMap, t]);

  const handleFilterChange = (categories, price) => {
    setSelectedCatgories(categories);
    setSortByPrice(price);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <Breadcrumbs
        items={[
          { label: t("navigation.catalog"), to: ROUTES.catalog },
          ...(query ? [{ label: query }] : []),
        ]}
      />
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          {query ? t("search.results_for", { query }) : t("navigation.catalog")}
        </p>
        <h1 className="mt-2 font-hero text-3xl font-semibold tracking-tight text-foreground">
          {query ? t("search.page_title_results") : t("search.page_title_catalog")}
        </h1>
        {query && (
          <p className="mt-2 text-muted-foreground">
            {t("search.showing_results_for")}{" "}
            <span className="font-medium text-foreground">{query}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Filter handleFilterChange={handleFilterChange} />
        <div className="flex-1 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <CourseSkeleton key={idx} />
            ))
          ) : isEmpty ? (
            <CourseNotFound t={t} />
          ) : (
            <div className="space-y-8">
              {groupedCourses.map((group) => (
                <section key={group.categoryKey} className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {group.categoryTitle}
                  </h2>
                  <div className="space-y-4">
                    {group.courses.map((course) => (
                      <SearchResult key={course._id} course={course} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

const CourseNotFound = ({ t }) => {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold text-foreground">
        {t("search.course_not_found")}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {t("search.course_not_found_description")}
      </p>
      <Link to={ROUTES.catalog} className="mt-6">
        <Button variant="outline" className="rounded-lg">
          {t("search.browse_all_courses")}
        </Button>
      </Link>
    </div>
  );
};

const CourseSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row">
      <Skeleton className="h-32 w-full rounded-lg md:w-56" />
      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-6 w-28" />
    </div>
  );
};
