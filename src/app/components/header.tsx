import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import AnimatedIcon from "../components/animatedIcons"; // Asegúrate de ajustar la ruta según tu estructura de archivos

type HeaderProps = {
  language: string;
  onLanguageChange: () => void;
};

export default function Header({ language }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <Link href="/">
        <div className="flex items-center space-x-4">
          <AnimatedIcon />
          <div className="flex flex-col leading-tight ">
            <span className="font-semibold text-gray-800 text-lg">C.Gherardi</span>
            <span className="text-sm text-gray-500">
              {language === "EN"
                ? "Health & Environmental Professional"
                : "Profesional de Salud y Medioambiente"}
            </span>
          </div>
        </div>
      </Link>
      <UserButton />
    </header>
  );
}
