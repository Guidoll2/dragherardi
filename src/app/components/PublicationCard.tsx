"use client";

import { motion } from "framer-motion";
import {
  Tag,
  User,
  Calendar,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  EyeOff,
  Clock,
} from "lucide-react";

interface PublicationCardProps {
  publication: {
    _id: string;
    title: string;
    summary: string;
    authorName: string;
    tags: string[];
    status: "draft" | "published" | "archived";
    isPubliclyVisible: boolean;
    readCount: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
  language: "ES" | "EN";
  isAuthor: boolean;
  isAdmin: boolean;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PublicationCard({
  publication,
  language,
  isAuthor,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}: PublicationCardProps) {
  const texts = {
    draft: { ES: "Borrador", EN: "Draft" },
    published: { ES: "Publicado", EN: "Published" },
    archived: { ES: "Archivado", EN: "Archived" },
    views: { ES: "lecturas", EN: "views" },
    edit: { ES: "Editar", EN: "Edit" },
    delete: { ES: "Eliminar", EN: "Delete" },
    read: { ES: "Leer", EN: "Read" },
    public: { ES: "Público", EN: "Public" },
    private: { ES: "Interno", EN: "Internal" },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ES" ? "es-ES" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyles = () => {
    switch (publication.status) {
      case "draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "published":
        return "bg-green-100 text-green-700 border-green-200";
      case "archived":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const canEdit = isAuthor || isAdmin;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className="p-6">
        {/* Header con estado y visibilidad */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles()}`}
            >
              {publication.status === "draft" ? (
                <FileText className="w-3 h-3" />
              ) : publication.status === "published" ? (
                <Send className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {texts[publication.status][language]}
            </span>

            <span
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                publication.isPubliclyVisible
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {publication.isPubliclyVisible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              {publication.isPubliclyVisible
                ? texts.public[language]
                : texts.private[language]}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3 h-3" />
            <span>
              {publication.readCount} {texts.views[language]}
            </span>
          </div>
        </div>

        {/* Título */}
        <h3
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#5D8D7C] transition-colors cursor-pointer"
          onClick={onView}
        >
          {publication.title}
        </h3>

        {/* Resumen */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {publication.summary}
        </p>

        {/* Etiquetas */}
        {publication.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {publication.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 bg-[#5D8D7C]/10 text-[#5D8D7C] rounded-full text-xs"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {publication.tags.length > 4 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{publication.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {publication.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(publication.publishedAt || publication.createdAt)}
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="px-3 py-1.5 text-sm text-[#5D8D7C] hover:bg-[#5D8D7C]/10 rounded-lg transition-colors"
            >
              {texts.read[language]}
            </button>

            {canEdit && onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-[#5D8D7C] hover:bg-gray-100 rounded-lg transition-colors"
                title={texts.edit[language]}
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {canEdit && onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={texts.delete[language]}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
