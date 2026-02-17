"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  FileImage,
  Link as LinkIcon,
  Video,
  Plus,
  X,
  Calendar,
  Users,
  Trash2,
  Edit,
  Lock,
} from "lucide-react";

interface Material {
  _id: string;
  title: string;
  description: string;
  type: string;
  fileUrl?: string;
  externalLink?: string;
  content?: string;
  createdAt: string;
}

interface Session {
  _id: string;
  title: string;
  description: string;
  scheduledFor: string;
  duration: number;
  isLive: boolean;
  streamUrl?: string;
  isPrivate?: boolean;
  accessCode?: string;
}

export default function ClassroomManagement() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<{ _id: string; name: string; description: string; students: string[]; isActive: boolean } | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<"materials" | "sessions" | "students">("materials");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [language, setLanguage] = useState("ES");

  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    type: "text",
    content: "",
    fileUrl: "",
    externalLink: "",
  });

  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    scheduledFor: "",
    duration: 60,
    streamUrl: "",
    isPrivate: false,
    accessCode: "",
  });

  useEffect(() => {
    loadClassroomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  async function loadClassroomData() {
    try {
      // Cargar datos del aula
      const classroomRes = await fetch(`/api/education/classrooms`);
      const classroomData = await classroomRes.json();
      const foundClassroom = classroomData.classrooms.find((c: { _id: string }) => c._id === classroomId);
      setClassroom(foundClassroom);

      // Cargar materiales
      const materialsRes = await fetch(`/api/education/materials?classroomId=${classroomId}`);
      const materialsData = await materialsRes.json();
      setMaterials(materialsData.materials || []);

      // Cargar sesiones
      const sessionsRes = await fetch(`/api/education/sessions?classroomId=${classroomId}`);
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      console.error("Error loading classroom data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadMaterial() {
    if (!newMaterial.title || !newMaterial.description) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const res = await fetch("/api/education/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMaterial,
          classroomId,
        }),
      });

      if (res.ok) {
        setNewMaterial({
          title: "",
          description: "",
          type: "text",
          content: "",
          fileUrl: "",
          externalLink: "",
        });
        setShowUploadModal(false);
        loadClassroomData();
      }
    } catch (error) {
      console.error("Error uploading material:", error);
    }
  }

  async function createSession() {
    if (!newSession.title || !newSession.description || !newSession.scheduledFor) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const res = await fetch("/api/education/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSession,
          classroomId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Si es una sesión privada y se generó un código, mostrarlo
        if (newSession.isPrivate && data.accessCode) {
          alert(`Sesión privada creada.\n\nCódigo de acceso: ${data.accessCode}\n\nGuarda este código para compartirlo con los estudiantes.`);
        }
        
        setNewSession({
          title: "",
          description: "",
          scheduledFor: "",
          duration: 60,
          streamUrl: "",
          isPrivate: false,
          accessCode: "",
        });
        setShowSessionModal(false);
        loadClassroomData();
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  }

  const materialTypeIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    text: FileText,
    pdf: FileText,
    word: FileText,
    excel: FileSpreadsheet,
    powerpoint: FileImage,
    "google-drive": LinkIcon,
    link: LinkIcon,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D5E8D4] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#5D8D7C] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D5E8D4]">
      <Header language={language} onLanguageChange={() => setLanguage(language === "ES" ? "EN" : "ES")} />

      <main className="max-w-7xl mx-auto px-4 py-8 mt-20">
        {/* Breadcrumb y título */}
        <button
          onClick={() => router.push("/education/admin")}
          className="flex items-center gap-2 text-[#5D8D7C] hover:text-green-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#5D8D7C] mb-2">
            {classroom?.name}
          </h1>
          <p className="text-gray-600 mb-4">{classroom?.description}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{classroom?.students.length} estudiantes</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{materials.length} materiales</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>{sessions.length} sesiones</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("materials")}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === "materials"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Materiales
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === "sessions"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Video className="w-5 h-5 inline mr-2" />
              Sesiones en Vivo
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === "students"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Estudiantes
            </button>
          </div>

          <div className="p-6">
            {/* Tab: Materiales */}
            {activeTab === "materials" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[#5D8D7C]">
                    Materiales Educativos
                  </h2>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Material
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((material) => {
                    const Icon = materialTypeIcons[material.type] || FileText;
                    return (
                      <motion.div
                        key={material._id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 rounded-lg p-4 border-2 border-transparent hover:border-green-500 transition"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-8 h-8 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#5D8D7C] truncate">
                              {material.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {material.description}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {material.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(material.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => {
                                  setEditingMaterial(material);
                                  setShowEditModal(true);
                                }}
                                className="flex items-center gap-1 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                              >
                                <Edit className="w-3 h-3" />
                                Editar
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("¿Estás seguro de eliminar este material?")) {
                                    try {
                                      await fetch(`/api/education/materials/${material._id}`, {
                                        method: "DELETE",
                                      });
                                      loadClassroomData();
                                    } catch (error) {
                                      console.error("Error deleting material:", error);
                                    }
                                  }
                                }}
                                className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                              >
                                <Trash2 className="w-3 h-3" />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {materials.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay materiales aún</p>
                    <p className="text-sm text-gray-400">Agrega tu primer material para comenzar</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Sesiones */}
            {activeTab === "sessions" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[#5D8D7C]">
                    Sesiones en Vivo
                  </h2>
                  <button
                    onClick={() => setShowSessionModal(true)}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Sesión
                  </button>
                </div>

                <div className="space-y-4">
                  {sessions.map((session) => (
                    <motion.div
                      key={session._id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gray-50 rounded-lg p-4 border-2 border-transparent hover:border-green-500 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-[#5D8D7C] text-lg">
                              {session.title}
                            </h3>
                            {session.isLive && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                EN VIVO
                              </span>
                            )}
                            {session.isPrivate && (
                              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                PRIVADA
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{session.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.scheduledFor).toLocaleString()}
                            </div>
                            <span>{session.duration} minutos</span>
                            {session.isPrivate && session.accessCode && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono text-xs">
                                Código: {session.accessCode}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/education/admin/session/${session._id}`)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                        >
                          Gestionar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {sessions.length === 0 && (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay sesiones programadas</p>
                    <p className="text-sm text-gray-400">Crea tu primera sesión en vivo</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Estudiantes */}
            {activeTab === "students" && (
              <div>
                <h2 className="text-xl font-semibold text-[#5D8D7C] mb-6">
                  Estudiantes Inscritos
                </h2>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{classroom?.students.length} estudiantes inscritos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal: Subir Material */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#5D8D7C]">Agregar Material</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Material
                  </label>
                  <select
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="text">Texto Plano</option>
                    <option value="pdf">PDF</option>
                    <option value="word">Word</option>
                    <option value="excel">Excel</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="google-drive">Google Drive</option>
                    <option value="link">Link Externo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ej. Introducción a la Anatomía"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe el contenido del material..."
                  />
                </div>

                {newMaterial.type === "text" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido
                    </label>
                    <textarea
                      value={newMaterial.content}
                      onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                      rows={8}
                      placeholder="Escribe tu contenido aquí..."
                    />
                  </div>
                )}

                {(newMaterial.type === "google-drive" || newMaterial.type === "link") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Externo
                    </label>
                    <input
                      type="url"
                      value={newMaterial.externalLink}
                      onChange={(e) => setNewMaterial({ ...newMaterial, externalLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                )}

                {["pdf", "word", "excel", "powerpoint"].includes(newMaterial.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del Archivo
                    </label>
                    <input
                      type="url"
                      value={newMaterial.fileUrl}
                      onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://... (URL directa del archivo)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sube tu archivo a un servicio de almacenamiento y pega la URL aquí
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={uploadMaterial}
                    className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
                  >
                    Agregar Material
                  </button>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Material */}
      <AnimatePresence>
        {showEditModal && editingMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setEditingMaterial(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#5D8D7C]">Editar Material</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMaterial(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Material
                  </label>
                  <select
                    value={editingMaterial.type}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="text">Texto Plano</option>
                    <option value="pdf">PDF</option>
                    <option value="word">Word</option>
                    <option value="excel">Excel</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="google-drive">Google Drive</option>
                    <option value="link">Link Externo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={editingMaterial.title}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ej. Introducción a la Anatomía"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={editingMaterial.description}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe el contenido del material..."
                  />
                </div>

                {editingMaterial.type === "text" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido
                    </label>
                    <textarea
                      value={editingMaterial.content || ""}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                      rows={8}
                      placeholder="Escribe tu contenido aquí..."
                    />
                  </div>
                )}

                {(editingMaterial.type === "google-drive" || editingMaterial.type === "link") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Externo
                    </label>
                    <input
                      type="url"
                      value={editingMaterial.externalLink || ""}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, externalLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                )}

                {["pdf", "word", "excel", "powerpoint"].includes(editingMaterial.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del Archivo
                    </label>
                    <input
                      type="url"
                      value={editingMaterial.fileUrl || ""}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, fileUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://... (URL directa del archivo)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sube tu archivo a un servicio de almacenamiento y pega la URL aquí
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/education/materials/${editingMaterial._id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(editingMaterial),
                        });
                        if (response.ok) {
                          loadClassroomData();
                          setShowEditModal(false);
                          setEditingMaterial(null);
                        }
                      } catch (error) {
                        console.error("Error updating material:", error);
                      }
                    }}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingMaterial(null);
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Nueva Sesión */}
      <AnimatePresence>
        {showSessionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSessionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#5D8D7C]">Nueva Sesión en Vivo</h2>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ej. Clase 1: Introducción"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={newSession.description}
                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe los temas de la sesión..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha y Hora *
                    </label>
                    <input
                      type="datetime-local"
                      value={newSession.scheduledFor}
                      onChange={(e) => setNewSession({ ...newSession, scheduledFor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      value={newSession.duration}
                      onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="15"
                      step="15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del Stream (opcional)
                  </label>
                  <input
                    type="url"
                    value={newSession.streamUrl}
                    onChange={(e) => setNewSession({ ...newSession, streamUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://zoom.us/j/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes agregar esto después desde Zoom u otro servicio
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacidad de la Sesión
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!newSession.isPrivate}
                        onChange={() => setNewSession({ ...newSession, isPrivate: false, accessCode: "" })}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm">Pública (todos los estudiantes)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={newSession.isPrivate}
                        onChange={() => setNewSession({ ...newSession, isPrivate: true })}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm">Privada (requiere código)</span>
                    </label>
                  </div>
                </div>

                {newSession.isPrivate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de Acceso (opcional)
                    </label>
                    <input
                      type="text"
                      value={newSession.accessCode}
                      onChange={(e) => setNewSession({ ...newSession, accessCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                      placeholder="Dejar vacío para generar automáticamente"
                      maxLength={12}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si lo dejas vacío, se generará un código aleatorio de 8 caracteres
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createSession}
                    className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
                  >
                    Crear Sesión
                  </button>
                  <button
                    onClick={() => setShowSessionModal(false)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
