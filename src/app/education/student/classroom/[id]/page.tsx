"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  FileImage,
  Link as LinkIcon,
  Video,
  Calendar,
  ExternalLink,
  Clock,
  Lock,
  X,
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

export default function StudentClassroomView() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<{ _id: string; name: string; description: string; instructorName?: string } | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<"materials" | "sessions">("materials");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [language, setLanguage] = useState("ES");
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState("");

  useEffect(() => {
    loadClassroomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  async function loadClassroomData() {
    try {
      const classroomRes = await fetch(`/api/education/classrooms`);
      const classroomData = await classroomRes.json();
      const foundClassroom = classroomData.classrooms.find((c: { _id: string }) => c._id === classroomId);
      setClassroom(foundClassroom);

      const materialsRes = await fetch(`/api/education/materials?classroomId=${classroomId}`);
      const materialsData = await materialsRes.json();
      setMaterials(materialsData.materials || []);

      const sessionsRes = await fetch(`/api/education/sessions?classroomId=${classroomId}`);
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      console.error("Error loading classroom data:", error);
    } finally {
      setLoading(false);
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

  function openMaterial(material: Material) {
    if (material.type === "text") {
      setSelectedMaterial(material);
    } else if (material.externalLink) {
      window.open(material.externalLink, "_blank");
    } else if (material.fileUrl) {
      window.open(material.fileUrl, "_blank");
    }
  }

  function handleJoinSession(session: Session) {
    if (session.isPrivate) {
      setSelectedSession(session);
      setShowAccessCodeModal(true);
      setAccessCodeInput("");
    } else {
      router.push(`/education/student/session/${session._id}`);
    }
  }

  async function verifyAndJoinSession() {
    if (!selectedSession || !accessCodeInput.trim()) {
      alert("Por favor ingresa un código de acceso");
      return;
    }

    try {
      const res = await fetch("/api/education/sessions/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession._id,
          accessCode: accessCodeInput.trim(),
        }),
      });

      const data = await res.json();

      if (data.valid) {
        router.push(`/education/student/session/${selectedSession._id}`);
      } else {
        alert("Código de acceso incorrecto. Verifica con tu instructor.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      alert("Error al verificar el código. Intenta de nuevo.");
    }
  }

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
        <button
          onClick={() => router.push("/education/student")}
          className="flex items-center gap-2 text-[#5D8D7C] hover:text-green-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === "ES" ? "Volver a mis aulas" : "Back to my classrooms"}
        </button>

        {/* Header del Aula */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#5D8D7C] mb-2">
            {classroom?.name}
          </h1>
          <p className="text-gray-600 mb-3">{classroom?.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">{language === "ES" ? "Instructor:" : "Instructor:"}</span>
            <span>{classroom?.instructorName}</span>
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
              {language === "ES" ? "Materiales" : "Materials"}
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
              {language === "ES" ? "Sesiones" : "Sessions"}
            </button>
          </div>

          <div className="p-6">
            {/* Tab: Materiales */}
            {activeTab === "materials" && (
              <div>
                <h2 className="text-xl font-semibold text-[#5D8D7C] mb-6">
                  {language === "ES" ? "Recursos de Aprendizaje" : "Learning Resources"}
                </h2>

                <div className="space-y-4">
                  {materials.map((material) => {
                    const Icon = materialTypeIcons[material.type] || FileText;
                    return (
                      <motion.div
                        key={material._id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-gray-50 rounded-lg p-4 border-2 border-transparent hover:border-green-500 transition cursor-pointer"
                        onClick={() => openMaterial(material)}
                      >
                        <div className="flex items-start gap-4">
                          <Icon className="w-10 h-10 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#5D8D7C] text-lg mb-1">
                              {material.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {material.description}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                {material.type.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(material.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {materials.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {language === "ES" 
                        ? "No hay materiales disponibles aún" 
                        : "No materials available yet"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Sesiones */}
            {activeTab === "sessions" && (
              <div>
                <h2 className="text-xl font-semibold text-[#5D8D7C] mb-6">
                  {language === "ES" ? "Clases en Vivo" : "Live Classes"}
                </h2>

                <div className="space-y-4">
                  {sessions
                    .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())
                    .map((session) => {
                      const isUpcoming = new Date(session.scheduledFor) > new Date();
                      return (
                        <motion.div
                          key={session._id}
                          whileHover={{ scale: 1.01 }}
                          className="bg-gray-50 rounded-lg p-5 border-2 border-transparent hover:border-green-500 transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-[#5D8D7C] text-lg">
                                  {session.title}
                                </h3>
                                {session.isLive && (
                                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    EN VIVO
                                  </span>
                                )}
                                {session.isPrivate && (
                                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    PRIVADA
                                  </span>
                                )}
                                {isUpcoming && !session.isLive && (
                                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Próximamente
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
                              </div>
                            </div>
                          </div>

                          {session.isLive && session.streamUrl && (
                            <button
                              onClick={() => handleJoinSession(session)}
                              className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                            >
                              <Video className="w-5 h-5" />
                              {session.isPrivate 
                                ? (language === "ES" ? "Ingresar Código y Unirse" : "Enter Code & Join")
                                : (language === "ES" ? "Unirse a la Clase" : "Join Class")}
                            </button>
                          )}

                          {!session.isLive && session.streamUrl && (
                            <button
                              disabled
                              className="w-full bg-gray-300 text-gray-600 px-4 py-3 rounded-lg cursor-not-allowed font-medium"
                            >
                              {language === "ES" ? "Clase no iniciada" : "Class not started"}
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                </div>

                {sessions.length === 0 && (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {language === "ES" 
                        ? "No hay sesiones programadas" 
                        : "No sessions scheduled"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal: Contenido de texto */}
      {selectedMaterial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMaterial(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#5D8D7C]">
                {selectedMaterial.title}
              </h2>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-6">{selectedMaterial.description}</p>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                {selectedMaterial.content}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal: Código de Acceso para Sesión Privada */}
      {showAccessCodeModal && selectedSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAccessCodeModal(false);
            setSelectedSession(null);
            setAccessCodeInput("");
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-[#5D8D7C]">
                  Sesión Privada
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAccessCodeModal(false);
                  setSelectedSession(null);
                  setAccessCodeInput("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Esta sesión requiere un código de acceso. Solicita el código a tu instructor.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Acceso
              </label>
              <input
                type="text"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    verifyAndJoinSession();
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg text-center uppercase tracking-widest"
                placeholder="XXXXXXXX"
                maxLength={12}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={verifyAndJoinSession}
                disabled={!accessCodeInput.trim()}
                className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Verificar y Unirse
              </button>
              <button
                onClick={() => {
                  setShowAccessCodeModal(false);
                  setSelectedSession(null);
                  setAccessCodeInput("");
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
