"use client";
import { useState, useEffect, useMemo } from "react"; // Agrega useMemo
import Cookies from "js-cookie";
import Header from "../components/header";
import CalendarComponent from "../components/calendar";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";

function Turnos() {
  const [hover, setHover] = useState(false);
  const [languageFromCookie, setLanguageFromCookie] = useState("EN"); // Renombramos para claridad

  // Carga el idioma guardado en cookie al montar
  useEffect(() => {
    const saved = Cookies.get("language");
    if (saved) {
      setLanguageFromCookie(saved);
    }
  }, []);

  // Cambia el idioma entre ES y EN, guarda en cookie
  const handleLanguageChange = () => {
    const newLang = languageFromCookie === "ES" ? "EN" : "ES";
    setLanguageFromCookie(newLang);
    Cookies.set("language", newLang, { expires: 7 });
  };

  // ESTA ES LA CLAVE: Normaliza el idioma a minúsculas para el CalendarComponent
  const standardizedLanguage = useMemo(() => {
    return languageFromCookie.toLowerCase();
  }, [languageFromCookie]);

  return (
    <div className="flex flex-col bg-gradient-to-b from-purple-200">
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
          Change to {languageFromCookie === "ES" ? "English" : "Spanish"} site
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

      <div className="relative mt-12 w-full  overflow-hidden p-8 sm:p-10 flex flex-col items-start text-start">
        {/* Contenido principal: Título y descripción con foco en la cercanía */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-light text-gray-800 tracking-tight leading-tight mb-4">
            {languageFromCookie === "ES"
              ? "Agendemos un Espacio para Conversar"
              : "Let's Find Time to Connect"}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-4 font-light leading-relaxed">
            {languageFromCookie === "ES"
              ? "Te invito a programar una reunión virtual para compartir ideas, responder preguntas o colaborar."
              : "I invite you to schedule a virtual meeting to share ideas, answer questions, or collaborate."}
          </p>
          <p className="text-md sm:text-lg text-gray-500">
            {languageFromCookie === "ES"
              ? "Por favor, selecciona un día y horario que te sea conveniente."
              : "Please select a day and time that works for you."}
          </p>
        </div>
      </div>
      {/* Sección de inicio de sesión / calendario */}
      <div className="flex w-full h-full justify-center mt-6">
        {/* Mostrar al usuario que debe iniciar sesión */}
        <SignedOut>
          <div className="text-center">
            <p className="mb-4 text-gray-700">
              {languageFromCookie === "ES"
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
        <div className="flex flex-col items-center justify-center w-screen">
          <SignedIn>
            {/* AQUÍ ES DONDE CAMBIAMOS EL PASO DE LA PROP */}
            <CalendarComponent language={standardizedLanguage} />
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