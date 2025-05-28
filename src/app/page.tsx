  "use client";

  import { useEffect, useState } from "react";
  import Cookies from "js-cookie";
  import Header from "./components/header";
  import Link from "next/link";
  import { motion } from "framer-motion";

  export default function Home() {
    const [hover, setHover] = useState(false);
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
        img: "/Iaresearch.webp",
        titleES: "Investigación",
        titleEN: "Research",
        descES:
          "Con raíces en salud pública, nutrida en medicina indígena Mapuche & desarrollada en UC Labs.",
        descEN:
          "With roots in public health, nourished in native Mapuche medicine perspective & developed on UC Labs.",
        ctaES: "Ver más",
        ctaEN: "Learn more",
      },
      {
        href: "/turnos",
        img: "/turnos.webp",
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
        href: "/board",
        img: "/board.webp",
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

        <div
          id="language"
          className="relative cursor-pointer "
          onClick={handleLanguageChange}
        >
          <span
            className={`absolute text-xs top-16 right-8 font-semibold text-gray-600 bg-emerald-100 p-2 rounded-lg shadow-lg transition-all duration-700 ease-in-out transform ${
              hover
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            Change to {language === "ES" ? "English" : "Spanish"} site
          </span>
          <p
            className="text-sm absolute top-2 md:top-5 border p-2 rounded-lg  right-2 md:right-14 font-semibold text-gray-700 bg-emerald-200 hover:bg-purple-200 ease-in-out duration-700 shadow-lg"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            EN | ES
          </p>
        </div>

      <section className="grid grid-cols-1 md:grid-cols-2 items-center max-w-4xl mx-auto px-6 py-16 bg-gray-50 rounded-2xl shadow-lg mt-12">
  {/* Texto: Título, subtítulo y CTA */}
  <motion.div
    className="space-y-6"
    initial="hidden"
    animate="visible"
    variants={stagger}
  >
    <motion.h1
      variants={fadeIn}
      className="text-4xl md:text-5xl font-playfair font-semibold text-gray-700"
    >
      {language === "EN"
        ? "Understand, respect, and care"
        : "Comprender, respetar y cuidar"}
    </motion.h1>

    <motion.p
      variants={fadeIn}
      className="text-lg font-inter text-gray-600"
    >
      {language === "EN"
        ? "Medical Doctor & PhD Student in Environmental Health Science at UC Berkeley."
        : "Medica estudiante de PhD en Ciencias de la Salud y Medioambiente en UC Berkeley."}
    </motion.p>
    <Link href={"mailto:candegherardi@gmail.com"} target="_blank">
      <motion.button
        variants={fadeIn}
        className="px-6 py-3 font-inter font-semibold rounded-full bg-green-600 text-white shadow-md hover:scale-105 transition-transform mt-4"
      >
        {language === "EN" ? "Contact me" : "Contacto"}
      </motion.button>
    </Link>
  </motion.div>
  {/* Imágenes: Hero visuals */}
  <motion.div
    variants={fadeIn}
    className="flex justify-center mt-8 md:mt-0 w-full h-full" 
  >
    <div className="flex flex-row gap-2 w-full h-full"> {/* Y aquí */}
      <img
        src="/logotop.png"
        alt="Brain Visualization"
        className="rounded-lg shadow-2xl border-2 border-teal-600 object-cover w-full h-full" 
      />
    </div>
  </motion.div>
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
            {cards.map((card, i) => (
              <Link key={i} href={card.href} passHref>
                <motion.a
                  className="block bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl transition"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                  }}
                >
                  <div className="relative h-fit w-full">
                    <img
                      src={card.img}
                      alt={language === "ES" ? card.titleES : card.titleEN}
                      width={500}
                      height={300}
                      loading="lazy"
                      className="hover:scale-105 transition-transform duration-700 object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between h-56">
                    <div>
                      <h3 className="text-xl font-medium text-green-400 mb-2">
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
            ))}
          </motion.div>
        </section>
        <div className="h-12"></div>
      </main>
    );
  }
