"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Video, 
  Users, 
  FileText, 
  Plus,
  Upload,
  Calendar,
  Settings,
  Eye
} from "lucide-react";

interface Classroom {
  _id: string;
  name: string;
  description: string;
  students: string[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: "", description: "" });
  const [language, setLanguage] = useState("ES");

  useEffect(() => {
    checkAuth();
    loadClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/education/role");
      const data = await res.json();
      
      if (data.role !== "admin") {
        router.push("/education");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  }

  async function loadClassrooms() {
    try {
      const res = await fetch("/api/education/classrooms");
      const data = await res.json();
      setClassrooms(data.classrooms || []);
    } catch (error) {
      console.error("Error loading classrooms:", error);
    }
  }

  async function createClassroom() {
    if (!newClassroom.name || !newClassroom.description) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      const res = await fetch("/api/education/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClassroom),
      });

      if (res.ok) {
        setNewClassroom({ name: "", description: "" });
        setShowCreateClassroom(false);
        loadClassrooms();
      }
    } catch (error) {
      console.error("Error creating classroom:", error);
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
        {/* Header del Dashboard */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#5D8D7C] mb-2">
              Dashboard de Administración
            </h1>
            <p className="text-gray-600">
              Gestiona tus aulas virtuales, contenido educativo y sesiones en vivo
            </p>
          </div>
          
          {/* Botón para ver como estudiante */}
          <button
            onClick={() => router.push("/education/student")}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            <Eye className="w-5 h-5" />
            Ver como Estudiante
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Aulas Activas</p>
                <p className="text-3xl font-bold text-[#5D8D7C]">
                  {classrooms.filter(c => c.isActive).length}
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-green-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Estudiantes</p>
                <p className="text-3xl font-bold text-[#5D8D7C]">
                  {classrooms.reduce((acc, c) => acc + c.students.length, 0)}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Materiales</p>
                <p className="text-3xl font-bold text-[#5D8D7C]">-</p>
              </div>
              <FileText className="w-12 h-12 text-purple-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sesiones</p>
                <p className="text-3xl font-bold text-[#5D8D7C]">-</p>
              </div>
              <Video className="w-12 h-12 text-red-500 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Aulas Virtuales */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#5D8D7C]">Mis Aulas Virtuales</h2>
            <button
              onClick={() => setShowCreateClassroom(!showCreateClassroom)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              <Plus className="w-5 h-5" />
              Nueva Aula
            </button>
          </div>

          {/* Formulario de crear aula */}
          {showCreateClassroom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-50 rounded-lg p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-[#5D8D7C] mb-4">Crear Nueva Aula</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Aula
                  </label>
                  <input
                    type="text"
                    value={newClassroom.name}
                    onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ej. Anatomía I - 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newClassroom.description}
                    onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe el contenido y objetivos del aula..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={createClassroom}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Crear Aula
                  </button>
                  <button
                    onClick={() => setShowCreateClassroom(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Lista de aulas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <motion.div
                key={classroom._id}
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md p-6 cursor-pointer border-2 border-transparent hover:border-green-500 transition"
                onClick={() => router.push(`/education/admin/classroom/${classroom._id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#5D8D7C] line-clamp-2">
                    {classroom.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    classroom.isActive 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {classroom.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {classroom.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{classroom.students.length} estudiantes</span>
                  </div>
                  <span className="text-xs">
                    {new Date(classroom.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {classrooms.length === 0 && !showCreateClassroom && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tienes aulas creadas aún</p>
              <p className="text-sm text-gray-400">Crea tu primera aula para comenzar</p>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer"
          >
            <Upload className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-[#5D8D7C] mb-2">
              Subir Contenido
            </h3>
            <p className="text-gray-600 text-sm">
              Agrega PDFs, documentos, videos y más
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer"
          >
            <Calendar className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-[#5D8D7C] mb-2">
              Programar Sesión
            </h3>
            <p className="text-gray-600 text-sm">
              Crea una clase en vivo con tus estudiantes
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer"
          >
            <Settings className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-[#5D8D7C] mb-2">
              Configuración
            </h3>
            <p className="text-gray-600 text-sm">
              Gestiona preferencias y ajustes
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
