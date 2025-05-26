import { useState, useEffect } from "react";
import { FaStethoscope, FaHeartPulse, FaFlask, FaBrain } from "react-icons/fa6";

const icons = [FaStethoscope, FaHeartPulse, FaFlask, FaBrain];

function AnimatedIcon() {
  const [index, setIndex] = useState(0);
  const IconComponent = icons[index];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 2000); // Cambia de icono cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  return <IconComponent className="text-blue-600 text-xl transition-transform duration-500" />;
}

export default AnimatedIcon;
