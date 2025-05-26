import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Agrega un nuevo objeto de configuración para los archivos .d.ts
  {
    files: ["**/*.d.ts"], // Aplica esta configuración a todos los archivos .d.ts
    rules: {
      "no-var": "off" // Deshabilita la regla no-var para estos archivos
    }
  }
];

export default eslintConfig;