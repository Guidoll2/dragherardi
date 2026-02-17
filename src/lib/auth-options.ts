import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@/mongoDB/models/users";
import sendEmail from "@/lib/utils/sendEmail";
import mongoose from "mongoose";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Conectar a la base de datos
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI!);
      }
      
      const dbUser = await User.findOne({ email: user.email });

      // Si el usuario no existe, crearlo y enviar email de notificación
      if (!dbUser) {
        const ADMIN_EMAILS = ["candegherardi@gmail.com", "guido.llaurado@gmail.com"];
        const isMainAdmin = ADMIN_EMAILS.includes(user.email || "");

        await User.create({
          email: user.email,
          name: user.name,
          image: user.image,
          approved: isMainAdmin, // Admin principal aprobado automáticamente
          role: isMainAdmin ? 'admin' : 'pending',
          createdAt: new Date(),
        });

        // Enviar notificación solo si NO es el admin principal
        if (!isMainAdmin) {
          try {
            await sendEmail({
            to: process.env.ADMIN_EMAIL || "candegherardi@gmail.com",
            subject: "Nueva solicitud de acceso - Plataforma de Neurociencia",
            text: `Nueva solicitud de registro: ${user.name} (${user.email})`,
            html: `
              <h2>Nueva solicitud de registro</h2>
              <p>Un nuevo usuario ha solicitado acceso a la plataforma:</p>
              <ul>
                <li><strong>Nombre:</strong> ${user.name}</li>
                <li><strong>Email:</strong> ${user.email}</li>
              </ul>
              <p>Por favor, revisa la solicitud en el panel de administración.</p>
              <p><a href="${process.env.NEXTAUTH_URL}/admin/users">Ir al panel de administración</a></p>
            `,
          });
        } catch (emailError) {
          console.error("Error al enviar email de notificación (no bloquea login):", emailError);
        }
        }

        // Permitir el login
        return true;
      }

      // Si el usuario existe pero no está aprobado, permitir login con acceso limitado
      // Si es el admin principal, asegurarse de que tenga role admin y esté aprobado
      const ADMIN_EMAILS = ["candegherardi@gmail.com", "guido.llaurado@gmail.com"];
      if (ADMIN_EMAILS.includes(user.email || "") && (!dbUser.approved || dbUser.role !== 'admin')) {
        await User.updateOne({ email: user.email }, { approved: true, role: 'admin' });
      }

      if (!dbUser.approved) {
        return true;
      }

      // Usuario aprobado, acceso completo
      return true;
    },

    async session({ session }) {
      // Añadir información personalizada a la sesión
      if (session.user) {
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI!);
        }
        
        const dbUser = await User.findOne({ email: session.user.email });
        
        if (dbUser) {
          session.user.id = (dbUser._id as unknown as { toString(): string }).toString();
          session.user.approved = dbUser.approved || false;
          session.user.role = dbUser.role || 'pending';
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
