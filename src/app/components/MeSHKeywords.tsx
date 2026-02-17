"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Hash } from "lucide-react";

interface MeSHTerm {
  label: string;
  uri: string;
}

interface MeSHKeywordsProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  language: "ES" | "EN";
}

export default function MeSHKeywords({
  keywords,
  onChange,
  language,
}: MeSHKeywordsProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MeSHTerm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const t = {
    title: language === "ES" ? "Keywords MeSH" : "MeSH Keywords",
    placeholder:
      language === "ES"
        ? "Buscar términos MeSH..."
        : "Search MeSH terms...",
    hint:
      language === "ES"
        ? "Los términos MeSH (Medical Subject Headings) son el vocabulario controlado de PubMed"
        : "MeSH terms (Medical Subject Headings) are PubMed's controlled vocabulary",
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/mesh?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data.terms || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const addKeyword = (term: string) => {
    if (!keywords.includes(term)) {
      onChange([...keywords, term]);
    }
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeKeyword = (term: string) => {
    onChange(keywords.filter((k) => k !== term));
  };

  return (
    <div ref={wrapperRef}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-[#5D8D7C]" />
          <h4 className="text-sm font-semibold text-gray-800">{t.title}</h4>
        </div>
        <span className="text-[10px] text-gray-400">{keywords.length} terms</span>
      </div>

      <p className="text-[10px] text-gray-400 mb-2">{t.hint}</p>

      {/* Current keywords */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#FAF6F0] text-[#8B7755] rounded-full text-xs border border-[#E8DCC8]"
            >
              {kw}
              <button
                onClick={() => removeKeyword(kw)}
                className="hover:text-red-500"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              e.preventDefault();
              addKeyword(query.trim());
            }
          }}
          placeholder={t.placeholder}
          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 
            focus:outline-none focus:ring-1 focus:ring-[#C4AA82] pr-8"
        />
        {isLoading && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-400" />
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {suggestions
              .filter((s) => !keywords.includes(s.label))
              .map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => addKeyword(term.label)}
                  className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-[#FAF6F0] hover:text-[#8B7755]"
                >
                  {term.label}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
