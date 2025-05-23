// src/app/api/appointments/reserve/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/mongoDB/db";
import Appointment from "@/mongoDB/models/appointment";
import User from "@/mongoDB/models/users";
import sendEmail from "../../../../lib/utils/sendEmail";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { AppLanguage, getTranslations } from "../../../../lib/i18n"; // Asegúrate de que getTranslations devuelve el objeto Translations

const PROFESSIONAL_EMAIL = "guido.llaurado@gmail.com";
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@yourdomain.com";

export async function POST(req: NextRequest) {
  try {
    await db();

    const { userId: reservantClerkId } = await auth();
    if (!reservantClerkId) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { date, timeSlot, language } = await req.json();

    if (!date || !timeSlot || !language) {
      return NextResponse.json(
        { error: "Datos incompletos (fecha, hora o idioma)." },
        { status: 400 }
      );
    }

    const t = getTranslations(language as AppLanguage);
    const dateFnsLocale = language === 'es' ? es : enUS;

    const appointmentDate = new Date(date);

    const existingAppointment = await Appointment.findOne({
      date: appointmentDate,
      timeSlot: timeSlot,
      userId: null,
      isBlocked: false,
    });

    if (!existingAppointment) {
      // **CORRECCIÓN 1: Acceso a la propiedad 'slotNotAvailable' directamente de 't'**
      return NextResponse.json(
        { error: t.slotNotAvailable }, // Correcto: Acceder como t.slotNotAvailable
        { status: 400 }
      );
    }

    const reservantUser = await User.findOne({ clerkUserId: reservantClerkId });
    if (!reservantUser) {
      return NextResponse.json(
        { error: "Usuario que reserva no encontrado en la base de datos." },
        { status: 404 }
      );
    }

    existingAppointment.userId = reservantUser.clerkUserId;
    await existingAppointment.save();

    const formattedDate = format(new Date(date), "EEEE d 'de' MMMM 'de' yyyy", { locale: dateFnsLocale }); // Añadido 'yyyy' para el año completo
    const formattedTime = timeSlot;

    // --- Envío de emails ---
    try {
      await sendEmail({
        to: PROFESSIONAL_EMAIL,
        from: FROM_EMAIL,
        subject: t.emailSubjectProfessional,
        text: `${t.emailNewBookingMessage}\n\n` +
              `${t.emailBookingDetailsProfessional}\n` +
              // **CORRECCIÓN 2: Acceso a las propiedades 'emailDate' y 'emailTime' directamente de 't'**
              `${t.emailDate}: ${formattedDate}\n` +
              `${t.emailTime}: ${formattedTime}\n\n` +
              `${t.emailReservantInfo}\n` +
              `${t.emailName}: ${reservantUser?.firstName || 'N/A'} ${reservantUser?.lastName || 'N/A'}\n` +
              `${t.emailEmail}: ${reservantUser?.email || 'N/A'}\n` +
              `${t.emailClerkId}: ${reservantClerkId}`,
        html: `<p>${t.emailNewBookingMessage}</p>
               <p><strong>${t.emailBookingDetailsProfessional}</strong></p>
               <ul>
                 <li><strong>${t.emailDate}:</strong> ${formattedDate}</li>
                 <li><strong>${t.emailTime}:</strong> ${formattedTime}</li>
               </ul>
               <p><strong>${t.emailReservantInfo}</strong></p>
               <ul>
                 <li><strong>${t.emailName}:</strong> ${reservantUser?.firstName || 'N/A'} ${reservantUser?.lastName || 'N/A'}</li>
                 <li><strong>${t.emailEmail}:</strong> ${reservantUser?.email || 'N/A'}</li>
                 <li><strong>${t.emailClerkId}:</strong> ${reservantClerkId}</li>
               </ul>`,
      });
      console.log(`Email de notificación enviado a ${PROFESSIONAL_EMAIL} en idioma ${language}`);
    } catch (emailError) {
      console.error("Error enviando email a la profesional:", emailError);
    }

    if (reservantUser?.email) {
      try {
        await sendEmail({
          to: reservantUser.email,
          from: FROM_EMAIL,
          subject: t.emailSubjectUser,
          text: `${t.emailGreeting(reservantUser.firstName || '')}\n` +
                `${t.emailConfirmedMessage}\n\n` +
                `${t.emailBookingDetails}\n` +
                // **CORRECCIÓN 3: Acceso a las propiedades 'emailDate' y 'emailTime' directamente de 't'**
                `${t.emailDate}: ${formattedDate}\n` +
                `${t.emailTime}: ${formattedTime}\n\n` +
                `${t.emailWaiting}`,
          html: `<p>${t.emailGreeting(reservantUser.firstName || '')}</p>
                 <p>${t.emailConfirmedMessage}</p>
                 <p><strong>${t.emailBookingDetails}</strong></p>
                 <ul>
                   <li><strong>${t.emailDate}:</strong> ${formattedDate}</li>
                   <li><strong>${t.emailTime}:</strong> ${formattedTime}</li>
                 </ul>
                 <p>${t.emailWaiting}</p>`,
        });
        console.log(`Email de confirmación enviado a ${reservantUser.email} en idioma ${language}`);
      } catch (emailError) {
        console.error("Error enviando email al reservante:", emailError);
      }
    } else {
      console.warn(`No se encontró el email del reservante con Clerk ID: ${reservantClerkId} para enviar el email de confirmación.`);
    }

    return NextResponse.json({ success: true, appointment: existingAppointment });

  } catch (error) {
    console.error("Error reservando turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al reservar el turno." },
      { status: 500 }
    );
  }
}