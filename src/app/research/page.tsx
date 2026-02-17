"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Plus,
  LogIn,
  LogOut,
  Lock,
  Sparkles,
  Send,
  Search,
  Filter,
  X,
  FileText,
  ChevronDown,
  Loader2,
  BookOpen,
  Users,
  Tag,
  LayoutGrid,
  List,
} from "lucide-react";
import Header from "../components/header";
import { motion, AnimatePresence } from "framer-motion";
import { SiGooglescholar } from "react-icons/si";
import Link from "next/link";
import PublicationModal, { PublicationData } from "../components/PublicationModal";
import PublicationCard from "../components/PublicationCard";
import PublicationViewer from "../components/PublicationViewer";

interface TranslatableText {
  ES: string;
  EN: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Publication {
  _id: string;
  title: string;
  summary: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  coAuthors: { id: string; name: string; email: string }[];
  tags: string[];
  status: "draft" | "published" | "archived";
  isPubliclyVisible: boolean;
  readCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface TagOption {
  tag: string;
  count: number;
}

export default function ResearchPage() {
  const [language, setLanguage] = useState<"ES" | "EN">("ES");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estado de publicaciones
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoadingPublications, setIsLoadingPublications] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Estado de filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showMyPublications, setShowMyPublications] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Estado de modales
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [viewingPublication, setViewingPublication] = useState<Publication | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const isApproved = session?.user?.approved || false;
  const userRole = session?.user?.role || "pending";
  const userId = session?.user?.id || "";

