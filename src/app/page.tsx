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
                  ? "Neuroscience Doctoral Research"
                  : "Investigación Doctoral en Neurociencia"}
              </motion.h1>

              {/* Subheadline: lighter, neutral gray-blue tone */}
              <motion.p
                variants={fadeIn}
                className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl"
              >
                {language === "EN"
                  ? "Dedicated space for developing doctoral theses in neuroscience. Access research tools, collaborate with experts, and advance your scientific work at an international level."
                  : "Espacio dedicado al desarrollo de tesis doctorales en neurociencia. Accede a herramientas de investigación, colabora con expertos y avanza tu trabajo científico a nivel internacional."}
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
                  src="/logo2026sinfondo.png"
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
