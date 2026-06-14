import { Search } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";

const GlobalSearch = ({ className = "" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? ROUTES.catalogSearch(trimmed) : ROUTES.catalog);
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("navigation.search_courses")}
          className="h-9 w-full rounded-lg border-border bg-muted/40 pl-9 text-sm lg:w-56 xl:w-64"
        />
      </div>
    </form>
  );
};

export default GlobalSearch;
