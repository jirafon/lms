import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
const navigate = useNavigate();
  const searchHandler = (e) => {
    e.preventDefault();
    if(searchQuery.trim() !== ""){
      navigate(`/course/search?query=${searchQuery}`)
    }
    setSearchQuery("");
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-500 to bg-indigo-600 dark:from-gray-800 dark:to-gray-900 py-24 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-4xl font-bold mb-4">
          Encuentra los mejores cursos de Riesgo, Cumplimiento y Gobernanza para ti
        </h1>
        <p className="text-gray-200 dark:text-gray-400 mb-8">
          Descubre, mejore y aprende nuevas habilidades con nuestra amplia selección de cursos para el GRC en línea.
        </p>

        <form onSubmit={searchHandler} className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-xl mx-auto mb-6">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar Cursos..."
            className="flex-grow border-none focus-visible:ring-0 px-6 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <Button type="submit" className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-r-full hover:bg-blue-700 dark:hover:bg-blue-800">Buscar</Button>
        </form>
       <Button onClick={()=> navigate(`/course/search?query`)} className="bg-white dark:bg-gray-800 text-blue-600 rounded-full hover:bg-gray-200">Explorar cursos</Button>
      </div>
    </div>
  );
};

export default HeroSection;
