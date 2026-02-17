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

        {/* Sección de Research - Diseño Apple-like con Glassmorphism */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-5xl font-semibold text-gray-800 mb-16 text-center">
            {language === "ES" ? "Desarrollo de Tesis Doctoral" : "Doctoral Thesis Development"}
          </h2>

          <motion.div
            className="max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <Link href="/research" passHref>
              <motion.div
                className="group relative overflow-hidden rounded-3xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl" />
                
                {/* Border gradient effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 via-transparent to-white/20 p-[2px]">
                  <div className="w-full h-full bg-gradient-to-br from-[#f0f9ff]/90 via-[#e0f2fe]/70 to-[#dbeafe]/60 rounded-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-12 md:p-16">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    
                    {/* Left side - Image with frosted glass effect */}
                    <div className="relative">
                      <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-2xl">
                        <Image
                          src="/researchsora.webp"
                          alt="Neuroscience Research"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Image overlay for better text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      
                      {/* Floating badge */}
                      <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-white/40">
                        <p className="text-sm font-semibold text-gray-800">
                          {language === "ES" ? "Neurociencia" : "Neuroscience"}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Text content */}
                    <div className="space-y-6">
                      <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
                        {language === "ES" ? "Investigación en Neurociencia" : "Neuroscience Research"}
                      </h3>
                      
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {language === "ES"
                          ? "Espacio dedicado al desarrollo de tesis doctorales en neurociencia. Accede a recursos, documentos y herramientas de investigación de nivel internacional."
                          : "Dedicated space for developing doctoral theses in neuroscience. Access resources, documents, and international-level research tools."}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-5 py-3 rounded-xl">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-gray-700">
                            {language === "ES" ? "Documentos disponibles" : "Documents available"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-5 py-3 rounded-xl">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-gray-700">
                            {language === "ES" ? "Asistente IA" : "AI Assistant"}
                          </span>
                        </div>
                      </div>

                      {/* CTA Button with glass effect */}
                      <div className="pt-4">
                        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#5D8D7C]/90 to-[#4a7163]/90 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:gap-5">
                          <span className="text-white font-semibold text-lg">
                            {language === "ES" ? "Acceder al espacio" : "Access the space"}
                          </span>
                          <span className="text-white text-xl">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 blur-xl" />
                </div>
              </motion.div>
            </Link>
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
