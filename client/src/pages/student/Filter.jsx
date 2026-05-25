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
import { Separator } from "@/components/ui/separator";
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
  }
  return (
    <div className="w-full md:w-[20%]">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-xl">{t("search.filter_options")}</h1>
        <Select onValueChange={selectByPriceHandler}>
          <SelectTrigger>
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
      </div>
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold mb-2">{t("search.category")}</h1>
        {COURSE_CATEGORY_OPTIONS.map((category) => {
          const checkboxId = category.value.toLowerCase().replace(/\s+/g, "-");

          return (
          <div key={category.value} className="flex items-center space-x-2 my-2">
            <Checkbox
              id={checkboxId}
              checked={selectedCategories.includes(category.value)}
              onCheckedChange={() => handleCategoryChange(category.value)}
            />
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t(category.labelKey, { defaultValue: category.value })}
            </Label>
          </div>
        )})}
      </div>
    </div>
  );
};

export default Filter;
