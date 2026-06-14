import React, { useState } from "react";
import Filter from "./Filter";
import SearchResult from "./SearchResult";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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

  const handleFilterChange = (categories, price) => {
    setSelectedCatgories(categories);
    setSortByPrice(price);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          {t("search.results_for", { query: query || "" })}
        </p>
        <h1 className="mt-2 font-hero text-3xl font-semibold tracking-tight text-foreground">
          Resultados de busqueda
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
            data?.courses?.map((course) => <SearchResult key={course._id} course={course} />)
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
      <Link to="/" className="mt-6">
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
