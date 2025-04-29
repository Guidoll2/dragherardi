"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Header from "../components/header";
import CalendarComponent from "../components/calendar";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";

function Turnos() {
  const [hover, setHover] = useState(false);
  const [language, setLanguage] = useState("ES");

  // Cambia el idioma entre ES y EN, guarda en cookie
  const handleLanguageChange = () => {
    const newLang = language === "ES" ? "EN" : "ES";
    setLanguage(newLang);
    Cookies.set("language", newLang, { expires: 7 });
  };

  // Carga el idioma guardado en cookie al montar
  useEffect(() => {
    const saved = Cookies.get("language");
    if (saved) setLanguage(saved);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Selector de idioma */}
      <div
        id="language"
        className="relative cursor-pointer top-12"
        onClick={handleLanguageChange}
      >
        <span
          className={`absolute text-xs top-16 right-8 font-semibold text-gray-600 transition-all duration-700 ease-in-out transform ${
            hover
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          Change to {language === "ES" ? "English" : "Spanish"} site
        </span>
        <p
          className="text-sm absolute top-2 md:top-5 border p-2 rounded-lg right-2 md:right-14 font-semibold text-gray-700 bg-emerald-200 hover:bg-purple-200 ease-in-out duration-700 shadow-lg"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          EN | ES
        </p>
      </div>

      <Header />

      {/* Encabezado de la sección */}
      <div className="relative mt-8 md:w-3/4 mx-auto rounded-xl shadow-lg bg-gradient-to-br from-white to-gray-50">
        <div className="px-8 py-10 md:px-12 text-center">
          <h1 className="text-4xl text-emerald-500 tracking-tight leading-tight">
            {language === "ES"
              ? "Acompañamiento Médico Remoto"
              : "Remote Medical Appointment"}
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            {language === "ES"
              ? "Selecciona un día y horario disponible para continuar con tu consulta médica."
              : "Choose an available day and time to proceed with your medical consultation."}
          </p>
        </div>
        <div className="absolute inset-0 -z-10 blur-xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-500 opacity-20"></div>
      </div>

      {/* Sección de inicio de sesión / calendario */}
      <div className="flex w-full h-full justify-center mt-6">
        {/* Mostrar al usuario que debe iniciar sesión */}
        <SignedOut>
          <div className="text-center">
            <p className="mb-4 text-gray-700">
              {language === "ES"
                ? "Por favor, inicia sesión para reservar un turno."
                : "Please sign in to book an appointment."}
            </p>
            {/* Componente de Clerk para iniciar sesión */}
            <div className="bg-emerald-200 hover:bg-purple-200 ease-in-out duration-700 text-gray-800 p-2 rounded-lg shadow-2xl">
              <SignInButton></SignInButton>
            </div>
          </div>
        </SignedOut>

        {/* Una vez firmado, mostrar calendario y botón de cerrar sesión */}
        <div className="flex flex-col items-center justify-center">
          <SignedIn>
            <CalendarComponent language={language} />
            <div className="w-full flex justify-center p-4">
              <SignOutButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Turnos;
