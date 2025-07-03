"use client"

import { useState, useEffect, useMemo } from "react"
import Cookies from "js-cookie"
import Header from "../components/header"
import CalendarComponent from "../components/calendar"

function Turnos() {
  const [languageFromCookie, setLanguageFromCookie] = useState("EN")

  useEffect(() => {
    const saved = Cookies.get("language")
    if (saved) {
      setLanguageFromCookie(saved)
    }
  }, [])

  const handleLanguageChange = () => {
    const newLang = languageFromCookie === "ES" ? "EN" : "ES"
    setLanguageFromCookie(newLang)
    Cookies.set("language", newLang, { expires: 7 })
  }

  const standardizedLanguage = useMemo(() => {
    return languageFromCookie.toLowerCase()
  }, [languageFromCookie])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-200 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-[100] w-full backdrop-blur-md bg-white/80 border-b border-white/20">
        <Header language={languageFromCookie} onLanguageChange={handleLanguageChange} />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/20 text-sm font-medium text-indigo-700 mb-6">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
            {languageFromCookie === "ES" ? "Disponible para reuniones" : "Available for meetings"}
          </div>

          <h1 className="text-4xl md:text-6xl font-light text-gray-800 tracking-tight leading-tight mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {languageFromCookie === "ES" ? "Agendemos un Espacio para Conversar" : "Let's Find Time to Connect"}
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-6 font-light leading-relaxed max-w-3xl mx-auto">
            {languageFromCookie === "ES"
              ? "Te invito a programar una reunión virtual para compartir ideas, responder preguntas o colaborar."
              : "I invite you to schedule a virtual meeting to share ideas, answer questions, or collaborate."}
          </p>

          <p className="text-lg text-gray-500 italic max-w-2xl mx-auto">
            {languageFromCookie === "ES"
              ? "Por favor, selecciona un día y horario que te sea conveniente."
              : "Please select a day and time that works for you."}
          </p>
        </div>

        {/* Calendar section with glass effect */}
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-6xl">
            <CalendarComponent language={standardizedLanguage} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Turnos
