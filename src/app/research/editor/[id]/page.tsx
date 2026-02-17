"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Save,
  Download,
  Sparkles,
  Loader2,
  FileText,
  Check,
  Clock,
  ChevronDown,
  Plus,
  X,
  Maximize2,
  Minimize2,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor from "@/app/components/RichTextEditor";
import WritingMetrics from "@/app/components/WritingMetrics";
import ReferenceManager from "@/app/components/ReferenceManager";
import FigureManager from "@/app/components/FigureManager";
import StructuredAbstract from "@/app/components/StructuredAbstract";
import MeSHKeywords from "@/app/components/MeSHKeywords";

// ─── Types ────────────────────────────────────────────
type SectionType =
  | "abstract"
  | "introduction"
  | "methods"
  | "results"
  | "discussion"
  | "conclusion"
  | "acknowledgments"
  | "custom";

type PaperType =
  | "original-research"
  | "review"
  | "case-study"
  | "meta-analysis"
  | "short-communication"
  | "general";

interface PaperSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  order: number;
  wordLimit?: number;
}

interface FigureItem {
  id: string;
  type: "figure" | "table";
  number: number;
  caption: string;
  imageUrl?: string;
  tableHtml?: string;
  sectionId?: string;
}

interface ReferenceItem {
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

interface StructuredAbstractData {
  objective: string;
  methods: string;
  results: string;
  conclusions: string;
}

// ─── Templates ────────────────────────────────────────
const PAPER_TEMPLATES: Record<
  PaperType,
  { label: { ES: string; EN: string }; sections: Omit<PaperSection, "id">[] }
> = {
  "original-research": {
    label: { ES: "Investigación Original", EN: "Original Research" },
    sections: [
      { type: "introduction", title: "Introduction", content: "", order: 1, wordLimit: 1000 },
      { type: "methods", title: "Methods", content: "", order: 2, wordLimit: 1500 },
      { type: "results", title: "Results", content: "", order: 3, wordLimit: 1500 },
      { type: "discussion", title: "Discussion", content: "", order: 4, wordLimit: 1500 },
      { type: "conclusion", title: "Conclusions", content: "", order: 5, wordLimit: 500 },
      { type: "acknowledgments", title: "Acknowledgments", content: "", order: 6 },
    ],
  },
  review: {
    label: { ES: "Artículo de Revisión", EN: "Review Article" },
    sections: [
      { type: "introduction", title: "Introduction", content: "", order: 1 },
      { type: "methods", title: "Search Strategy & Methods", content: "", order: 2 },
      { type: "results", title: "Findings", content: "", order: 3 },
      { type: "discussion", title: "Discussion", content: "", order: 4 },
      { type: "conclusion", title: "Conclusions", content: "", order: 5 },
    ],
  },
  "case-study": {
    label: { ES: "Estudio de Caso", EN: "Case Study" },
    sections: [
      { type: "introduction", title: "Introduction", content: "", order: 1 },
      { type: "custom", title: "Case Presentation", content: "", order: 2 },
      { type: "discussion", title: "Discussion", content: "", order: 3 },
      { type: "conclusion", title: "Conclusions", content: "", order: 4 },
    ],
  },
  "meta-analysis": {
    label: { ES: "Meta-análisis", EN: "Meta-analysis" },
    sections: [
      { type: "introduction", title: "Introduction", content: "", order: 1 },
      { type: "methods", title: "Methods", content: "", order: 2 },
      { type: "custom", title: "Search Strategy", content: "", order: 3 },
      { type: "custom", title: "Data Extraction", content: "", order: 4 },
      { type: "results", title: "Results", content: "", order: 5 },
      { type: "discussion", title: "Discussion", content: "", order: 6 },
      { type: "conclusion", title: "Conclusions", content: "", order: 7 },
    ],
  },
  "short-communication": {
    label: { ES: "Comunicación Breve", EN: "Short Communication" },
    sections: [
      { type: "introduction", title: "Introduction", content: "", order: 1, wordLimit: 500 },
      { type: "methods", title: "Methods", content: "", order: 2, wordLimit: 500 },
      { type: "results", title: "Results & Discussion", content: "", order: 3, wordLimit: 1000 },
    ],
  },
  general: {
    label: { ES: "Documento General", EN: "General Document" },
    sections: [
      { type: "custom", title: "Content", content: "", order: 1 },
    ],
  },
};

// ─── Section AI prompts ───────────────────────────────
const SECTION_AI_PROMPTS: Record<
  SectionType,
  { label: { ES: string; EN: string }; suggestions: { ES: string[]; EN: string[] } }
> = {
  abstract: {
    label: { ES: "Abstract", EN: "Abstract" },
    suggestions: {
      ES: ["Genera un abstract estructurado basado en las secciones ya escritas"],
      EN: ["Generate a structured abstract based on the sections already written"],
    },
  },
  introduction: {
    label: { ES: "Introducción", EN: "Introduction" },
    suggestions: {
      ES: [
        "Redacta una introducción con contexto, gap de conocimiento y objetivos",
        "Expande la revisión de literatura existente",
        "Mejora la justificación del estudio",
      ],
      EN: [
        "Write an introduction with context, knowledge gap, and objectives",
        "Expand the existing literature review",
        "Improve the study justification",
      ],
    },
  },
  methods: {
    label: { ES: "Métodos", EN: "Methods" },
    suggestions: {
      ES: [
        "Redacta la sección de participantes y criterios de inclusión/exclusión",
        "Describe el protocolo experimental",
        "Añade la descripción del análisis estadístico",
      ],
      EN: [
        "Write the participants section with inclusion/exclusion criteria",
        "Describe the experimental protocol",
        "Add the statistical analysis description",
      ],
    },
  },
  results: {
    label: { ES: "Resultados", EN: "Results" },
    suggestions: {
      ES: [
        "Estructura los resultados en orden lógico",
        "Añade un párrafo sobre características demográficas",
        "Redacta la presentación de hallazgos principales",
      ],
      EN: [
        "Structure the results in logical order",
        "Add a paragraph about demographic characteristics",
        "Write the presentation of main findings",
      ],
    },
  },
  discussion: {
    label: { ES: "Discusión", EN: "Discussion" },
    suggestions: {
      ES: [
        "Redacta la interpretación de los resultados principales",
        "Añade comparación con la literatura existente",
        "Agrega limitaciones del estudio e implicaciones clínicas/teóricas",
      ],
      EN: [
        "Write the interpretation of main results",
        "Add comparison with existing literature",
        "Add study limitations and clinical/theoretical implications",
      ],
    },
  },
  conclusion: {
    label: { ES: "Conclusiones", EN: "Conclusions" },
    suggestions: {
      ES: ["Genera conclusiones basadas en los resultados y la discusión"],
      EN: ["Generate conclusions based on the results and discussion"],
    },
  },
  acknowledgments: {
    label: { ES: "Agradecimientos", EN: "Acknowledgments" },
    suggestions: {
      ES: ["Redacta sección de agradecimientos y financiamiento"],
      EN: ["Write acknowledgments and funding section"],
    },
  },
  custom: {
    label: { ES: "Personalizado", EN: "Custom" },
    suggestions: {
      ES: ["Genera contenido para esta sección"],
      EN: ["Generate content for this section"],
    },
  },
};

// ─── Main Component ──────────────────────────────────
export default function PaperEditorPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const [params, setParams] = useState<{ id: string } | null>(null);
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [language, setLanguage] = useState<"ES" | "EN">("ES");

