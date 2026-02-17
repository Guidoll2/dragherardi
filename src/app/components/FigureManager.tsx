"use client";

import { useState } from "react";
import { Image as ImageIcon, Table2, X, GripVertical } from "lucide-react";

interface Figure {
  id: string;
  type: "figure" | "table";
  number: number;
  caption: string;
  imageUrl?: string;
  tableHtml?: string;
  sectionId?: string;
}

interface FigureManagerProps {
  figures: Figure[];
  onChange: (figs: Figure[]) => void;
  sections: { id: string; title: string }[];
  language: "ES" | "EN";
}

export default function FigureManager({
  figures,
  onChange,
  sections,
  language,
}: FigureManagerProps) {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newFigure, setNewFigure] = useState<Partial<Figure>>({
    type: "figure",
    caption: "",
    imageUrl: "",
  });

  const t = {
    title: language === "ES" ? "Figuras y Tablas" : "Figures & Tables",
    addFigure: language === "ES" ? "Añadir Figura" : "Add Figure",
    addTable: language === "ES" ? "Añadir Tabla" : "Add Table",
    caption: language === "ES" ? "Leyenda" : "Caption",
    imageUrl: language === "ES" ? "URL de la imagen" : "Image URL",
    section: language === "ES" ? "Sección" : "Section",
    none: language === "ES" ? "General" : "General",
    noFigures:
      language === "ES"
        ? "Sin figuras ni tablas"
        : "No figures or tables",
    save: language === "ES" ? "Guardar" : "Save",
    cancel: language === "ES" ? "Cancelar" : "Cancel",
    hint:
      language === "ES"
        ? "Usa Fig. N o Tabla N en el texto (ej: Fig. 1)"
        : "Use Fig. N or Table N in text (e.g.: Fig. 1)",
    captionPlaceholder:
      language === "ES"
        ? "Descripción detallada de la figura/tabla..."
        : "Detailed description of the figure/table...",
  };

  const figureCount = figures.filter((f) => f.type === "figure").length;
  const tableCount = figures.filter((f) => f.type === "table").length;

  const addFigure = () => {
    if (!newFigure.caption) return;

    const isFigure = newFigure.type === "figure";
    const currentCount = isFigure ? figureCount : tableCount;

    const fig: Figure = {
      id: `fig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: newFigure.type || "figure",
      number: currentCount + 1,
      caption: newFigure.caption || "",
      imageUrl: newFigure.imageUrl || "",
      tableHtml: newFigure.tableHtml || "",
      sectionId: newFigure.sectionId || "",
    };

    onChange([...figures, fig]);
    setNewFigure({ type: "figure", caption: "", imageUrl: "" });
    setShowAddPanel(false);
  };

  const removeFigure = (id: string) => {
    const removed = figures.find((f) => f.id === id);
    if (!removed) return;

    const updated = figures
      .filter((f) => f.id !== id)
      .map((f) => {
        if (f.type === removed.type && f.number > removed.number) {
          return { ...f, number: f.number - 1 };
        }
        return f;
      });
    onChange(updated);
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(figures.map((f) => (f.id === id ? { ...f, caption } : f)));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#5D8D7C]" />
          <h3 className="font-semibold text-sm text-gray-800">
            {t.title} ({figures.length})
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setNewFigure({ type: "figure", caption: "", imageUrl: "" });
              setShowAddPanel(!showAddPanel);
            }}
            className="text-xs px-2 py-1 bg-[#5D8D7C] text-white rounded-lg hover:bg-[#4a7163] transition-colors flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            {t.addFigure}
          </button>
          <button
            onClick={() => {
              setNewFigure({ type: "table", caption: "", tableHtml: "" });
              setShowAddPanel(!showAddPanel);
            }}
            className="text-xs px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 flex items-center gap-1"
          >
            <Table2 className="w-3 h-3" />
            {t.addTable}
          </button>
        </div>
      </div>

      {/* Hint */}
      <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-600">
        💡 {t.hint}
      </div>

      {/* Add Panel */}
      {showAddPanel && (
        <div className="p-3 border-b border-gray-200 bg-gray-50/50 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setNewFigure({ ...newFigure, type: "figure" })}
              className={`text-xs px-3 py-1 rounded-lg ${
                newFigure.type === "figure"
                  ? "bg-[#5D8D7C] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <ImageIcon className="w-3 h-3 inline mr-1" />
              Figura
            </button>
            <button
              onClick={() => setNewFigure({ ...newFigure, type: "table" })}
              className={`text-xs px-3 py-1 rounded-lg ${
                newFigure.type === "table"
                  ? "bg-[#5D8D7C] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Table2 className="w-3 h-3 inline mr-1" />
              Tabla
            </button>
          </div>

          {newFigure.type === "figure" && (
            <input
              type="text"
              value={newFigure.imageUrl || ""}
              onChange={(e) =>
                setNewFigure({ ...newFigure, imageUrl: e.target.value })
              }
              placeholder={t.imageUrl}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C]"
            />
          )}

          <textarea
            value={newFigure.caption || ""}
            onChange={(e) =>
              setNewFigure({ ...newFigure, caption: e.target.value })
            }
            placeholder={t.captionPlaceholder}
            rows={2}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C] resize-none"
          />

          <select
            value={newFigure.sectionId || ""}
            onChange={(e) =>
              setNewFigure({ ...newFigure, sectionId: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C]"
          >
            <option value="">{t.none}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddPanel(false)}
              className="text-xs px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {t.cancel}
            </button>
            <button
              onClick={addFigure}
              disabled={!newFigure.caption}
              className="text-xs px-3 py-1 bg-[#5D8D7C] text-white rounded-lg hover:bg-[#4a7163] disabled:opacity-50"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}

      {/* Figure List */}
      <div className="max-h-64 overflow-y-auto">
        {figures.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">{t.noFigures}</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {figures.map((fig) => (
              <div
                key={fig.id}
                className="flex items-start gap-2 p-2 hover:bg-gray-50 group"
              >
                <GripVertical className="w-3 h-3 text-gray-300 mt-1 flex-shrink-0" />
                <div className="w-6 h-6 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
                  {fig.type === "figure" ? (
                    <ImageIcon className="w-3 h-3 text-gray-500" />
                  ) : (
                    <Table2 className="w-3 h-3 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800">
                    {fig.type === "figure" ? "Fig." : "Table"} {fig.number}
                  </p>
                  <input
                    type="text"
                    value={fig.caption}
                    onChange={(e) => updateCaption(fig.id, e.target.value)}
                    className="w-full text-[10px] text-gray-500 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#5D8D7C] focus:outline-none px-0 py-0.5 bg-transparent"
                  />
                </div>
                <button
                  onClick={() => removeFigure(fig.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
