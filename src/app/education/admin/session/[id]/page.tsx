"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Send, 
  Video, 
  Mic, 
  Users, 
  X, 
  MessageCircle,
  Settings,
  PlayCircle,
  StopCircle,
  Link as LinkIcon,
} from "lucide-react";

interface ChatMessage {
  _id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isInstructor: boolean;
}

export default function AdminSessionManagement() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("Dra. Gherardi");
  const [showChat, setShowChat] = useState(true);
  const [sessionLive, setSessionLive] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [showStreamModal, setShowStreamModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserInfo();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadUserInfo() {
    try {
      const res = await fetch("/api/education/role");
      const data = await res.json();
      setUserName(data.name || "Instructor");
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  }

  async function loadMessages() {
    try {
      const res = await fetch(`/api/education/chat?sessionId=${sessionId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch("/api/education/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage("");
        loadMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleLive() {
    setSessionLive(!sessionLive);
    // Aquí harías la actualización en el backend
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Gestión de Sesión (Admin)</h1>
            <p className="text-sm text-gray-400">Control de instructor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStreamModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition"
          >
            <LinkIcon className="w-4 h-4" />
            Configurar Stream
          </button>
          <button
            onClick={toggleLive}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              sessionLive
                ? "bg-red-600 hover:bg-red-500"
                : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {sessionLive ? (
              <>
                <StopCircle className="w-4 h-4" />
                Finalizar
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Iniciar Sesión
              </>
            )}
          </button>
          {sessionLive && (
            <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span className="text-sm font-medium">EN VIVO</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span className="text-sm">{messages.length > 0 ? new Set(messages.map(m => m.userId)).size : 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video/Control Area */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto p-8">
              <Video className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <h2 className="text-white text-2xl font-semibold mb-3">
                Panel de Control del Instructor
              </h2>
              <p className="text-gray-400 mb-6">
                Conecta tu stream de video de Zoom, Google Meet u otro servicio
              </p>
              
              {streamUrl ? (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Stream configurado:</p>
                  <p className="text-green-400 font-mono text-sm break-all">{streamUrl}</p>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6 mb-4">
                  <p className="text-gray-400 text-sm">
                    No hay stream configurado. Haz clic en "Configurar Stream" para añadir la URL.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Estado</p>
                  <p className={`font-semibold ${sessionLive ? "text-red-400" : "text-gray-500"}`}>
                    {sessionLive ? "En Vivo" : "Fuera de línea"}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Participantes</p>
                  <p className="text-white font-semibold">
                    {messages.length > 0 ? new Set(messages.map(m => m.userId)).size : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-full transition">
              <Mic className="w-6 h-6" />
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-full transition">
              <Video className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-full transition"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-full transition">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-96 bg-white flex flex-col border-l border-gray-200"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Chat de Clase (Instructor)
                </h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Responde preguntas de tus estudiantes
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      msg.isInstructor ? "bg-green-500" : "bg-blue-500"
                    }`} />
                    <span className={`text-sm font-medium ${
                      msg.isInstructor ? "text-green-600" : "text-gray-700"
                    }`}>
                      {msg.userName}
                      {msg.isInstructor && " (Tú)"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg max-w-[85%] ${
                    msg.isInstructor
                      ? "bg-green-100 text-green-900"
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />

              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No hay mensajes aún</p>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-green-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Responder a los estudiantes..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      {/* Modal: Configurar Stream */}
      {showStreamModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowStreamModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Configurar Stream de Video
            </h2>
            <p className="text-gray-600 mb-6">
              Ingresa la URL de tu reunión de Zoom, Google Meet u otro servicio de streaming
            </p>
            <input
              type="url"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowStreamModal(false)}
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setStreamUrl("");
                  setShowStreamModal(false);
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
