  // src/app/api/appointments/enable/route.ts
  import { NextRequest, NextResponse } from "next/server";
  import db from "@/mongoDB/db";
  import Appointment from "@/mongoDB/models/appointment";
  import User from "@/mongoDB/models/users";
  import { auth } from "@clerk/nextjs/server";

  // Remove or comment out the PROFESSIONAL_ID constant at the top
  // const PROFESSIONAL_ID = process.env.CLERK_DOCTOR_ID;

  export async function POST(req: NextRequest) {
    // Option 1: If you want to use the admin's own ID as the professionalId
    const { userId: adminClerkId } = await auth(); // Get the admin's Clerk ID
    if (!adminClerkId) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    // 2) Conectar a la base de datos y buscar el rol del usuario
    try {
      await db();

      const user = await User.findOne({ clerkUserId: adminClerkId }); // Use adminClerkId
      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado." },
          { status: 404 }
        );
      }

      console.log("Rol del usuario desde la base de datos:", user.role);

      if (!user.role || user.role.toLowerCase() !== "admin") {
        return NextResponse.json({ error: "No autorizado." }, { status: 403 });
      }

      // Now, let's determine the professionalId for the new appointments.
      // You could use the admin's Clerk ID as the professional ID for the newly enabled slots.
      const professionalIdForNewSlots = adminClerkId; // Use the admin's Clerk ID

      // 3) Lógica de habilitar turnos
      const { date, timeSlots } = await req.json();
      if (!date || !Array.isArray(timeSlots)) {
        return NextResponse.json(
          { error: "Datos incompletos." },
          { status: 400 }
        );
      }

      const appointmentDate = new Date(date);
      const createdSlots = [];

      for (const slot of timeSlots) {
        const exists = await Appointment.findOne({
          date: appointmentDate,
          timeSlot: slot,
          professionalId: professionalIdForNewSlots, // Use the dynamically determined ID
        });
        if (!exists) {
          const newAppt = await Appointment.create({
            date: appointmentDate,
            timeSlot: slot,
            professionalId: professionalIdForNewSlots, // Use the dynamically determined ID
            isBlocked: false,
          });
          createdSlots.push(newAppt);
        }
      }

      return NextResponse.json({ success: true, createdSlots });
    } catch (err) {
      console.error("Error al verificar el rol del usuario o habilitar reuniones:", err);
      return NextResponse.json(
        { error: "Error interno del servidor." },
        { status: 500 }
      );
    }
  }