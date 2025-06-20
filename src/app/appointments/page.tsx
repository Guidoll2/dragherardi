"use client";
import { useState, useEffect, useMemo } from "react"; // Agrega useMemo
import Cookies from "js-cookie";
import Header from "../components/header";
import CalendarComponent from "../components/calendar";


function Turnos() {
  
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
   
<div className="sticky top-0 z-[100] w-full ">
  <Header language={languageFromCookie} onLanguageChange={handleLanguageChange} />
</div>


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
          <p className="text-md sm:text-lg text-gray-500 italic">
            {languageFromCookie === "ES"
              ? "Por favor, selecciona un día y horario que te sea conveniente."
              : "Please select a day and time that works for you."}
          </p>
        </div>
      </div>
      {/* Sección de inicio de sesión / calendario */}
<div className="flex justify-center items-start w-full mt-10 px-4">


    <div className="flex flex-col items-center justify-center w-full">
      <CalendarComponent language={standardizedLanguage} />
      <div className="w-full flex justify-center p-4">
   
      </div>
    </div>
  
</div>

    </div>
  );
}

export default Turnos;