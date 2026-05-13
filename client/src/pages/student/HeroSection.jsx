import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, BadgeCheck, BookOpen, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/course/search?query=${searchQuery}`);
    }
    setSearchQuery("");
  };

  return (
    <section className="relative overflow-hidden bg-[#f5f1e8] px-4 py-20 text-slate-950 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.14),_transparent_34%),radial-gradient(circle_at_85%_20%,_rgba(146,64,14,0.12),_transparent_24%),linear-gradient(135deg,_rgba(255,255,255,0.62),_rgba(248,244,236,0.94))]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(90deg,rgba(15,23,42,0.1),rgba(120,53,15,0.1),rgba(15,23,42,0.1))]" />
      <div className="absolute -left-20 top-16 h-48 w-48 rounded-full bg-[#0f172a]/10 blur-3xl" />
      <div className="absolute right-[-2rem] top-24 h-64 w-64 rounded-full bg-[#b45309]/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-[#0f766e]/8 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            {t("home.hero_badge")}
          </div>

          <h1 className="mt-6 max-w-4xl font-serif text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {t("home.hero_title")}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700/95">
            {t("home.hero_description")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur">
              <BadgeCheck className="h-4 w-4 text-emerald-800" />
              {t("home.hero_feature_paths")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur">
              <GraduationCap className="h-4 w-4 text-cyan-800" />
              {t("home.hero_feature_tracking")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-700" />
              {t("home.hero_feature_catalog")}
            </div>
          </div>

          <form
            onSubmit={searchHandler}
            className="mt-10 flex max-w-2xl flex-col gap-3 rounded-[30px] border border-white/70 bg-white/72 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex-row"
          >
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("navigation.search_courses")}
              className="h-14 flex-1 rounded-2xl border border-slate-200/80 bg-[#fcfaf7] px-5 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-amber-200"
            />
            <Button
              type="submit"
              className="h-14 rounded-2xl bg-[#111827] px-6 text-white hover:bg-[#1f2937]"
            >
              {t("common.search")}
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => navigate(`/course/search?query`)}
              className="h-12 rounded-full bg-[#0f172a] px-6 text-white hover:bg-[#1e293b]"
            >
              {t("home.hero_cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm text-slate-600">
              {t("home.hero_caption")}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 translate-x-5 translate-y-5 rounded-[36px] bg-[#0f172a]/12 blur-2xl" />
          <div className="relative overflow-hidden rounded-[36px] border border-[#d6c8b6]/60 bg-[linear-gradient(160deg,#0f172a_0%,#172033_58%,#0f766e_130%)] p-6 text-white shadow-[0_32px_100px_rgba(15,23,42,0.24)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_28%)]" />
            <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{t("home.panel_eyebrow")}</p>
                <p className="mt-1 text-lg font-semibold">{t("home.panel_title")}</p>
              </div>
              <div className="rounded-full border border-emerald-300/20 bg-emerald-400/12 px-3 py-1 text-xs font-semibold text-emerald-200">
                {t("home.panel_status")}
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <BookOpen className="h-5 w-5 text-sky-300" />
                <p className="mt-6 text-3xl font-semibold">08</p>
                <p className="mt-1 text-sm text-slate-300">{t("home.panel_metric_courses")}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <GraduationCap className="h-5 w-5 text-amber-200" />
                <p className="mt-6 text-3xl font-semibold">92%</p>
                <p className="mt-1 text-sm text-slate-300">{t("home.panel_metric_progress")}</p>
              </div>
            </div>

            <div className="relative mt-4 rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{t("home.panel_featured_label")}</span>
                <span>GRC</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold leading-8">
                {t("home.panel_featured_title")}
              </h3>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>{t("home.panel_tracking_label")}</span>
                  <span className="font-semibold text-white">{t("home.panel_tracking_value")}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-300" />
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("home.panel_assessments_label")}</span>
                  <span className="font-semibold text-white">{t("home.panel_assessments_value")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
