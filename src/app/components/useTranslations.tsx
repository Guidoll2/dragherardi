import { useState, useEffect } from 'react';

// src/types/translations.ts
// Asume que tus archivos JSON tienen una estructura anidada de objetos y cadenas.
// Si tus traducciones pueden contener otros tipos (números, booleanos), ajusta esta interfaz.
export interface Translations {
  [key: string]: string | Translations;
}

// Importa tus archivos JSON. TypeScript ahora sabe su estructura.
import enTranslations from '../../locales/en.json';
import esTranslations from '../../locales/es.json';

// Asegúrate de que 'translations' sea de tipo Record<string, Translations>
const allTranslations: Record<string, Translations> = {
  en: enTranslations as Translations, // Castea para asegurar el tipo
  es: esTranslations as Translations, // Castea para asegurar el tipo
};

/**
 * Un hook personalizado para manejar traducciones en una aplicación React.
 * Permite acceder a traducciones anidadas y reemplazar marcadores de posición.
 *
 * @param language El idioma actual para las traducciones (ej. 'en', 'es').
 * @returns Una función `translate` que toma una clave de traducción y reemplazos opcionales.
 */
const useTranslations = (language: string) => {
  // Inicializa 't' con el tipo correcto (Translations)
  // Si el idioma no existe, se usa 'enTranslations' como fallback.
  const [t, setT] = useState<Translations>(allTranslations[language] || enTranslations);

  // Actualiza las traducciones cuando cambia el idioma.
  useEffect(() => {
    setT(allTranslations[language] || enTranslations);
  }, [language]);

  /**
   * Traduce una clave dada, buscando en el objeto de traducciones anidado.
   * Si la clave no se encuentra en el idioma actual, intenta buscarla en inglés.
   * Permite reemplazar marcadores de posición en la cadena traducida (ej. '{name}').
   *
   * @param key La clave de traducción (ej. 'common.hello', 'messages.welcome').
   * @param replacements Un objeto con claves y valores para reemplazar marcadores de posición.
   * @returns La cadena traducida o la clave original si no se encuentra ninguna traducción.
   */
  const translate = (key: string, replacements?: { [key: string]: string | number }): string => {
    // Función auxiliar para buscar una clave en un objeto de traducciones.
    // El acumulador `acc` puede ser un objeto de traducciones, una cadena o indefinido.
    const findTranslation = (
      translationObject: Translations,
      translationKey: string
    ): string | undefined => {
      const parts = translationKey.split('.');
      // El acumulador `currentValue` empieza con el objeto de traducciones completo.
      // A medida que se reduce, puede convertirse en una sub-traducción (objeto) o la traducción final (cadena).
      const foundValue = parts.reduce(
        (currentValue: Translations | string | undefined, part: string) => {
          // Si el valor actual no es un objeto o es nulo, no podemos seguir la ruta.
          if (typeof currentValue !== 'object' || currentValue === null) {
            return undefined;
          }
          // Intenta acceder a la siguiente parte de la clave.
          return currentValue[part];
        },
        translationObject as Translations // Castea el valor inicial a Translations
      );

      // Si el valor encontrado es una cadena, es la traducción.
      if (typeof foundValue === 'string') {
        return foundValue;
      }
      // Si no es una cadena, significa que la ruta no terminó en una traducción de cadena.
      return undefined;
    };

    let text: string | undefined = findTranslation(t, key);

    // Si la traducción no se encuentra en el idioma actual, intenta con inglés.
    if (typeof text !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}". Attempting fallback to English.`);
      text = findTranslation(enTranslations, key);

      // Si aún no se encuentra, devuelve la clave original.
      if (typeof text !== 'string' || text === undefined) {
        console.warn(`Translation key "${key}" not found in English fallback. Returning key.`);
        return key;
      }
    }

    // Reemplaza los marcadores de posición como {name} en la cadena traducida.
    if (replacements && text) { // Asegúrate de que 'text' no sea undefined antes de reemplazar
      for (const repKey in replacements) {
        text = text.replace(new RegExp(`{${repKey}}`, 'g'), String(replacements[repKey]));
      }
    }

    // Asegúrate de que siempre se devuelva una cadena.
    return text || key;
  };

  return translate;
};

export default useTranslations;