import Link from "next/link";

interface FooterProps {
  language: string;
  handleLanguageChange: () => void;
}

function Footer({ language, handleLanguageChange }: FooterProps) {
  return (
    <footer className="flex flex-col bg-emerald-100 shadow-lg justify-center w-full h-fit p-2 gap-3">
      <div className="flex flex-col items-center justify-center gap-2 mt-2">
        <p className="text-xs md:text-base font-light text-gray-600 text-center">
          {" "}
          {language === "ES"
            ? "Copyright © 2025 Dra.Gherardi Arbizu | Todos los derechos reservados"
            : "Copyright © 2025 Dra.Gherardi Arbizu | All rights reserved"}{" "}
        </p>
        <Link href="https://guidollaurado.vercel.app/" target="_blank">
          <span className="text-xs md:text-xs font-light text-gray-600">
            {language === "ES"
              ? "Diseño y desarrollo Guido Llaurado"
              : "Design & development Guido Llaurado"}
          </span>
        </Link>
      </div>

      <div className="flex flex-row items-center justify-center">
        <button
          onClick={handleLanguageChange}
          className="text-xs md:text-base font-light text-slate-200"
        ></button>
      </div>
    </footer>
  );
}

export default Footer;