  // Cargar preferencia de idioma
  useEffect(() => {
    const savedLanguage = Cookies.get("language");
    if (savedLanguage === "EN" || savedLanguage === "ES") {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = () => {
    const newLang = language === "ES" ? "EN" : "ES";
    setLanguage(newLang);
    Cookies.set("language", newLang, { expires: 365 });
  };

  // Cargar publicaciones
  const fetchPublications = useCallback(async () => {
    if (!isApproved) return;

    setIsLoadingPublications(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedTag) params.append("tag", selectedTag);
      if (selectedStatus) params.append("status", selectedStatus);
      if (showMyPublications) params.append("my", "true");

      const response = await fetch(`/api/publications?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setPublications(data.publications);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
    } finally {
      setIsLoadingPublications(false);
    }
  }, [isApproved, pagination.page, pagination.limit, searchQuery, selectedTag, selectedStatus, showMyPublications]);

  // Cargar etiquetas
  const fetchTags = useCallback(async () => {
    if (!isApproved) return;

    try {
      const response = await fetch("/api/publications/tags");
      const data = await response.json();
      if (response.ok) {
        setAvailableTags(data.tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  }, [isApproved]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Guardar publicación
  const handleSavePublication = async (data: PublicationData) => {
    try {
      const method = editingPublication ? "PATCH" : "POST";
      const body = editingPublication
        ? { ...data, id: editingPublication._id }
        : data;

      const response = await fetch("/api/publications", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchPublications();
        fetchTags();
        setEditingPublication(null);
      }
    } catch (error) {
      console.error("Error saving publication:", error);
    }
  };

  // Eliminar publicación
  const handleDeletePublication = async (id: string) => {
    try {
      const response = await fetch("/api/publications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchPublications();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting publication:", error);
    }
  };

  // Asistente IA para publicaciones
  const handleAIAssist = async (prompt: string, context: string): Promise<string> => {
    const response = await fetch("/api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        context,
        language,
        type: "publication",
      }),
    });

    const data = await response.json();
    return data.response || "";
  };

  // Chat general con IA
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isApproved) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, language }),
      });

      const data = await response.json();

      if (data.response) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            language === "ES"
              ? "Lo siento, hubo un error al procesar tu mensaje."
              : "Sorry, there was an error processing your message.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener publicación para ver
  const handleViewPublication = async (id: string) => {
    try {
      const response = await fetch(`/api/publications/${id}`);
      const data = await response.json();
      if (response.ok) {
        setViewingPublication(data);
      }
    } catch (error) {
      console.error("Error fetching publication:", error);
    }
  };

  const texts: { [key: string]: TranslatableText } = {
    sectionTitle: { ES: "Publicaciones", EN: "Publications" },
    subtitle: {
      ES: "Centro de documentos y publicaciones científicas en neurociencia",
      EN: "Neuroscience Scientific Documents and Publications Center",
    },
    fullName: {
      ES: "Plataforma de Investigación en Neurociencia",
      EN: "Neuroscience Research Platform",
    },
    loginButton: { ES: "Iniciar sesión", EN: "Sign In" },
    logoutButton: { ES: "Cerrar sesión", EN: "Sign Out" },
    pendingApproval: {
      ES: "Tu cuenta está pendiente de aprobación",
      EN: "Your account is pending approval",
    },
    chatTitle: { ES: "Asistente de Investigación IA", EN: "AI Research Assistant" },
    chatPlaceholder: {
      ES: "Pregunta sobre metodología, análisis de datos, redacción científica...",
      EN: "Ask about methodology, data analysis, scientific writing...",
    },
    loginRequired: {
      ES: "Inicia sesión para acceder al asistente de IA y recursos completos",
      EN: "Sign in to access the AI assistant and full resources",
    },
    newPublication: { ES: "Nueva publicación", EN: "New publication" },
    searchPlaceholder: { ES: "Buscar publicaciones...", EN: "Search publications..." },
    filters: { ES: "Filtros", EN: "Filters" },
    allStatus: { ES: "Todos los estados", EN: "All status" },
    draft: { ES: "Borrador", EN: "Draft" },
    published: { ES: "Publicado", EN: "Published" },
    archived: { ES: "Archivado", EN: "Archived" },
    allTags: { ES: "Todas las etiquetas", EN: "All tags" },
    myPublications: { ES: "Mis publicaciones", EN: "My publications" },
    noPublications: { ES: "No hay publicaciones aún", EN: "No publications yet" },
    createFirst: {
      ES: "Crea la primera publicación para comenzar a documentar investigaciones",
      EN: "Create the first publication to start documenting research",
    },
    confirmDelete: {
      ES: "¿Eliminar esta publicación?",
      EN: "Delete this publication?",
    },
    cancel: { ES: "Cancelar", EN: "Cancel" },
    delete: { ES: "Eliminar", EN: "Delete" },
    stats: { ES: "Estadísticas", EN: "Statistics" },
    totalPublications: { ES: "Total publicaciones", EN: "Total publications" },
    totalViews: { ES: "Lecturas totales", EN: "Total views" },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <main className="min-h-screen bg-[#D5E8D4] text-[#5D8D7C] font-sans">
      <Header language={language} onLanguageChange={handleLanguageChange} />

      {/* Header con autenticación */}
      <section className="max-w-7xl mx-auto px-8 pt-8 mt-12 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#5D8D7C] mb-2">
              {texts.fullName[language]}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{texts.subtitle[language]}</p>
          </div>

          {/* Auth Section */}
          <div className="flex flex-col items-end gap-2">
            {status === "loading" ? (
              <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-xl" />
            ) : session ? (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#5D8D7C] to-[#4a7163] rounded-full flex items-center justify-center text-white font-semibold">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                </div>
                {!isApproved && (
                  <div className="flex items-center gap-2 bg-yellow-100/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs">
                    <Lock className="w-3 h-3 text-yellow-700" />
                    <span className="text-yellow-700">{texts.pendingApproval[language]}</span>
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {texts.logoutButton[language]}
                </button>
              </div>
            ) : (
              <Link href="/sign-in">
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#5D8D7C] to-[#4a7163] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <LogIn className="w-5 h-5" />
                  {texts.loginButton[language]}
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Descripción de la plataforma */}
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          {language === "ES"
            ? "Plataforma colaborativa para la creación y gestión de documentos científicos en neurociencia. Accede a publicaciones, recursos de investigación y un asistente de IA especializado en redacción científica."
            : "Collaborative platform for creating and managing scientific documents in neuroscience. Access publications, research resources, and an AI assistant specialized in scientific writing."}
        </p>

        {/* Estadísticas rápidas */}
        {isApproved && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#5D8D7C]/10 rounded-lg">
                  <FileText className="w-5 h-5 text-[#5D8D7C]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                  <p className="text-xs text-gray-500">{texts.totalPublications[language]}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F5EDE0] rounded-lg">
                  <BookOpen className="w-5 h-5 text-[#A08C6A]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {publications.reduce((acc, p) => acc + p.readCount, 0)}
                  </p>
                  <p className="text-xs text-gray-500">{texts.totalViews[language]}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(publications.map((p) => p.authorId)).size}
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === "ES" ? "Autores" : "Authors"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{availableTags.length}</p>
                  <p className="text-xs text-gray-500">
                    {language === "ES" ? "Etiquetas" : "Tags"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Sección de Publicaciones */}
      {isApproved && (
        <section id="publicaciones" className="max-w-7xl mx-auto px-8 mb-16">
          {/* Barra de acciones */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={texts.searchPlaceholder[language]}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D8D7C] text-gray-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  showFilters
                    ? "bg-[#5D8D7C] text-white border-[#5D8D7C]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-5 h-5" />
                {texts.filters[language]}
              </button>

              <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-colors ${
                    viewMode === "grid" ? "bg-[#5D8D7C] text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-colors ${
                    viewMode === "list" ? "bg-[#5D8D7C] text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => router.push("/research/editor/new")}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#5D8D7C] to-[#4a7163] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                {language === "ES" ? "Nuevo Paper" : "New Paper"}
              </button>
              <button
                onClick={() => {
                  setEditingPublication(null);
                  setShowPublicationModal(true);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {language === "ES" ? "Nota rápida" : "Quick note"}
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
                  {/* Filtro por estado */}
                  <div className="relative min-w-[180px]">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full appearance-none px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5D8D7C]"
                    >
                      <option value="">{texts.allStatus[language]}</option>
                      <option value="draft">{texts.draft[language]}</option>
                      <option value="published">{texts.published[language]}</option>
                      <option value="archived">{texts.archived[language]}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Filtro por etiqueta */}
                  <div className="relative min-w-[180px]">
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="w-full appearance-none px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5D8D7C]"
                    >
                      <option value="">{texts.allTags[language]}</option>
                      {availableTags.map((tag) => (
                        <option key={tag.tag} value={tag.tag}>
                          {tag.tag} ({tag.count})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Mis publicaciones */}
                  <button
                    onClick={() => setShowMyPublications(!showMyPublications)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      showMyPublications
                        ? "bg-[#5D8D7C] text-white border-[#5D8D7C]"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {texts.myPublications[language]}
                  </button>

                  {/* Limpiar filtros */}
                  {(selectedStatus || selectedTag || showMyPublications) && (
                    <button
                      onClick={() => {
                        setSelectedStatus("");
                        setSelectedTag("");
                        setShowMyPublications(false);
                      }}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      {language === "ES" ? "Limpiar" : "Clear"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de publicaciones */}
          {isLoadingPublications ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#5D8D7C]" />
            </div>
          ) : publications.length === 0 ? (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-center py-20 bg-white/50 rounded-2xl"
            >
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {texts.noPublications[language]}
              </h3>
              <p className="text-gray-500 mb-6">{texts.createFirst[language]}</p>
              <button
                onClick={() => {
                  setEditingPublication(null);
                  setShowPublicationModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5D8D7C] to-[#4a7163] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                {texts.newPublication[language]}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              className={
                viewMode === "grid"
                  ? "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              <AnimatePresence>
                {publications.map((publication) => (
                  <PublicationCard
                    key={publication._id}
                    publication={publication}
                    language={language}
                    isAuthor={publication.authorId === userId}
                    isAdmin={userRole === "admin"}
                    onView={() => handleViewPublication(publication._id)}
                    onEdit={() => {
                      router.push(`/research/editor/${publication._id}`);
                    }}
                    onDelete={() => setShowDeleteConfirm(publication._id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    page === pagination.page
                      ? "bg-[#5D8D7C] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Sección de Chat IA */}
      {isApproved && (
        <section className="max-w-7xl mx-auto px-8 py-16">
          <div className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#A08C6A]" />
                <h2 className="text-3xl font-semibold text-gray-900">
                  {texts.chatTitle[language]}
                </h2>
              </div>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  chatOpen
                    ? "bg-gray-200 text-gray-700"
                    : "bg-[#C4AA82] text-white"
                }`}
              >
                {chatOpen
                  ? language === "ES"
                    ? "Minimizar"
                    : "Minimize"
                  : language === "ES"
                  ? "Abrir chat"
                  : "Open chat"}
              </button>
            </div>

            <AnimatePresence>
              {chatOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">
                        {language === "ES"
                          ? "Pregúntame sobre redacción científica, metodología de investigación, análisis de datos o cualquier aspecto de tu trabajo de investigación."
                          : "Ask me about scientific writing, research methodology, data analysis, or any aspect of your research work."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-2xl ${
                              msg.role === "user"
                                ? "bg-[#5D8D7C] text-white"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white p-4 rounded-2xl">
                            <div className="flex gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={texts.chatPlaceholder[language]}
                      className="flex-1 px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D8D7C] text-gray-800"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-gradient-to-r from-[#5D8D7C] to-[#4a7163] text-white px-6 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Prompt para usuarios no autenticados */}
      {!session && (
        <section className="max-w-7xl mx-auto px-8 py-16">
          <div className="bg-blue-50/50 backdrop-blur-sm rounded-3xl p-8 text-center">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              {texts.loginRequired[language]}
            </h3>
            <Link href="/sign-in">
              <button className="mt-4 bg-gradient-to-r from-[#5D8D7C] to-[#4a7163] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                {texts.loginButton[language]}
              </button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer con Google Scholar */}
      <section className="max-w-7xl mx-auto px-8 py-16 text-center">
        <div className="flex flex-row justify-center gap-4 items-center">
          <p className="text-2xl text-gray-700 leading-relaxed">
            {language === "ES" ? "Perfil académico completo" : "Complete academic profile"}
          </p>
          <SiGooglescholar size={48} className="text-[#5D8D7C]" />
        </div>
      </section>

      {/* Modal de publicación */}
      <PublicationModal
        isOpen={showPublicationModal}
        onClose={() => {
          setShowPublicationModal(false);
          setEditingPublication(null);
        }}
        onSave={handleSavePublication}
        initialData={
          editingPublication
            ? {
                _id: editingPublication._id,
                title: editingPublication.title,
                summary: editingPublication.summary,
                content: editingPublication.content,
                tags: editingPublication.tags,
                status: editingPublication.status,
                isPubliclyVisible: editingPublication.isPubliclyVisible,
              }
            : undefined
        }
        mode={editingPublication ? "edit" : "create"}
        language={language}
        onAIAssist={handleAIAssist}
      />

      {/* Visor de publicación */}
      <PublicationViewer
        publication={viewingPublication}
        isOpen={!!viewingPublication}
        onClose={() => setViewingPublication(null)}
        onEdit={() => {
          if (viewingPublication) {
            router.push(`/research/editor/${viewingPublication._id}`);
            setViewingPublication(null);
          }
        }}
        language={language}
        canEdit={
          viewingPublication?.authorId === userId || userRole === "admin"
        }
      />

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {texts.confirmDelete[language]}
              </h3>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {texts.cancel[language]}
                </button>
                <button
                  onClick={() => handleDeletePublication(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {texts.delete[language]}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
