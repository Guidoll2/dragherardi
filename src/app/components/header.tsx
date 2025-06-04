// components/header.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import AnimatedIcon from "./animatedIcons";
import { useState } from "react";

type HeaderProps = {
  language: string;
  onLanguageChange: () => void;
};

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const [hover, setHover] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <Link href="/">
        <div className="flex items-center space-x-4">
          <AnimatedIcon />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-800 text-lg">C.Gherardi</span>
         </div>
        </div>
      </Link>

      <div className="flex flex-row space-x-2 items-center ">
          <span className="bg-emerald-100 hover:bg-purple-100 px-3 py-1 rounded-full shadow-md transition-colors duration-300"> {language === "EN"
        ? "Research"
        : "Investigacion"}</span>
        
          <span className="bg-emerald-100 hover:bg-purple-100 px-3 py-1 rounded-full shadow-md transition-colors duration-300"> {language === "EN"
        ? "Appointments"
        : "Agenda"}</span>
        
          <span className="bg-emerald-100 hover:bg-purple-100 px-3 py-1 rounded-full shadow-md transition-colors duration-300"> {language === "EN"
        ? "Board"
        : "Pizarra"}</span></div>

      <div className="flex items-center space-x-4"> {/* Contenedor para el selector y UserButton */}
        {/* Selector de idioma - Diseño mejorado */}
        <div
          className="relative cursor-pointer flex items-center" // Usamos flex para centrar contenido
          onClick={onLanguageChange}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >

          <span
            className="text-sm font-semibold text-gray-700 bg-emerald-200 hover:bg-purple-200 px-3 py-1 rounded-full shadow-md transition-colors duration-300"
          >
            {language === "EN" ? "EN / ES" : "ES / EN"} {/* Muestra la opción actual y la alternativa */}
          </span>
          {/* Tooltip */}
          <span
            className={`absolute text-xs top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-semibold text-gray-600 bg-emerald-100 p-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
              hover
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            Change to {language === "ES" ? "English" : "Spanish"} site
          </span>
        </div>

        <UserButton />
      </div>
    </header>
  );
}