  // Paper state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [paperType, setPaperType] = useState<PaperType>("original-research");
  const [sections, setSections] = useState<PaperSection[]>([]);
  const [structuredAbstract, setStructuredAbstract] = useState<StructuredAbstractData>({
    objective: "",
    methods: "",
    results: "",
    conclusions: "",
  });
  const [figures, setFigures] = useState<FigureItem[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [meshKeywords, setMeshKeywords] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [publicationStatus, setPublicationStatus] = useState<"draft" | "published" | "archived">("draft");

  // UI state
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [rightPanel, setRightPanel] = useState<"metrics" | "references" | "figures" | "none">("metrics");
  const [isNewPaper, setIsNewPaper] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(224);

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);
  const isResizingSidebar = useRef(false);
  const sidebarStartX = useRef(0);
  const sidebarStartWidth = useRef(224);

  // ── Sidebar resize handlers ─────────────────────
  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingSidebar.current = true;
    sidebarStartX.current = e.clientX;
    sidebarStartWidth.current = leftSidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [leftSidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar.current) return;
      const delta = e.clientX - sidebarStartX.current;
      const newWidth = Math.min(400, Math.max(180, sidebarStartWidth.current + delta));
      setLeftSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (isResizingSidebar.current) {
        isResizingSidebar.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Resolve params
  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  // Load language preference
  useEffect(() => {
    const savedLang = Cookies.get("language");
    if (savedLang === "EN" || savedLang === "ES") setLanguage(savedLang);
  }, []);

  // Load publication data
  useEffect(() => {
    if (!params || !session?.user?.approved) return;

    const loadPublication = async () => {
      if (params.id === "new") {
        setIsNewPaper(true);
        setShowTemplateSelector(true);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/publications/${params.id}`);
        if (!res.ok) {
          router.push("/research");
          return;
        }
        const data = await res.json();

        setTitle(data.title || "");
        setSummary(data.summary || "");
        setPaperType(data.paperType || "general");
        setSections(data.sections || []);
        setStructuredAbstract(
          data.structuredAbstract || { objective: "", methods: "", results: "", conclusions: "" }
        );
        setFigures(data.figures || []);
        setReferences(data.references || []);
        setMeshKeywords(data.meshKeywords || []);
        setTags(data.tags || []);
        setPublicationStatus(data.status || "draft");
        setLastSaved(data.lastAutoSave ? new Date(data.lastAutoSave) : null);

        // If no sections exist but has legacy content, show migration info
        if ((!data.sections || data.sections.length === 0) && data.content) {
          setSections([
            {
              id: "legacy_content",
              type: "custom",
              title: language === "ES" ? "Contenido" : "Content",
              content: data.content,
              order: 1,
            },
          ]);
        }

        if (data.sections?.length > 0) {
          setActiveSection(data.sections[0].id);
        }
      } catch {
        router.push("/research");
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    loadPublication();
  }, [params, session, router, language]);

  // Auto-save
  const triggerAutoSave = useCallback(() => {
    if (!params || params.id === "new" || !isInitialized.current) return;

    setSaveStatus("unsaved");
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);

    autoSaveTimeout.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/publications/${params.id}/autosave`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            summary,
            paperType,
            sections,
            structuredAbstract,
            figures,
            references,
            meshKeywords,
            tags,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setLastSaved(new Date(data.lastAutoSave));
          setSaveStatus("saved");
        } else {
          setSaveStatus("unsaved");
        }
      } catch {
        setSaveStatus("unsaved");
      }
    }, 3000);
  }, [params, title, summary, paperType, sections, structuredAbstract, figures, references, meshKeywords, tags]);

  // Watch for changes
  useEffect(() => {
    if (isInitialized.current && params?.id !== "new") {
      triggerAutoSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, summary, sections, structuredAbstract, figures, references, meshKeywords, tags, triggerAutoSave]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, []);

  // ─── Handlers ──────────────────────────────────────
  const applyTemplate = (type: PaperType) => {
    const template = PAPER_TEMPLATES[type];
    setPaperType(type);
    setSections(
      template.sections.map((s, i) => ({
        ...s,
        id: `section_${Date.now()}_${i}`,
      }))
    );
    setShowTemplateSelector(false);
    if (template.sections.length > 0) {
      setActiveSection(`section_${Date.now()}_0`);
    }
  };

  const handleCreatePaper = async () => {
    if (!title.trim() || !summary.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          content: sections.map((s) => s.content).join("\n"),
          tags,
          status: "draft",
          paperType,
          sections,
          structuredAbstract,
          figures,
          references,
          meshKeywords,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsNewPaper(false);
        isInitialized.current = true;
        router.replace(`/research/editor/${data._id}`);
      }
    } catch (error) {
      console.error("Error creating paper:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!params || params.id === "new") {
      await handleCreatePaper();
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");
    try {
      // Save version snapshot first
      await fetch(`/api/publications/${params.id}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: `Manual save` }),
      });

      // Then auto-save current state
      const res = await fetch(`/api/publications/${params.id}/autosave`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          paperType,
          sections,
          structuredAbstract,
          figures,
          references,
          meshKeywords,
          tags,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastSaved(new Date(data.lastAutoSave));
        setSaveStatus("saved");
      }
    } catch {
      setSaveStatus("unsaved");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!params || params.id === "new") return;

    setIsSaving(true);
    try {
      await fetch("/api/publications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          title,
          summary,
          content: sections.map((s) => `<h2>${s.title}</h2>\n${s.content}`).join("\n\n"),
          tags,
          status: "published",
          paperType,
          sections,
          structuredAbstract,
          figures,
          references,
          meshKeywords,
        }),
      });
      setPublicationStatus("published");
    } catch (error) {
      console.error("Error publishing:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: string) => {
    if (!params || params.id === "new") return;

    try {
      const res = await fetch(`/api/publications/${params.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = format === "latex" ? "tex" : format === "markdown" ? "md" : format;
        a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export error:", error);
    }
    setShowExportMenu(false);
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, content } : s))
    );
  };

  const addSection = () => {
    const newSection: PaperSection = {
      id: `section_${Date.now()}`,
      type: "custom",
      title: language === "ES" ? "Nueva Sección" : "New Section",
      content: "",
      order: sections.length + 1,
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) return;
    const updated = sections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setSections(updated);
    if (activeSection === id) {
      setActiveSection(updated[0]?.id || null);
    }
  };

  const renameSectionTitle = (id: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  // AI assistance for specific section
  const handleSectionAI = async (sectionId: string, prompt: string) => {
    setIsAILoading(true);
    try {
      const section = sections.find((s) => s.id === sectionId);
      const allContext = sections
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");

      const fullPrompt = `[Section: ${section?.title}]\n${prompt}\n\nCurrent section content:\n${section?.content || "(empty)"}`;

      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: fullPrompt,
          context: allContext,
          language,
          type: "publication",
          sectionType: section?.type || "custom",
        }),
      });

      const data = await res.json();
      if (data.response) {
        updateSectionContent(
          sectionId,
          (section?.content || "") + (section?.content ? "<p></p>" : "") + data.response
        );
      }
    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setIsAILoading(false);
      setAiPrompt("");
      setShowAIPanel(false);
    }
  };

  // ─── Text constants ─────────────────────────────────
  const t = {
    back: language === "ES" ? "Volver a investigación" : "Back to research",
    save: language === "ES" ? "Guardar" : "Save",
    publish: language === "ES" ? "Publicar" : "Publish",
    export: language === "ES" ? "Exportar" : "Export",
    saved: language === "ES" ? "Guardado" : "Saved",
    saving: language === "ES" ? "Guardando..." : "Saving...",
    unsaved: language === "ES" ? "Sin guardar" : "Unsaved",
    titlePlaceholder: language === "ES" ? "Título del paper..." : "Paper title...",
    summaryPlaceholder: language === "ES" ? "Resumen (máx 500 car)..." : "Summary (max 500 chars)...",
    addSection: language === "ES" ? "Agregar sección" : "Add section",
    selectTemplate: language === "ES" ? "Seleccionar Plantilla" : "Select Template",
    templateDesc:
      language === "ES"
        ? "Elige el tipo de paper para pre-configurar las secciones IMRaD"
        : "Choose the paper type to pre-configure IMRaD sections",
    createPaper: language === "ES" ? "Crear Paper" : "Create Paper",
    focusMode: language === "ES" ? "Modo Foco" : "Focus Mode",
    aiAssist: language === "ES" ? "IA por sección" : "Section AI",
    metrics: language === "ES" ? "Métricas" : "Metrics",
    refs: language === "ES" ? "Referencias" : "References",
    figs: language === "ES" ? "Figuras" : "Figures",
    abstract: language === "ES" ? "Abstract" : "Abstract",
    keywords: language === "ES" ? "Keywords" : "Keywords",
    exportMd: "Markdown (.md)",
    exportHtml: "HTML (print-ready)",
    exportLatex: "LaTeX (.tex)",
    exportTxt: "Plain text (.txt)",
  };

  // ─── Loading / Auth guard ───────────────────────────
  if (authStatus === "loading" || isLoading || !params) {
    return (
      <div className="min-h-screen bg-[#D5E8D4] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5D8D7C]" />
      </div>
    );
  }

  if (!session?.user?.approved) {
    router.push("/research");
    return null;
  }

  // ─── Template Selector ──────────────────────────────
  if (showTemplateSelector) {
    return (
      <div className="min-h-screen bg-[#D5E8D4] flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8">
          <button
            onClick={() => router.push("/research")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.selectTemplate}</h1>
          <p className="text-gray-600 mb-8">{t.templateDesc}</p>

          {/* Title & Summary first */}
          <div className="space-y-4 mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5D8D7C]"
              maxLength={300}
            />
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t.summaryPlaceholder}
              rows={2}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5D8D7C] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.entries(PAPER_TEMPLATES) as [PaperType, (typeof PAPER_TEMPLATES)[PaperType]][]).map(
              ([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-[#5D8D7C] hover:bg-[#5D8D7C]/5 transition-all text-center group"
                >
                  <FileText className="w-8 h-8 text-gray-400 group-hover:text-[#5D8D7C] transition-colors" />
                  <span className="font-medium text-gray-800 text-sm">
                    {template.label[language]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {template.sections.length}{" "}
                    {language === "ES" ? "secciones" : "sections"}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Active section data ────────────────────────────
  const currentSection = sections.find((s) => s.id === activeSection);
  const sectionAIHints = currentSection
    ? SECTION_AI_PROMPTS[currentSection.type] || SECTION_AI_PROMPTS.custom
    : SECTION_AI_PROMPTS.custom;

  // ─── Main Editor Layout ─────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Bar ─────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 z-30 sticky top-0">
        <button
          onClick={() => router.push("/research")}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          title={t.back}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            className="w-full text-lg font-semibold text-gray-900 border-0 focus:outline-none focus:ring-0 bg-transparent truncate"
          />
        </div>

        {/* Save status */}
        <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
          {saveStatus === "saved" && (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-green-600">{t.saved}</span>
            </>
          )}
          {saveStatus === "saving" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t.saving}</span>
            </>
          )}
          {saveStatus === "unsaved" && (
            <>
              <Clock className="w-3 h-3 text-orange-500" />
              <span className="text-orange-500">{t.unsaved}</span>
            </>
          )}
          {lastSaved && (
            <span className="ml-1 text-gray-300">
              {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Focus mode */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`p-2 rounded-lg transition-colors ${
              focusMode ? "bg-[#5D8D7C] text-white" : "hover:bg-gray-100 text-gray-600"
            }`}
            title={t.focusMode}
          >
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Save */}
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {t.save}
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isNewPaper}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {t.export}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 min-w-[180px]">
                {[
                  { format: "html", label: t.exportHtml },
                  { format: "markdown", label: t.exportMd },
                  { format: "latex", label: t.exportLatex },
                  { format: "text", label: t.exportTxt },
                ].map((opt) => (
                  <button
                    key={opt.format}
                    onClick={() => handleExport(opt.format)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Publish */}
          {!isNewPaper && (
            <button
              onClick={handlePublish}
              disabled={isSaving || publicationStatus === "published"}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#5D8D7C] hover:bg-[#4a7163] text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {publicationStatus === "published"
                ? language === "ES"
                  ? "Publicado"
                  : "Published"
                : t.publish}
            </button>
          )}

          {/* Create (for new papers) */}
          {isNewPaper && (
            <button
              onClick={handleCreatePaper}
              disabled={isSaving || !title.trim() || !summary.trim()}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#5D8D7C] hover:bg-[#4a7163] text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              {t.createPaper}
            </button>
          )}
        </div>
      </header>

      {/* ── Main Content ────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Sidebar: Sections Nav ───────────── */}
        {!focusMode && (
          <aside
            style={{ width: leftSidebarWidth }}
            className="bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0"
          >
            {/* Summary */}
            <div className="p-3 border-b border-gray-200">
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={t.summaryPlaceholder}
                maxLength={500}
                rows={2}
                className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C] resize-none"
              />
              <p className="text-[10px] text-gray-400 text-right">{summary.length}/500</p>
            </div>

            {/* Structured Abstract */}
            <div className="p-3 border-b border-gray-200 overflow-y-auto max-h-60">
              <StructuredAbstract
                abstract={structuredAbstract}
                onChange={setStructuredAbstract}
                language={language}
              />
            </div>

            {/* Section Tabs */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
                {language === "ES" ? "Secciones" : "Sections"}
              </p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left group ${
                    activeSection === section.id
                      ? "bg-[#5D8D7C] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="flex-1 truncate">{section.title}</span>
                  {sections.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                        activeSection === section.id
                          ? "hover:bg-white/20"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </button>
              ))}
              <button
                onClick={addSection}
                className="w-full flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                {t.addSection}
              </button>
            </nav>

            {/* MeSH Keywords */}
            <div className="p-3 border-t border-gray-200">
              <MeSHKeywords
                keywords={meshKeywords}
                onChange={setMeshKeywords}
                language={language}
              />
            </div>

            {/* Tags */}
            <div className="p-3 border-t border-gray-200">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Tags
              </p>
              <div className="flex flex-wrap gap-1 mb-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#5D8D7C]/10 text-[#5D8D7C] rounded-full text-[10px]"
                  >
                    {tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <X className="w-2 h-2" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder={language === "ES" ? "Agregar tag..." : "Add tag..."}
                className="w-full px-2 py-1 border border-gray-200 rounded text-[10px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5D8D7C]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !tags.includes(val)) {
                      setTags([...tags, val]);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </div>
          </aside>
        )}

        {/* ── Sidebar Resize Handle ────────────────── */}
        {!focusMode && (
          <div
            onMouseDown={handleSidebarMouseDown}
            className="w-1 hover:w-1.5 bg-transparent hover:bg-[#5D8D7C]/30 cursor-col-resize transition-all flex-shrink-0 relative group"
            title={language === "ES" ? "Arrastrar para redimensionar" : "Drag to resize"}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
        )}

        {/* ── Center: Editor ───────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#fafaf8]">
          {currentSection ? (
            <div className={`max-w-4xl mx-auto ${focusMode ? "py-12 px-8" : "py-6 px-6"}`}>
              {/* Section title (editable) */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => renameSectionTitle(currentSection.id, e.target.value)}
                  className="text-xl font-bold text-gray-900 border-0 focus:outline-none bg-transparent flex-1"
                />

                {/* AI Button */}
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    showAIPanel
                      ? "bg-[#C4AA82] text-white"
                      : "bg-[#FAF6F0] text-[#8B7755] hover:bg-[#F5EDE0]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.aiAssist}
                </button>
              </div>

              {/* AI Panel for section */}
              <AnimatePresence>
                {showAIPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="bg-[#FAF6F0] border border-[#E8DCC8] rounded-xl p-4 space-y-3">
                      <p className="text-xs font-medium text-[#7A6B4F]">
                        {language === "ES"
                          ? `Asistente IA para: ${currentSection.title}`
                          : `AI Assistant for: ${currentSection.title}`}
                      </p>

                      {/* Quick suggestions */}
                      <div className="flex flex-wrap gap-1.5">
                        {sectionAIHints.suggestions[language].map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSectionAI(currentSection.id, suggestion)}
                            disabled={isAILoading}
                            className="text-[11px] px-2.5 py-1 bg-white border border-[#E8DCC8] rounded-full text-[#8B7755] hover:bg-[#F5EDE0] transition-colors disabled:opacity-50"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>

                      {/* Custom prompt */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && aiPrompt.trim()) {
                              handleSectionAI(currentSection.id, aiPrompt);
                            }
                          }}
                          placeholder={
                            language === "ES"
                              ? "Escribe tu instrucción para la IA..."
                              : "Write your instruction for the AI..."
                          }
                          className="flex-1 px-3 py-1.5 border border-[#E8DCC8] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#C4AA82] bg-white"
                          disabled={isAILoading}
                        />
                        <button
                          onClick={() => handleSectionAI(currentSection.id, aiPrompt)}
                          disabled={isAILoading || !aiPrompt.trim()}
                          className="px-3 py-1.5 bg-[#C4AA82] text-white rounded-lg text-xs hover:bg-[#B39770] disabled:opacity-50 flex items-center gap-1"
                        >
                          {isAILoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          {language === "ES" ? "Generar" : "Generate"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rich Text Editor */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
                <RichTextEditor
                  content={currentSection.content}
                  onChange={(content) => updateSectionContent(currentSection.id, content)}
                  placeholder={
                    language === "ES"
                      ? `Escribe el contenido de ${currentSection.title}...`
                      : `Write the content of ${currentSection.title}...`
                  }
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>
                {language === "ES"
                  ? "Selecciona una sección para comenzar"
                  : "Select a section to start"}
              </p>
            </div>
          )}
        </main>

        {/* ── Right Sidebar: Tools ─────────────────── */}
        {!focusMode && (
          <aside className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
            {/* Panel Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {[
                { key: "metrics" as const, label: t.metrics },
                { key: "references" as const, label: t.refs },
                { key: "figures" as const, label: t.figs },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRightPanel(rightPanel === tab.key ? "none" : tab.key)}
                  className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                    rightPanel === tab.key
                      ? "text-[#5D8D7C] border-b-2 border-[#5D8D7C] bg-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {rightPanel === "metrics" && (
                <WritingMetrics
                  sections={sections}
                  structuredAbstract={structuredAbstract}
                  language={language}
                />
              )}

              {rightPanel === "references" && (
                <ReferenceManager
                  references={references}
                  onChange={setReferences}
                  language={language}
                />
              )}

              {rightPanel === "figures" && (
                <FigureManager
                  figures={figures}
                  onChange={setFigures}
                  sections={sections.map((s) => ({ id: s.id, title: s.title }))}
                  language={language}
                />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
