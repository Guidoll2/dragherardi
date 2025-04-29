import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { ArchiveX, Droplet, ClipboardX, Plus, Minus } from "lucide-react";

interface ResearchItem {
  title: string;
  summary: string;
  details: string;
  icon: React.ComponentType<any>;
}

export default function ResearchPage() {
  const [language, setLanguage] = useState("ES");
  const [hover, setHover] = useState(false);

  // Load language preference from cookies
  useEffect(() => {
    const savedLanguage = Cookies.get("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Toggle language and save to cookies
  const handleLanguageChange = () => {
    const newLang = language === "ES" ? "EN" : "ES";
    setLanguage(newLang);
    Cookies.set("language", newLang, { expires: 365 });
  };

  const researchItems: ResearchItem[] = [
    {
      title: "Contaminantes Atmosféricos",
      summary:
        "Estudio de partículas PM2.5 y PM10 y su impacto en salud respiratoria.",
      details:
        "Analizo niveles de exposición en comunidades urbanas y desarrollo modelos predictivos para políticas de mitigación. Colaboración con EPA y laboratorios de UC Berkeley.",
      icon: ArchiveX,
    },
    {
      title: "Agua y Salud Pública",
      summary: "Evaluación de calidad de agua y riesgos microbiológicos.",
      details:
        "Implementación de metodologías de muestreo en cuencas rurales, identificación de patógenos emergentes y recomendaciones para sistemas de potabilización sostenibles.",
      icon: Droplet,
    },
    {
      title: "Políticas Ambientales",
      summary: "Análisis de eficacia de regulaciones ambientales.",
      details:
        "Comparación de marcos regulatorios en California y la UE, propuesta de indicadores clave de desempeño (KPIs) y talleres con tomadores de decisión.",
      icon: ClipboardX,
    },
  ];

  return (
    <main className="min-h-screen bg-[#D5E8D4] text-[#5D8D7C] font-sans">
      {/* Language Toggle */}
      <div className="sticky top-0 z-50 bg-[#D5E8D4] p-4 flex justify-end">
        <div
          id="language"
          className="relative cursor-pointer"
          onClick={handleLanguageChange}
        >
          <span
            className={`absolute text-xs top-12 right-0 font-semibold text-gray-600 bg-emerald-100 p-2 rounded-lg shadow-lg transition-all duration-300 transform ${
              hover
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            Change to {language === "ES" ? "English" : "Spanish"}
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

      {/* Research Section */}
      <section id="investigacion" className="max-w-6xl mx-auto p-8 mt-6">
        <h2 className="text-3xl font-semibold mb-8">Investigación</h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {researchItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <item.icon className="w-6 h-6 text-[#5D8D7C] mr-2" />
                <h3 className="text-xl font-semibold text-[#5D8D7C]">
                  {item.title}
                </h3>
              </div>
              <div className="flex-grow">
                <p className="text-gray-700">{item.summary}</p>
              </div>
              <DetailsToggle details={item.details} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function DetailsToggle({ details }: { details: string }) {
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
        <span>{open ? "Ocultar detalles" : "+ Detalles"}</span>
      </button>
      {open && <p className="mt-2 text-gray-600 leading-relaxed">{details}</p>}
    </div>
  );
}
