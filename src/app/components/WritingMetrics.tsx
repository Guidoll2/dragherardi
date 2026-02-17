"use client";

interface WritingMetricsProps {
  sections: { title: string; content: string; wordLimit?: number }[];
  structuredAbstract?: {
    objective: string;
    methods: string;
    results: string;
    conclusions: string;
  };
  language: "ES" | "EN";
}

function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function countChars(html: string): number {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim().length;
}

function readingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

function fleschReadingEase(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
  if (!text) return 0;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((acc, word) => {
    return acc + countSyllables(word);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const score =
    206.835 -
    1.015 * (words.length / sentences.length) -
    84.6 * (syllables / words.length);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-záéíóúñü]/g, "");
  if (word.length <= 2) return 1;
  const vowels = word.match(/[aeiouyáéíóúü]+/gi);
  return vowels ? vowels.length : 1;
}

function getReadabilityLabel(
  score: number,
  lang: "ES" | "EN"
): { label: string; color: string } {
  if (score >= 60)
    return {
      label: lang === "ES" ? "Fácil de leer" : "Easy to read",
      color: "text-green-600",
    };
  if (score >= 30)
    return {
      label: lang === "ES" ? "Moderado" : "Moderate",
      color: "text-yellow-600",
    };
  return {
    label: lang === "ES" ? "Dificil (académico)" : "Difficult (academic)",
    color: "text-orange-600",
  };
}

export default function WritingMetrics({
  sections,
  structuredAbstract,
  language,
}: WritingMetricsProps) {
  // Abstract word count
  const abstractWords = structuredAbstract
    ? countWords(
        `${structuredAbstract.objective} ${structuredAbstract.methods} ${structuredAbstract.results} ${structuredAbstract.conclusions}`
      )
    : 0;

  // Per-section metrics
  const sectionMetrics = sections.map((s) => ({
    title: s.title,
    words: countWords(s.content),
    limit: s.wordLimit,
  }));

  // Total
  const totalWords =
    abstractWords + sectionMetrics.reduce((a, s) => a + s.words, 0);
  const totalChars = sections.reduce((a, s) => a + countChars(s.content), 0);
  const allContent = sections.map((s) => s.content).join(" ");
  const readability = fleschReadingEase(allContent);
  const readabilityInfo = getReadabilityLabel(readability, language);
  const readTime = readingTime(totalWords);

  const t = {
    metrics: language === "ES" ? "Métricas" : "Metrics",
    words: language === "ES" ? "palabras" : "words",
    chars: language === "ES" ? "caracteres" : "characters",
    readTime: language === "ES" ? "min lectura" : "min read",
    readability: language === "ES" ? "Legibilidad" : "Readability",
    abstract: language === "ES" ? "Abstract" : "Abstract",
    total: language === "ES" ? "Total" : "Total",
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {t.metrics}
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="font-bold text-lg text-gray-900">{totalWords}</span>
          <span className="text-gray-500 ml-1">{t.words}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="font-bold text-lg text-gray-900">{totalChars}</span>
          <span className="text-gray-500 ml-1">{t.chars}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="font-bold text-lg text-gray-900">{readTime}</span>
          <span className="text-gray-500 ml-1">{t.readTime}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className={`font-bold text-sm ${readabilityInfo.color}`}>
            {readabilityInfo.label}
          </span>
          <span className="text-gray-400 ml-1 text-[10px]">({readability})</span>
        </div>
      </div>

      {/* Per-section word counts */}
      <div className="space-y-1">
        {abstractWords > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{t.abstract}</span>
            <span
              className={`font-medium ${
                abstractWords > 250
                  ? "text-red-500"
                  : abstractWords > 200
                  ? "text-yellow-600"
                  : "text-gray-700"
              }`}
            >
              {abstractWords}/250 {t.words}
            </span>
          </div>
        )}
        {sectionMetrics.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 truncate max-w-[120px]">{s.title}</span>
            <span
              className={`font-medium ${
                s.limit && s.words > s.limit
                  ? "text-red-500"
                  : "text-gray-700"
              }`}
            >
              {s.words}
              {s.limit ? `/${s.limit}` : ""} {t.words}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
          <span className="font-semibold text-gray-700">{t.total}</span>
          <span className="font-bold text-gray-900">
            {totalWords} {t.words}
          </span>
        </div>
      </div>
    </div>
  );
}

export { countWords, countChars };
