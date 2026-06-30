import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BookOpen,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/routes";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(ROUTES.catalogSearch(searchQuery));
    }
    setSearchQuery("");
  };

  const highlights = [
    { icon: BookOpen, label: t("home.hero_feature_paths") },
    { icon: Users, label: t("home.hero_feature_tracking") },
    { icon: ShieldCheck, label: t("home.hero_feature_catalog") },
  ];

  const featuredCourses = [
    {
      category: t("search.categories.cybersecurity"),
      title: t("home.highlighted_course_1"),
    },
    {
      category: t("search.categories.compliance"),
      title: t("home.highlighted_course_2"),
    },
    {
      category: t("search.categories.technology"),
      title: t("home.highlighted_course_3"),
    },
  ];

  return (
    <section className="border-b border-border bg-white dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            {t("home.hero_badge")}
          </p>

          <h1 className="mt-4 max-w-2xl font-hero text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.25rem]">
            {t("home.hero_title")}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {t("home.hero_description")}
          </p>

          <form
            onSubmit={searchHandler}
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("navigation.search_courses")}
                className="h-11 rounded-lg border-border bg-background pl-10"
              />
            </div>
            <Button type="submit" className="h-11 rounded-lg px-6">
              {t("common.search")}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {highlights.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => navigate(ROUTES.catalog)}
              className="h-11 rounded-lg px-6"
            >
              {t("home.hero_cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              {t("home.hero_caption")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {t("home.panel_eyebrow")}
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-foreground">
                {t("home.highlighted_title")}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {t("home.highlighted_status")}
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {t("home.highlighted_novelty_title")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("home.highlighted_novelty_description")}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {featuredCourses.map((course) => (
              <div
                key={course.title}
                className="rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {course.category}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-5 text-foreground">
                    {course.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
