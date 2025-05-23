import { useState, useEffect } from 'react';
import { Translations } from '@/types/translations'; // <-- Importa la interfaz Translations

// Importa tus archivos JSON. TypeScript ahora sabe su estructura.
import enTranslations from '../../locales/en.json';
import esTranslations from '../../locales/es.json';

// Asegúrate de que 'translations' sea de tipo Record<string, Translations>
const translations: Record<string, Translations> = {
  en: enTranslations as Translations, // Castea para asegurar el tipo
  es: esTranslations as Translations, // Castea para asegurar el tipo
};

const useTranslations = (language: string) => {
  // Inicializa 't' con el tipo correcto (Translations)
  const [t, setT] = useState<Translations>(translations[language] || enTranslations);

  useEffect(() => {
    setT(translations[language] || enTranslations);
  }, [language]);

  // Modifica la función 'translate' para ser más explícita con los tipos
  const translate = (key: string, replacements?: { [key: string]: string | number }) => {
    // Asegura que el objeto inicial para reduce sea del tipo Translations
    let text: string | undefined = key.split('.').reduce((obj: any, part: string) => {
      // Aquí obj ya no es '{}' sino 'any', lo que permite el acceso indexado
      return obj && typeof obj === 'object' ? obj[part] : undefined;
    }, t as any); // Castea el objeto inicial de 'reduce' a 'any'

    if (typeof text !== 'string') {
      console.warn(`Translation key "<span class="math-inline">\{key\}" not found for language "</span>{language}".`);
      // Fallback a inglés, asegurando que se busca en el tipo correcto
      text = key.split('.').reduce((obj: any, part: string) => {
        return obj && typeof obj === 'object' ? obj[part] : undefined;
      }, enTranslations as any);

      if (typeof text !== 'string' || text === undefined) {
          return key; // Si todavía no se encuentra, devuelve la clave misma
      }
    }

    // Reemplaza los marcadores de posición como {name}
    if (replacements) {
      for (const repKey in replacements) {
        text = text.replace(new RegExp(`{${repKey}}`, 'g'), String(replacements[repKey]));
      }
    }
    return text;
  };

  return translate;
};

export default useTranslations;