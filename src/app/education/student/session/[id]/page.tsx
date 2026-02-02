"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Video, Mic, MicOff, VideoOff, Users, X, MessageCircle } from "lucide-react";

interface ChatMessage {
  _id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isInstructor: boolean;
}

interface Session {
  _id: string;
  title: string;
  description: string;
  classroomId: string;
  streamUrl?: string;
  isLive: boolean;
}

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [isInstructor, setIsInstructor] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessionData();
    loadUserInfo();
    const interval = setInterval(loadMessages, 3000); // Poll cada 3 segundos
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadUserInfo() {
    try {
      const res = await fetch("/api/education/role");
      const data = await res.json();
      setUserName(data.name || "Usuario");
      setIsInstructor(data.role === "admin");
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  }

  async function loadSessionData() {
    try {
      // En producción, necesitarías un endpoint específico para obtener una sesión por ID
      // Por ahora, obtenemos todas y filtramos
      const res = await fetch(`/api/education/sessions?classroomId=temp`);
      // Esto es una simplificación - necesitarías ajustar tu API
    } catch (error) {
      console.error("Error loading session:", error);
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
            <h1 className="text-xl font-semibold">Sesión en Vivo</h1>
            <p className="text-sm text-gray-400">Clase en progreso</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">EN VIVO</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span className="text-sm">{messages.length > 0 ? new Set(messages.map(m => m.userId)).size : 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col bg-black relative">
          {/* Video Container */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Área de Video</p>
              <p className="text-sm text-gray-500">
                El stream de video se mostrará aquí
              </p>
              <p className="text-xs text-gray-600 mt-4">
                Conecta con Zoom, Meet u otro servicio de streaming
              </p>
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
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Chat de Clase</h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700 lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {messages.length} mensajes
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${
                    msg.isInstructor ? "items-start" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      msg.isInstructor ? "bg-green-500" : "bg-blue-500"
                    }`} />
                    <span className={`text-sm font-medium ${
                      msg.isInstructor ? "text-green-600" : "text-gray-700"
                    }`}>
                      {msg.userName}
                      {msg.isInstructor && " (Instructor)"}
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
                  <p className="text-gray-500 text-sm">
                    No hay mensajes aún
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Sé el primero en participar
                  </p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Presiona Enter para enviar
              </p>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
