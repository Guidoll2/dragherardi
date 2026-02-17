"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Calendar,
  Eye,
  Tag,
  ArrowLeft,
  Edit,
  Share2,
  Printer,
  ExternalLink,
} from "lucide-react";

interface PublicationViewerProps {
  publication: {
    _id: string;
    title: string;
    summary: string;
    content: string;
    authorName: string;
    authorEmail: string;
    coAuthors?: { id: string; name: string; email: string }[];
    tags: string[];
    status: "draft" | "published" | "archived";
    isPubliclyVisible: boolean;
    readCount: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  language: "ES" | "EN";
  canEdit: boolean;
}

export default function PublicationViewer({
  publication,
  isOpen,
  onClose,
  onEdit,
  language,
  canEdit,
}: PublicationViewerProps) {
  if (!publication) return null;

  const texts = {
    back: { ES: "Volver", EN: "Back" },
    edit: { ES: "Editar", EN: "Edit" },
    share: { ES: "Compartir", EN: "Share" },
    print: { ES: "Imprimir", EN: "Print" },
    authors: { ES: "Autores", EN: "Authors" },
    views: { ES: "lecturas", EN: "views" },
    updated: { ES: "Actualizado", EN: "Updated" },
    published: { ES: "Publicado", EN: "Published" },
    draft: { ES: "Borrador", EN: "Draft" },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ES" ? "es-ES" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication.title,
          text: publication.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled:", error);
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="min-h-screen bg-white"
          >
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#5D8D7C] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {texts.back[language]}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-[#5D8D7C] hover:bg-gray-100 rounded-lg transition-colors"
                    title={texts.share[language]}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 text-gray-500 hover:text-[#5D8D7C] hover:bg-gray-100 rounded-lg transition-colors"
                    title={texts.print[language]}
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  {canEdit && onEdit && (
                    <button
                      onClick={onEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-[#5D8D7C] text-white rounded-lg hover:bg-[#4a7163] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      {texts.edit[language]}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <article className="max-w-4xl mx-auto px-6 py-12">
              {/* Estado del borrador */}
              {publication.status === "draft" && (
                <div className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2 text-yellow-700">
                  <span className="text-sm font-medium">
                    ⚠️ {texts.draft[language]}
                  </span>
                </div>
              )}

              {/* Título */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {publication.title}
              </h1>

              {/* Metadatos */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-5 h-5" />
                  <div>
                    <span className="font-medium">{publication.authorName}</span>
                    {publication.coAuthors && publication.coAuthors.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {" "}
                        +{publication.coAuthors.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {publication.publishedAt
                      ? `${texts.published[language]} ${formatDate(publication.publishedAt)}`
                      : formatDate(publication.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>
                    {publication.readCount} {texts.views[language]}
                  </span>
                </div>

                {publication.isPubliclyVisible && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    <ExternalLink className="w-3 h-3" />
                    Público
                  </span>
                )}
              </div>

              {/* Resumen destacado */}
              <div className="mb-10 p-6 bg-[#D5E8D4]/30 rounded-2xl border-l-4 border-[#5D8D7C]">
                <p className="text-lg text-gray-700 leading-relaxed italic">
                  {publication.summary}
                </p>
              </div>

              {/* Contenido HTML */}
              <div
                className="prose prose-lg max-w-none 
                  prose-headings:text-gray-900 prose-headings:font-semibold
                  prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-4
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
                  prose-a:text-[#5D8D7C] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:my-4 prose-ol:my-4
                  prose-li:text-gray-700 prose-li:my-1
                  prose-blockquote:border-l-4 prose-blockquote:border-[#5D8D7C] prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-gray-600
                  prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-gray-900 prose-pre:text-gray-100
                  prose-img:rounded-xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: publication.content }}
              />

              {/* Etiquetas al final */}
              {publication.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {publication.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5D8D7C]/10 text-[#5D8D7C] rounded-full text-sm font-medium"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coautores */}
              {publication.coAuthors && publication.coAuthors.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    {texts.authors[language]}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {publication.authorName}
                    </span>
                    {publication.coAuthors.map((author) => (
                      <span
                        key={author.id}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {author.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
