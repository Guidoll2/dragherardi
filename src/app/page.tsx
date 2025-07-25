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
    href: "/appointments",
    imageSrc: "/calendarsora.webp", // Cambia esta ruta por tu imagen
    imageAlt: "Online Appointments",
    titleES: "Reuniones remotas",
    titleEN: "Online Appointments",
    descES:
      "Como investigadora en salud y medioambiente, me interesa colaborar con quienes necesiten orientación, quieran compartir ideas o conversar sobre temas relacionados. Podemos coordinar una reunión.",
    descEN:
      "As a researcher in health and environmental science, I welcome the opportunity to connect with others seeking guidance, collaboration, or meaningful conversation. Feel free to schedule a meeting.",
    ctaES: "Reservar",
    ctaEN: "Book now",
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





{/* Bordes múltiples con bg-amber-50 */}

      <div className="hidden md:block w-fit h-fit mx-auto mt-12">
      <section className="grid grid-cols-1 md:grid-cols-2 items-center max-w-4xl mx-auto">
        {/* Imagen como fondo con texto superpuesto */}
        <motion.div
          variants={fadeIn}
          className="relative col-span-2 flex justify-center mt-8 md:mt-0 w-full"
        >
          <div className="relative w-full max-w-4xl">
            <Image
              src="/soracortado2.png"
              alt="Book with content"
              className="w-full h-auto object-contain"
              width={1000}
              height={1000}
            />
            
            {/* Texto superpuesto en la página izquierda del libro */}
            <motion.div
              className="absolute top-[15%] left-[8%] w-[35%] h-[70%] flex flex-col justify-center px-4"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.h1
                variants={fadeIn}
                className="text-2xl md:text-4xl font-playfair font-semibold text-gray-800 mb-4 leading-tight"
              >
                {language === "EN"
                  ? "Understand, respect, and care"
                  : "Comprender, respetar y cuidar"}
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-sm md:text-base font-inter text-gray-700 leading-relaxed"
              >
                {language === "EN"
                  ? "Medical Doctor & PhD Student in Environmental Health Science at UC Berkeley."
                  : "Medica estudiante de PhD en Ciencias de la Salud y Medioambiente en UC Berkeley."}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>


<div className="md:hidden mt-24 mb-48 mx-1">
        {/* Contenedor con la imagen de fondo y texto superpuesto */}
        <motion.div
          className="relative w-full"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          {/* Imagen del libro */}
          <Image
            src="/bookeado2.png"
            alt="Book with content"
            className="w-full  object-contain"
            width={1000}
            height={1000}
          />
          
          {/* Texto superpuesto en la página izquierda del libro */}
          <motion.div
            className="absolute top-[15%] left-[8%] w-[35%] h-[70%] flex flex-col justify-center px-2"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.h1
              variants={fadeIn}
              className="text-lg font-poppins font-semibold text-gray-800 mb-2 leading-tight"
            >
              {language === "EN"
                ? "Understand, respect, and care"
                : "Comprender, respetar y cuidar"}
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-xs font-inter text-gray-700 leading-relaxed"
            >
              {language === "EN"
                ? "Medical Doctor & PhD Student in Environmental Health Science at UC Berkeley."
                : "Medica estudiante de PhD en Ciencias de la Salud y Medioambiente en UC Berkeley."}
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

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
        <Link href="mailto:candegherardi@berkeley.edu" className="hover:underline font-semibold">
            candegherardi@berkeley.edu
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
