"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Send,
  Sparkles,
  ChevronDown,
  Loader2,
  Tag,
  Eye,
  EyeOff,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface PublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (publication: PublicationData) => Promise<void>;
  initialData?: PublicationData;
  mode: "create" | "edit";
  language: "ES" | "EN";
  onAIAssist?: (prompt: string, context: string) => Promise<string>;
}

export interface PublicationData {
  _id?: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  isPubliclyVisible: boolean;
}

const SUGGESTED_TAGS = [
  "Neurociencia",
  "EEG",
  "fNIRS",
  "Mindfulness",
  "Emociones",
  "Consciencia",
  "Sonobiología",
  "Sincronía cerebral",
  "Bienestar",
  "Meditación",
  "Investigación",
  "Metodología",
];

export default function PublicationModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  language,
  onAIAssist,
}: PublicationModalProps) {
  const [formData, setFormData] = useState<PublicationData>({
    title: "",
    summary: "",
    content: "",
    tags: [],
    status: "draft",
    isPubliclyVisible: false,
  });
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const texts = {
    createTitle: { ES: "Nueva Publicación", EN: "New Publication" },
    editTitle: { ES: "Editar Publicación", EN: "Edit Publication" },
    titleLabel: { ES: "Título", EN: "Title" },
    titlePlaceholder: { ES: "Título de la publicación...", EN: "Publication title..." },
    summaryLabel: { ES: "Resumen", EN: "Summary" },
    summaryPlaceholder: {
      ES: "Breve descripción (máx. 500 caracteres)...",
      EN: "Brief description (max. 500 characters)...",
    },
    contentLabel: { ES: "Contenido", EN: "Content" },
    tagsLabel: { ES: "Etiquetas", EN: "Tags" },
    addTag: { ES: "Añadir etiqueta", EN: "Add tag" },
    saveDraft: { ES: "Guardar borrador", EN: "Save draft" },
    publish: { ES: "Publicar", EN: "Publish" },
    aiAssistant: { ES: "Asistente IA", EN: "AI Assistant" },
    aiPlaceholder: {
      ES: "Describe qué necesitas: generar un esquema, redactar un párrafo, mejorar el tono...",
      EN: "Describe what you need: generate an outline, write a paragraph, improve the tone...",
    },
    aiGenerate: { ES: "Generar", EN: "Generate" },
    publiclyVisible: { ES: "Visible públicamente", EN: "Publicly visible" },
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        summary: "",
        content: "",
        tags: [],
        status: "draft",
        isPubliclyVisible: false,
      });
    }
  }, [initialData, isOpen]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
    }
    setNewTag("");
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({ ...formData, status });
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIAssist = async () => {
    if (!aiPrompt.trim() || !onAIAssist) return;

    setIsAILoading(true);
    try {
      const response = await onAIAssist(aiPrompt, formData.content);
      // Insertar la respuesta al final del contenido actual
      setFormData((prev) => ({
        ...prev,
        content: prev.content + (prev.content ? "<p></p>" : "") + response,
      }));
      setAiPrompt("");
    } catch (error) {
      console.error("Error con asistente IA:", error);
    } finally {
      setIsAILoading(false);
    }
  };

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(newTag.toLowerCase()) &&
      !formData.tags.includes(tag)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === "create"
                  ? texts.createTitle[language]
                  : texts.editTitle[language]}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {texts.titleLabel[language]}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={texts.titlePlaceholder[language]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D8D7C] text-gray-900"
                  maxLength={300}
                />
              </div>

              {/* Resumen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {texts.summaryLabel[language]}
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  placeholder={texts.summaryPlaceholder[language]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D8D7C] text-gray-900 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {formData.summary.length}/500
                </p>
              </div>

              {/* Editor de contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {texts.contentLabel[language]}
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, content }))
                  }
                  placeholder={
                    language === "ES"
                      ? "Comienza a escribir tu publicación..."
                      : "Start writing your publication..."
                  }
                />
              </div>

              {/* Panel de IA */}
              {onAIAssist && (
                <div className="border border-[#E8DCC8] rounded-xl overflow-hidden bg-[#FAF6F0]/50">
                  <button
                    onClick={() => setShowAIPanel(!showAIPanel)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#F5EDE0]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#A08C6A]" />
                      <span className="font-medium text-[#7A6B4F]">
                        {texts.aiAssistant[language]}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#A08C6A] transition-transform ${
                        showAIPanel ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showAIPanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 space-y-3">
                          <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder={texts.aiPlaceholder[language]}
                            className="w-full px-4 py-3 border border-[#E8DCC8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C4AA82] text-gray-900 bg-white resize-none"
                            rows={2}
                          />
                          <button
                            onClick={handleAIAssist}
                            disabled={isAILoading || !aiPrompt.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C4AA82] to-[#B39770] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAILoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            {texts.aiGenerate[language]}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Etiquetas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {texts.tagsLabel[language]}
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-[#5D8D7C]/10 text-[#5D8D7C] rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => {
                      setNewTag(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onFocus={() => setShowTagSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newTag);
                      }
                    }}
                    placeholder={texts.addTag[language]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D8D7C] text-gray-900"
                  />

                  {showTagSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredSuggestions.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleAddTag(tag)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Visibilidad pública */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isPubliclyVisible: !prev.isPubliclyVisible,
                    }))
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    formData.isPubliclyVisible
                      ? "border-[#5D8D7C] bg-[#5D8D7C]/10 text-[#5D8D7C]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {formData.isPubliclyVisible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  {texts.publiclyVisible[language]}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleSave("draft")}
                disabled={isLoading || !formData.title || !formData.summary || !formData.content}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {texts.saveDraft[language]}
              </button>
              <button
                onClick={() => handleSave("published")}
                disabled={isLoading || !formData.title || !formData.summary || !formData.content}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5D8D7C] to-[#4a7163] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {texts.publish[language]}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
