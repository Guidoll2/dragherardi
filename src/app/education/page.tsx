"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function EducationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "student" | null>(null);

  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch("/api/education/role");
        const data = await res.json();
        
        if (data.role) {
          setUserRole(data.role);
        } else {
          // Redirigir a login si no está autenticado
          router.push("/sign-in?redirect=/education");
        }
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [router]);

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

  if (userRole === "admin") {
    router.push("/education/admin");
    return null;
  }

  if (userRole === "student") {
    router.push("/education/student");
    return null;
  }

  return null;
}
