// components/header.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
// Si tienes un componente AnimatedIcon, asegúrate de que sea compatible con SSR si es necesario
// import AnimatedIcon from "./animatedIcons";

type HeaderProps = {
  language: string;
  onLanguageChange: () => void;
};

export default function Header({ language, onLanguageChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageHovered, setIsLanguageHovered] = useState(false); // Renombrado para claridad

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm relative">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center space-x-4">
          {/* <AnimatedIcon /> */} {/* Descomenta si lo usas */}
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-800 text-lg">C.Gherardi</span>
          </div>
        </div>
      </Link>

      {/* Botón de Hamburguesa para Móviles */}
      <div className="flex items-center md:hidden"> {/* Visible solo en pantallas pequeñas */}
        <button
          onClick={toggleMenu}
          className="text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 p-2 rounded-md"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            )}
          </svg>
        </button>
      </div>

      {/* Menú de Navegación (visible en desktop, oculto por defecto en móvil) */}
      <nav className="hidden md:flex flex-row space-x-2 items-center">
        <Link href="/research">
          <span className="bg-emerald-100 hover:bg-purple-100 px-3 py-1 rounded-full shadow-md transition-colors duration-300">
            {language === "EN" ? "Research" : "Investigacion"}
          </span>
        </Link>
        <Link href="/appointments">
          <span className="bg-emerald-100 hover:bg-purple-100 px-3 py-1 rounded-full shadow-md transition-colors duration-300">
            {language === "EN" ? "Appointments" : "Agenda"}
          </span>
        </Link>
        <Link href="/board">
          <span className="bg-emerald-100 hover:bg-purple-100 px-3 py-1 rounded-full shadow-md transition-colors duration-300">
            {language === "EN" ? "Board" : "Pizarra"}
          </span>
        </Link>
      </nav>

      {/* Contenedor para el selector de idioma y UserButton (visible en desktop) */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Selector de idioma */}
        <div
          className="relative cursor-pointer flex items-center"
          onClick={onLanguageChange}
          onMouseEnter={() => setIsLanguageHovered(true)}
          onMouseLeave={() => setIsLanguageHovered(false)}
        >
          <span className="text-sm font-semibold text-gray-700 bg-emerald-200 hover:bg-purple-200 px-3 py-1 rounded-full shadow-md transition-colors duration-300">
            {language === "EN" ? "EN / ES" : "ES / EN"}
          </span>
          <span
            className={`absolute text-xs top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-semibold text-gray-600 bg-emerald-100 p-2 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
              isLanguageHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            Change to {language === "ES" ? "English" : "Spanish"} site
          </span>
        </div>
        <UserButton />
      </div>

      {/* Menú Desplegable para Móviles */}
      <div
        id="mobile-menu"
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center space-y-4">
          <Link href="/research" onClick={toggleMenu}>
            <span className="font-semibold text-gray-800 hover:text-purple-600 transition-colors duration-300">
              {language === "EN" ? "Research" : "Investigacion"}
            </span>
          </Link>
          <Link href="/appointments" onClick={toggleMenu}>
            <span className="font-semibold text-gray-800 hover:text-purple-600 transition-colors duration-300">
              {language === "EN" ? "Appointments" : "Agenda"}
            </span>
          </Link>
          <Link href="/board" onClick={toggleMenu}>
            <span className="font-semibold text-gray-800 hover:text-purple-600 transition-colors duration-300">
              {language === "EN" ? "Board" : "Pizarra"}
            </span>
          </Link>
          <hr className="w-1/2 border-gray-200" /> {/* Separador */}
          {/* Selector de idioma dentro del menú móvil */}
          <div
            className="relative cursor-pointer flex items-center mt-4"
            onClick={() => {
              onLanguageChange();
              toggleMenu(); // Cierra el menú al cambiar el idioma
            }}
          >
            <span className="text-sm font-semibold text-gray-700 bg-emerald-200 hover:bg-purple-200 px-3 py-1 rounded-full shadow-md transition-colors duration-300">
              {language === "EN" ? "EN / ES" : "ES / EN"}
            </span>
          </div>
          <div className="mt-4">
            <UserButton afterSignOutUrl="/" /> {/* Asegúrate de redirigir después del logout */}
          </div>
        </nav>
      </div>
    </header>
  );
} 