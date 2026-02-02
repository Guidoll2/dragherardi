"use client";

  import { useEffect, useState } from "react";
  import Cookies from "js-cookie";
  import Header from "./components/header";
  import Link from "next/link";
  import { motion } from "framer-motion";
  import Image from "next/image";

  export default function Home() {
   const [language, setLanguage] = useState("EN");

    // Animation variants
    const stagger = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

    const fadeIn = {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    };

const cards = [
  {
    href: "/education",
    imageSrc: "/calendarsora.webp", // Cambia esta ruta por tu imagen
    imageAlt: "Remote Education",
    titleES: "Educación remota",
    titleEN: "Remote Education",
    descES:
      "Como médica y educadora, ofrezco un espacio de aprendizaje virtual para estudiantes universitarios. Accede a materiales, clases en vivo y recursos especializados en medicina y ciencias de la salud.",
    descEN:
      "As a physician and educator, I offer a virtual learning space for university students. Access materials, live classes, and specialized resources in medicine and health sciences.",
    ctaES: "Acceder",
    ctaEN: "Access",
  },
  {
    href: "/research",
    imageSrc: "/researchsora.webp", // Cambia esta ruta por tu imagen
    imageAlt: "Research",
    titleES: "Investigación",
    titleEN: "Research",
    descES:
      "Con raíces en salud pública, nutrida en medicina rural y natia. Desarrollada en UC Labs.",
    descEN:
      "With roots in public health, nourished in rural and native medicine perspective. Developed on UC Labs.",
    ctaES: "Ver más",
    ctaEN: "Learn more",
  },
  {
    href: "/board",
    imageSrc: "/boardzen2.png", // Cambia esta ruta por tu imagen
    imageAlt: "Virtual Board",
    titleES: "Pizarra Virtual",
    titleEN: "Virtual Board",
    descES: "Comparte ideas y experiencias en un espacio dedicado.",
    descEN: "Share ideas & experiences in a dedicated space.",
    ctaES: "Participar",
    ctaEN: "Join in",
  },
];

    // Load language preference from cookies
    useEffect(() => {
      const savedLanguage = Cookies.get("language");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }, []);

    // Update cookie when language changes
    const handleLanguageChange = () => {
      const newLanguage = language === "ES" ? "EN" : "ES";
      setLanguage(newLanguage);
      Cookies.set("language", newLanguage, { expires: 365 }); // Guardar por 1 año
    };

    return (
      <main className="bg-[#D5E8D4] text-[#5D8D7C] font-sans">
        <div className="sticky top-0 z-[100] w-full ">
          <Header language={language} onLanguageChange={handleLanguageChange} />
        </div>

        {/* 
          HERO SECTION
          Editorial layout with text-left, image-right composition
          Design philosophy: Apple-like calm confidence, scientific credibility, generous whitespace
        */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            
            {/* LEFT: Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6 md:space-y-8"
            >
              {/* Headline: bold but not aggressive */}
              <motion.h1
                variants={fadeIn}
                className="text-3xl md:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight tracking-tight"
              >
                {language === "EN"
                  ? "Medicine, Environment, and Human Health"
                  : "Medicina, Medioambiente y Salud Humana"}
              </motion.h1>

              {/* Subheadline: lighter, neutral gray-blue tone */}
              <motion.p
                variants={fadeIn}
                className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl"
              >
                {language === "EN"
                  ? "Medical Doctor with clinical experience in underserved communities and a focus on environmental and neurological health. Based in Barcelona, collaborating in research and public health initiatives."
                  : "Médica con experiencia clínica en comunidades desatendidas y enfoque en salud ambiental y neurológica. Basada en Barcelona, colaborando en investigación e iniciativas de salud pública."}
              </motion.p>

              {/* CTA: minimal, secondary, optional */}
              <motion.div variants={fadeIn}>
                <Link
                  href="/research"
                  className="inline-flex items-center gap-2 text-[#5D8D7C] hover:text-gray-900 font-medium transition-colors duration-200 group"
                >
                  <span>{language === "EN" ? "Explore Research" : "Explorar Investigación"}</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* RIGHT: Image with subtle treatment */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]"
            >
              {/* 
                Image presentation adjustments applied via CSS:
                - Desaturated slightly
                - Reduced contrast
                - Subtle matte / soft-light effect
                - Low opacity to fade symbolic elements
              */}
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src="/Hero.png"
                  alt="Dr. Candelaria Gherardi - Environmental Health Research"
                  fill
                  className="object-cover"
                  style={{
                    filter: 'saturate(0.7) contrast(0.85) brightness(1.05)',
                    opacity: 0.85,
                  }}
                  priority
                />
                {/* Subtle overlay for matte effect */}
                <div 
                  className="absolute inset-0 bg-white/10 mix-blend-soft-light pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </motion.div>

          </div>
        </section>

        {/* Sección de servicios */}

        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-700 mb-12 text-center">
            {language === "ES" ? "Descubre más" : "Discover More"}
          </h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } },
            }}
          >
            {cards.map((card, i) => {
              // Clases específicas para cada imagen
              let imageClasses = "w-full h-full object-cover";
              
              if (i === 0) { // Appointments - imagen más alejada
                imageClasses += " transform translate-y-0";
              } else if (i === 1) { // Research - imagen hacia arriba
                imageClasses += " transform -translate-y-0";
              }
              // Board (i === 2) mantiene posición normal de imagen
              
              return (
                <Link key={i} href={card.href} passHref>
                  <motion.a
                    className="block bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl transition"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                    }}
                  >
                  <div className="relative h-48 bg-amber-50 rounded-t-2xl overflow-hidden">
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt}
                      width={800}
                      height={800}
                      className={imageClasses}
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between h-56">
                    <div>
                      <h3 className="text-xl font-medium text-green-500 mb-2">
                        {language === "ES" ? card.titleES : card.titleEN}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {language === "ES" ? card.descES : card.descEN}
                      </p>
                    </div>
                    <span className="inline-block self-start text-green-500 font-semibold hover:underline">
                      {language === "ES" ? card.ctaES : card.ctaEN} →
                    </span>
                  </div>
                </motion.a>
              </Link>
              );
            })}
          </motion.div>
        </section>
        <footer className="w-full bg-[#D5E8D4] py-8 text-center text-[#5D8D7C] border-t border-[#5D8D7C]">
    <p className="text-sm">
        {language === "EN" ? "Connect: " : "Conecta: "}
        <Link href="mailto:candegherardi@gmail.com" className="hover:underline font-semibold">
            candegherardi@gmail.com
        </Link>
    </p>
    <p className="text-xs mt-2">
        © {new Date().getFullYear()} Candelaria Gherardi. All rights reserved.
    </p>
</footer>
        <div className="h-12"></div>
      </main>
    );
  }
