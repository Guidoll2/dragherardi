"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/research" });
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D5E8D4] via-[#E8F4F0] to-[#F0F9FF] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-[#5D8D7C] transition-colors">
              Neurociencia Doctoral
            </h1>
          </Link>
          <p className="text-gray-600 text-lg">
            Accede al espacio de investigación
          </p>
        </div>

        {/* Card with glassmorphism */}
        <div className="relative">
          {/* Background with blur */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-3xl" />
          
          {/* Border gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 via-transparent to-white/20 p-[2px]">
            <div className="w-full h-full bg-gradient-to-br from-white/90 via-white/70 to-white/60 rounded-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 md:p-10">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Iniciar sesión
                </h2>
                <p className="text-sm text-gray-600">
                  Utiliza tu cuenta de Google para continuar
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </>
                )}
              </button>

              {/* Info Section */}
              <div className="pt-4 border-t border-gray-200/50">
                <div className="bg-blue-50/50 backdrop-blur-sm p-4 rounded-xl space-y-2">
                  <p className="text-sm text-gray-700 font-medium">
                    📋 Proceso de registro:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4">
                    <li>• Tu solicitud será enviada a revisión</li>
                    <li>• Recibirás un email cuando sea aprobada</li>
                    <li>• Podrás ver documentos públicos mientras esperas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-[#5D8D7C] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
