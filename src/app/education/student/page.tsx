"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { motion } from "framer-motion";
import { BookOpen, Video, Users, FileText, Search, Shield } from "lucide-react";

interface Classroom {
  _id: string;
  name: string;
  description: string;
  instructorName: string;
  students: string[];
  isActive: boolean;
  coverImage?: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [, setClassrooms] = useState<Classroom[]>([]);
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<Classroom[]>([]);
  const [availableClassrooms, setAvailableClassrooms] = useState<Classroom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("ES");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
    loadClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/education/role");
      const data = await res.json();
      
      // Permitir a los admins ver como estudiantes
      setIsAdmin(data.role === "admin");
      
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
      const allClassrooms = data.classrooms || [];
      
      // Obtener info del usuario
      await fetch("/api/education/role");
      
      // Para simular, ya que no tenemos el ID del usuario en el array de students aún
      // En producción, deberías tener el clerk user ID en el array de students
      const enrolled: Classroom[] = []; // Por ahora vacío
      const available = allClassrooms.filter((c: Classroom) => c.isActive);
      
      setEnrolledClassrooms(enrolled);
      setAvailableClassrooms(available);
      setClassrooms(allClassrooms);
    } catch (error) {
      console.error("Error loading classrooms:", error);
    }
  }

  const filteredClassrooms = availableClassrooms.filter((classroom) =>
    classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classroom.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classroom.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Banner de Admin viendo como estudiante */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <div>
                <p className="font-semibold">Modo Administrador</p>
                <p className="text-sm text-blue-100">
                  Estás viendo el portal como estudiante
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/education/admin")}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Volver al Dashboard Admin
            </button>
          </motion.div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#5D8D7C] mb-2">
            {language === "ES" ? "Mi Espacio de Aprendizaje" : "My Learning Space"}
          </h1>
          <p className="text-gray-600">
            {language === "ES" 
              ? "Explora aulas virtuales y accede a contenido educativo de calidad"
              : "Explore virtual classrooms and access quality educational content"}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mis Aulas</p>
                <p className="text-3xl font-bold text-[#5D8D7C]">
                  {enrolledClassrooms.length}
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
                <p className="text-gray-500 text-sm">Materiales</p>
                <p className="text-3xl font-bold text-[#5D8D7C]">-</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sesiones</p>
                <p className="text-3xl font-bold text-[#5D8D7C]">-</p>
              </div>
              <Video className="w-12 h-12 text-purple-500 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Mis Aulas Inscritas */}
        {enrolledClassrooms.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-[#5D8D7C] mb-6">
              {language === "ES" ? "Mis Aulas" : "My Classrooms"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledClassrooms.map((classroom) => (
                <motion.div
                  key={classroom._id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow-md p-6 cursor-pointer border-2 border-green-500"
                  onClick={() => router.push(`/education/student/classroom/${classroom._id}`)}
                >
                  <h3 className="text-lg font-semibold text-[#5D8D7C] mb-2">
                    {classroom.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {classroom.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{classroom.instructorName}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      Inscrito
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Explorar Aulas Disponibles */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#5D8D7C]">
              {language === "ES" ? "Explorar Aulas Disponibles" : "Explore Available Classrooms"}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "ES" ? "Buscar aulas..." : "Search classrooms..."}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassrooms.map((classroom) => (
              <motion.div
                key={classroom._id}
                whileHover={{ scale: 1.03 }}
                className="bg-gray-50 rounded-lg shadow-md p-6 cursor-pointer border-2 border-transparent hover:border-green-500 transition"
                onClick={() => router.push(`/education/student/classroom/${classroom._id}`)}
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#5D8D7C] flex-1">
                      {classroom.name}
                    </h3>
                    <BookOpen className="w-6 h-6 text-green-500 flex-shrink-0" />
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {classroom.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{classroom.instructorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{classroom.students.length} estudiantes</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/education/student/classroom/${classroom._id}`);
                  }}
                  className="w-full mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium"
                >
                  {language === "ES" ? "Ver Aula" : "View Classroom"}
                </button>
              </motion.div>
            ))}
          </div>

          {filteredClassrooms.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery
                  ? language === "ES" 
                    ? "No se encontraron aulas"
                    : "No classrooms found"
                  : language === "ES"
                  ? "No hay aulas disponibles"
                  : "No classrooms available"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
