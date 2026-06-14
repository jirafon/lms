import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COURSE_CATEGORY_OPTIONS } from "@/constants/courseCategories";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Filter = ({ handleFilterChange }) => {
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  const handleCategoryChange = (categoryValue) => {
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(categoryValue)
        ? prevCategories.filter((value) => value !== categoryValue)
        : [...prevCategories, categoryValue];

      handleFilterChange(newCategories, sortByPrice);
      return newCategories;
    });
  };

  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  };

  return (
    <Card className="h-fit w-full border-border shadow-sm lg:w-64 xl:w-72">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t("search.filter_options")}</CardTitle>
        <Select onValueChange={selectByPriceHandler}>
          <SelectTrigger className="rounded-lg">
            <SelectValue placeholder={t("search.sort_by")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("search.sort_by_price")}</SelectLabel>
              <SelectItem value="low">{t("search.low_to_high")}</SelectItem>
              <SelectItem value="high">{t("search.high_to_low")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-foreground">{t("search.category")}</p>
        {COURSE_CATEGORY_OPTIONS.map((category) => {
          const checkboxId = category.value.toLowerCase().replace(/\s+/g, "-");

          return (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={checkboxId}
                checked={selectedCategories.includes(category.value)}
                onCheckedChange={() => handleCategoryChange(category.value)}
              />
              <Label
                htmlFor={checkboxId}
                className="text-sm font-normal leading-none"
              >
                {t(category.labelKey, { defaultValue: category.value })}
              </Label>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Filter;
