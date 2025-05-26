"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { ArchiveX, Droplet, ClipboardX, Plus, Minus } from "lucide-react";
import Header from "../components/header";

interface TranslatableText {
  ES: string;
  EN: string;
}

interface ResearchItem {
  title: TranslatableText;
  summary: TranslatableText;
  details: TranslatableText;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function ResearchPage() {
  const [language, setLanguage] = useState<"ES" | "EN">("ES");
  const [hover, setHover] = useState(false);

  // Load language preference from cookies
  useEffect(() => {
    const savedLanguage = Cookies.get("language");
    if (savedLanguage === "EN" || savedLanguage === "ES") {
      setLanguage(savedLanguage);
    }
  }, []);

  // Toggle language and save to cookies
  const handleLanguageChange = () => {
    const newLang = language === "ES" ? "EN" : "ES";
    setLanguage(newLang);
    Cookies.set("language", newLang, { expires: 365 });
  };

  const texts: { [key: string]: TranslatableText } = {
    sectionTitle: { ES: "Investigación", EN: "Research" },
    subtitle: {
      ES: "Proyectos en curso supervisados por la profesora Rachel Morello-Frosch",
      EN: "Ongoing projects supervised by Professor Rachel Morello-Frosch.",
    },
    detailsLabel: { ES: "Detalles", EN: "Details" },
    hideLabel: { ES: "Ocultar detalles", EN: "Hide Details" },
    fullName: {
      ES: "Investigación Actual",
      EN: "Current Research",
    },
  };

  const researchItems: ResearchItem[] = [
    {
      title: { ES: "Contaminantes Atmosféricos", EN: "Atmospheric Pollutants" },
      summary: {
        ES: "Estudio de partículas PM2.5 y PM10 y su impacto en salud respiratoria.",
        EN: "Study of PM2.5 and PM10 particles and their impact on respiratory health.",
      },
      details: {
        ES: "Analizo niveles de exposición en comunidades urbanas y desarrollo modelos predictivos para políticas de mitigación. Colaboración con EPA y laboratorios de UC Berkeley.",
        EN: "I analyze exposure levels in urban communities and develop predictive models for mitigation policies. Collaboration with the EPA and UC Berkeley labs.",
      },
      icon: ArchiveX,
    },
    {
      title: { ES: "Agua y Salud Pública", EN: "Water and Public Health" },
      summary: {
        ES: "Evaluación de calidad de agua y riesgos microbiológicos.",
        EN: "Evaluation of water quality and microbiological risks.",
      },
      details: {
        ES: "Implementación de metodologías de muestreo en cuencas rurales, identificación de patógenos emergentes y recomendaciones para sistemas de potabilización sostenibles.",
        EN: "Implementation of sampling methodologies in rural watersheds, identification of emerging pathogens, and recommendations for sustainable water treatment systems.",
      },
      icon: Droplet,
    },
    {
      title: { ES: "Políticas Ambientales", EN: "Environmental Policies" },
      summary: {
        ES: "Análisis de eficacia de regulaciones ambientales.",
        EN: "Analysis of the effectiveness of environmental regulations.",
      },
      details: {
        ES: "Comparación de marcos regulatorios en California y la UE, propuesta de indicadores clave de desempeño (KPIs) y talleres con tomadores de decisión.",
        EN: "Comparison of regulatory frameworks in California and the EU, proposal of key performance indicators (KPIs), and workshops with decision-makers.",
      },
      icon: ClipboardX,
    },
  ];

  return (
    <main className="min-h-screen bg-[#D5E8D4] text-[#5D8D7C] font-sans">
         <Header language={language} onLanguageChange={handleLanguageChange} />
      {/* Language Toggle */}
      <div className="sticky top-0 z-50 bg-[#D5E8D4] p-4 flex justify-end">
        <div
          id="language"
          className="relative cursor-pointer"
          onClick={handleLanguageChange}
        >
          <span
            className={`absolute text-xs top-16 right-8 font-semibold text-gray-600 bg-emerald-100 p-2 rounded-lg shadow-lg transition-all duration-300 transform ${
              hover
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {language === "ES" ? "Change to English" : "Cambiar a Español"}
          </span>
          <p
            className="text-sm border p-2 rounded-lg font-semibold bg-emerald-200 hover:bg-purple-200 duration-300 shadow-lg"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            ES | EN
          </p>
        </div>
      </div>

      {/* Header with Name and Subtitle */}
      <section className="max-w-6xl mx-auto px-8 pt-8">
        <h1 className="text-4xl font-bold text-[#5D8D7C] mb-2">
          {texts.fullName[language]}
        </h1>
        <p className="text-lg text-gray-600 mb-8">{texts.subtitle[language]}</p>
      </section>

      {/* Research Section */}
      <section id="investigacion" className="max-w-6xl mx-auto px-8">
        <h2 className="text-3xl font-semibold mb-8">
          {texts.sectionTitle[language]}
        </h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {researchItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <item.icon className="w-6 h-6 text-[#5D8D7C] mr-2" />
                <h3 className="text-xl font-semibold text-[#5D8D7C]">
                  {item.title[language]}
                </h3>
              </div>
              <div className="flex-grow">
                <p className="text-gray-700">{item.summary[language]}</p>
              </div>
              <DetailsToggle
                details={item.details[language]}
                lang={language}
                texts={texts}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

interface DetailsToggleProps {
  details: string;
  lang: "ES" | "EN";
  texts: { [key: string]: TranslatableText };
}

function DetailsToggle({ details, lang, texts }: DetailsToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center font-medium text-[#5D8D7C] hover:text-[#4A7265] focus:outline-none"
        aria-expanded={open}
      >
        {open ? (
          <Minus className="w-5 h-5 mr-2" />
        ) : (
          <Plus className="w-5 h-5 mr-2" />
        )}
        <span>{open ? texts.hideLabel[lang] : texts.detailsLabel[lang]}</span>
      </button>
      {open && <p className="mt-2 text-gray-600 leading-relaxed">{details}</p>}
    </div>
  );
}
