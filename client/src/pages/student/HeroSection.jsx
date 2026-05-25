import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BadgeCheck,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
    <section className="relative overflow-hidden bg-[#f4efe6] px-4 py-20 text-slate-950 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.8)_0%,rgba(248,243,235,0.95)_48%,rgba(239,231,220,0.88)_100%)]" />
      <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.12),transparent_58%)]" />
      <div className="absolute left-[-3rem] top-12 h-56 w-56 rounded-full bg-[#0f172a]/8 blur-3xl" />
      <div className="absolute bottom-[-3rem] right-[12%] h-64 w-64 rounded-full bg-[#0f766e]/8 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.16),transparent)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_460px]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            {t("home.hero_badge")}
          </div>

          <h1 className="mt-7 max-w-4xl font-hero text-4xl font-semibold leading-[0.92] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[4.2rem]">
            {t("home.hero_title")}
          </h1>

          <p className="mt-7 max-w-2xl text-[1.08rem] leading-8 text-slate-700/95">
            {t("home.hero_description")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur">
              <BadgeCheck className="h-4 w-4 text-emerald-800" />
              {t("home.hero_feature_paths")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur">
              <GraduationCap className="h-4 w-4 text-cyan-800" />
              {t("home.hero_feature_tracking")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 shadow-sm ring-1 ring-slate-200/80 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-700" />
              {t("home.hero_feature_catalog")}
            </div>
          </div>

          <form
            onSubmit={searchHandler}
            className="mt-10 flex max-w-2xl flex-col gap-3 rounded-[32px] border border-white/80 bg-white/80 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex-row"
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
              className="h-14 rounded-2xl bg-[#111827] px-6 text-white shadow-[0_16px_35px_rgba(17,24,39,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#1f2937]"
            >
              {t("common.search")}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => navigate(`/course/search?query`)}
              className="h-12 rounded-full bg-[#0f172a] px-6 text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#1e293b]"
            >
              {t("home.hero_cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              {t("home.hero_caption")}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[40px] bg-[#0f172a]/12 blur-2xl" />
          <div className="relative overflow-hidden rounded-[40px] border border-[#d6c8b6]/60 bg-[linear-gradient(160deg,#0f172a_0%,#172033_50%,#123b41_130%)] p-6 text-white shadow-[0_36px_100px_rgba(15,23,42,0.24)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_28%)]" />
            <div className="relative flex items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{t("home.panel_eyebrow")}</p>
                <p className="mt-1 text-lg font-semibold">{t("home.highlighted_title")}</p>
              </div>
              <div className="rounded-full border border-emerald-300/20 bg-emerald-400/12 px-3 py-1 text-xs font-semibold text-emerald-200">
                {t("home.highlighted_status")}
              </div>
            </div>

            <div className="relative mt-5 rounded-[28px] border border-amber-200/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100 backdrop-blur-sm">
              <p className="font-semibold">{t("home.highlighted_novelty_title")}</p>
              <p className="mt-1 text-amber-50/90">{t("home.highlighted_novelty_description")}</p>
            </div>

            <div className="relative mt-5 grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur-sm">
                <img
                  src="/course-thumbnails/ciberseguridad.png"
                  alt="Ciberseguridad y Proteccion de la Informacion"
                  className="h-16 w-24 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{t("search.categories.cybersecurity")}</p>
                  <p className="mt-1 text-sm font-semibold leading-5">{t("home.highlighted_course_1")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur-sm">
                <img
                  src="/course-thumbnails/ley-karin.png"
                  alt="Ley Karin - Prevencion del Acoso y Violencia en el Trabajo"
                  className="h-16 w-24 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{t("search.categories.compliance")}</p>
                  <p className="mt-1 text-sm font-semibold leading-5">{t("home.highlighted_course_2")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-3 backdrop-blur-sm">
                <img
                  src="/course-thumbnails/ia-responsable.png"
                  alt="IA Responsable y Uso Seguro de Inteligencia Artificial"
                  className="h-16 w-24 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{t("search.categories.technology")}</p>
                  <p className="mt-1 text-sm font-semibold leading-5">{t("home.highlighted_course_3")}</p>
                </div>
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">{t("search.categories.compliance")}</span>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">{t("search.categories.data_privacy")}</span>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">{t("search.categories.cybersecurity")}</span>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">{t("search.categories.technology")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
