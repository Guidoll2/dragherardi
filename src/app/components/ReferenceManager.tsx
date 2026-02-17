"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search as SearchIcon, Loader2, Plus, ExternalLink, BookOpen } from "lucide-react";

interface Reference {
  id: string;
  order: number;
  doi?: string;
  title: string;
  authors: string;
  journal?: string;
  year: string;
  volume?: string;
  pages?: string;
  url?: string;
}

interface SearchResult {
  doi: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  volume: string;
  pages: string;
  url: string;
}

interface ReferenceManagerProps {
  references: Reference[];
  onChange: (refs: Reference[]) => void;
  language: "ES" | "EN";
}

export default function ReferenceManager({
  references,
  onChange,
  language,
}: ReferenceManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualRef, setManualRef] = useState<Partial<Reference>>({});
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const t = {
    title: language === "ES" ? "Referencias" : "References",
    search: language === "ES" ? "Buscar por DOI o título..." : "Search by DOI or title...",
    addManual: language === "ES" ? "Agregar manual" : "Add manually",
    searchCrossRef: language === "ES" ? "Buscar en CrossRef" : "Search CrossRef",
    noResults: language === "ES" ? "Sin resultados" : "No results",
    add: language === "ES" ? "Agregar" : "Add",
    remove: language === "ES" ? "Eliminar" : "Remove",
    refTitle: language === "ES" ? "Título" : "Title",
    authors: language === "ES" ? "Autores" : "Authors",
    journal: language === "ES" ? "Revista" : "Journal",
    year: language === "ES" ? "Año" : "Year",
    volume: language === "ES" ? "Volumen" : "Volume",
    pages: language === "ES" ? "Páginas" : "Pages",
    doi: "DOI",
    save: language === "ES" ? "Guardar" : "Save",
    cancel: language === "ES" ? "Cancelar" : "Cancel",
    citationHint:
      language === "ES"
        ? "Usa [N] en el texto para citar (ej: [1])"
        : "Use [N] in text to cite (e.g.: [1])",
  };

  // Debounced search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const isDoi = query.match(/^10\.\d{4,}/);
        const params = isDoi ? `doi=${encodeURIComponent(query)}` : `q=${encodeURIComponent(query)}`;
        const res = await fetch(`/api/references/search?${params}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const addReference = (result: SearchResult) => {
    const newRef: Reference = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      order: references.length + 1,
      doi: result.doi,
      title: result.title,
      authors: result.authors,
      journal: result.journal,
      year: result.year,
      volume: result.volume,
      pages: result.pages,
      url: result.url,
    };
    onChange([...references, newRef]);
    setSearchResults([]);
    setSearchQuery("");
  };

  const addManualReference = () => {
    if (!manualRef.title || !manualRef.authors || !manualRef.year) return;

    const newRef: Reference = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      order: references.length + 1,
      title: manualRef.title,
      authors: manualRef.authors,
      year: manualRef.year,
      journal: manualRef.journal || "",
      volume: manualRef.volume || "",
      pages: manualRef.pages || "",
      doi: manualRef.doi || "",
      url: manualRef.doi ? `https://doi.org/${manualRef.doi}` : "",
    };
    onChange([...references, newRef]);
    setManualRef({});
    setManualMode(false);
  };

  const removeReference = (id: string) => {
    const updated = references
      .filter((r) => r.id !== id)
      .map((r, idx) => ({ ...r, order: idx + 1 }));
    onChange(updated);
  };

  const moveReference = (id: string, direction: "up" | "down") => {
    const idx = references.findIndex((r) => r.id === id);
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === references.length - 1)
    )
      return;

    const newRefs = [...references];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newRefs[idx], newRefs[swapIdx]] = [newRefs[swapIdx], newRefs[idx]];
    onChange(newRefs.map((r, i) => ({ ...r, order: i + 1 })));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#5D8D7C]" />
          <h3 className="font-semibold text-sm text-gray-800">
            {t.title} ({references.length})
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setManualMode(false);
              setShowSearch(!showSearch);
            }}
            className="text-xs px-3 py-1 bg-[#5D8D7C] text-white rounded-lg hover:bg-[#4a7163] transition-colors"
          >
            <SearchIcon className="w-3 h-3 inline mr-1" />
            {t.searchCrossRef}
          </button>
          <button
            onClick={() => {
              setShowSearch(false);
              setManualMode(!manualMode);
            }}
            className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            {t.addManual}
          </button>
        </div>
      </div>

      {/* Hint */}
      <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-600">
        💡 {t.citationHint}
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="p-3 border-b border-gray-200 bg-gray-50/50">
          <div className="relative mb-2">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5D8D7C] text-gray-900"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 border border-gray-100 rounded-lg bg-white hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {result.authors}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {result.journal} {result.year}
                      {result.doi && (
                        <>
                          {" · "}
                          <span className="text-blue-500">doi:{result.doi}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => addReference(result)}
                    className="flex-shrink-0 p-1 bg-[#5D8D7C] text-white rounded hover:bg-[#4a7163]"
                    title={t.add}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!isSearching && searchQuery.length >= 3 && searchResults.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">{t.noResults}</p>
          )}
        </div>
      )}

      {/* Manual Entry */}
      {manualMode && (
        <div className="p-3 border-b border-gray-200 bg-gray-50/50 space-y-2">
          <input
            type="text"
            value={manualRef.title || ""}
            onChange={(e) => setManualRef({ ...manualRef, title: e.target.value })}
            placeholder={`${t.refTitle} *`}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C]"
          />
          <input
            type="text"
            value={manualRef.authors || ""}
            onChange={(e) => setManualRef({ ...manualRef, authors: e.target.value })}
            placeholder={`${t.authors} *`}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C]"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={manualRef.year || ""}
              onChange={(e) => setManualRef({ ...manualRef, year: e.target.value })}
              placeholder={`${t.year} *`}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C]"
            />
            <input
              type="text"
              value={manualRef.journal || ""}
              onChange={(e) => setManualRef({ ...manualRef, journal: e.target.value })}
              placeholder={t.journal}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C]"
            />
            <input
              type="text"
              value={manualRef.doi || ""}
              onChange={(e) => setManualRef({ ...manualRef, doi: e.target.value })}
              placeholder={t.doi}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setManualMode(false);
                setManualRef({});
              }}
              className="text-xs px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {t.cancel}
            </button>
            <button
              onClick={addManualReference}
              disabled={!manualRef.title || !manualRef.authors || !manualRef.year}
              className="text-xs px-3 py-1 bg-[#5D8D7C] text-white rounded-lg hover:bg-[#4a7163] disabled:opacity-50"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}

      {/* Reference List */}
      <div className="max-h-72 overflow-y-auto">
        {references.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            {language === "ES"
              ? "Aún no hay referencias. Usa CrossRef para buscar o agrega manualmente."
              : "No references yet. Use CrossRef to search or add manually."}
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {references.map((ref) => (
              <div
                key={ref.id}
                className="flex items-start gap-2 p-2 hover:bg-gray-50 group"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-[#5D8D7C]/10 text-[#5D8D7C] rounded text-xs font-bold flex items-center justify-center mt-0.5">
                  {ref.order}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">
                    {ref.title}
                  </p>
                  <p className="text-[10px] text-gray-500 line-clamp-1">
                    {ref.authors} ({ref.year})
                    {ref.journal ? `. ${ref.journal}` : ""}
                    {ref.volume ? `, ${ref.volume}` : ""}
                    {ref.pages ? `, ${ref.pages}` : ""}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-blue-500"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => moveReference(ref.id, "up")}
                    className="p-1 text-gray-400 hover:text-gray-700 text-[10px]"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveReference(ref.id, "down")}
                    className="p-1 text-gray-400 hover:text-gray-700 text-[10px]"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeReference(ref.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
