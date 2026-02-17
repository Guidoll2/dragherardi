"use client";

import { countWords } from "./WritingMetrics";

interface StructuredAbstractProps {
  abstract: {
    objective: string;
    methods: string;
    results: string;
    conclusions: string;
  };
  onChange: (abstract: {
    objective: string;
    methods: string;
    results: string;
    conclusions: string;
  }) => void;
  language: "ES" | "EN";
}

export default function StructuredAbstract({
  abstract,
  onChange,
  language,
}: StructuredAbstractProps) {
  const totalWords =
    countWords(abstract.objective) +
    countWords(abstract.methods) +
    countWords(abstract.results) +
    countWords(abstract.conclusions);

  const isOverLimit = totalWords > 250;

  const fields = [
    {
      key: "objective" as const,
      label: language === "ES" ? "Objetivo" : "Objective",
      placeholder:
        language === "ES"
          ? "Describe el propósito principal del estudio..."
          : "Describe the main purpose of the study...",
    },
    {
      key: "methods" as const,
      label: language === "ES" ? "Métodos" : "Methods",
      placeholder:
        language === "ES"
          ? "Resume el diseño del estudio, participantes, mediciones e intervenciones..."
          : "Summarize study design, participants, measurements, and interventions...",
    },
    {
      key: "results" as const,
      label: language === "ES" ? "Resultados" : "Results",
      placeholder:
        language === "ES"
          ? "Presenta los hallazgos principales con datos cuantitativos..."
          : "Present main findings with quantitative data...",
    },
    {
      key: "conclusions" as const,
      label: language === "ES" ? "Conclusiones" : "Conclusions",
      placeholder:
        language === "ES"
          ? "Interpreta los resultados y su relevancia clínica o teórica..."
          : "Interpret results and their clinical or theoretical relevance...",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          {language === "ES" ? "Abstract Estructurado" : "Structured Abstract"}
        </h3>
        <span
          className={`text-xs font-medium ${
            isOverLimit ? "text-red-500" : "text-gray-500"
          }`}
        >
          {totalWords}/250 {language === "ES" ? "palabras" : "words"}
        </span>
      </div>

      {fields.map((field) => {
        const fieldWords = countWords(abstract[field.key]);
        return (
          <div key={field.key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#5D8D7C] uppercase tracking-wider">
                {field.label}
              </label>
              <span className="text-[10px] text-gray-400">{fieldWords} w</span>
            </div>
            <textarea
              value={abstract[field.key]}
              onChange={(e) =>
                onChange({ ...abstract, [field.key]: e.target.value })
              }
              placeholder={field.placeholder}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 
                focus:outline-none focus:ring-1 focus:ring-[#5D8D7C] resize-none
                placeholder:text-gray-400"
            />
          </div>
        );
      })}

      {isOverLimit && (
        <p className="text-xs text-red-500">
          ⚠️{" "}
          {language === "ES"
            ? "El abstract excede el límite típico de 250 palabras"
            : "Abstract exceeds the typical 250-word limit"}
        </p>
      )}
    </div>
  );
}
