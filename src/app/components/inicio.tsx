"use client";

import { SignedOut, SignInButton, SignedIn } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Footer from "./footer";
import { useState } from "react";

const Inicio = () => {
  const [language, setLanguage] = useState("ES");

  const handleLanguageChange = () => {
    setLanguage((prevLanguage) => (prevLanguage === "ES" ? "EN" : "ES"));
  };
  return (
    <div className="flex flex-col h-full min-h-screen min-w-48 md:justify-center items-center bg-gradient-to-bl from-green-100 md:border p-1 md:p-4 mt-2 md:mt-0 md:bg-gray-100">
      <SignedOut>
        <div className="flex flex-col items-center justify-center text-center mt-8 shadow-2xl p-2 md:p-8 bg-gray-100 rounded-2xl z-[100]">
          <h1 className="text-xl mt-4 md:text-3xl text-gray-700 font-semibold mb-8">
            Bienvenidos - Welcome
          </h1>
          <p className="flex text-xs md:text-base mb-2 -translate-y-4">
            En este sitio encontrarás un espacio dedicado a tu bienestar y
            conocimiento en salud. Podrás realizar consultas online para recibir
            orientación personalizada, acceder a recursos educativos y
            participar en sesiones de coaching para alcanzar tus metas de salud.
            Estoy aquí para acompañarte en cada paso hacia una vida más
            saludable.
          </p>
          <hr className="h-2" />
          <p className="text-xs md:text-base  font-semibold text-gray-600 mb-8">
            Here, you'll find a space dedicated to your well-being and health
            knowledge. You can schedule online consultations for personalized
            guidance, access educational resources, and join coaching sessions
            to achieve your health goals. We are here to support you every step
            of the way toward a healthier life.
          </p>
          <p className="text-xl font-semibold text-gray-600 mb-2 md:mb-4">
            Dra.Gherardi Arbizu
            <br></br>
            <span className="text-xs md:text-base"> Medica UBA </span>
          </p>

          <div className="flex space-x-2">
            <Button
              asChild
              className="bg-emerald-200 text-gray-950 hover:scale-100 hover:bg-purple-300 ease-in-out duration-700 text-l"
            >
              <SignInButton>Ingresar</SignInButton>
            </Button>
            <div>
              <Button
                asChild
                className="bg-emerald-200 text-gray-950 hover:bg-purple-300 ease-in-out duration-700 hover:scale-100 text-l"
              ></Button>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0  w-screen">
          <Footer
            language={language}
            handleLanguageChange={handleLanguageChange}
          />
        </div>
      </SignedOut>
    </div>
  );
};

export default Inicio;
