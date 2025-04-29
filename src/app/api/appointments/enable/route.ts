// src/app/api/appointments/enable/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/mongoDB/db";
import Appointment from "@/mongoDB/models/appointment";
import User from "@/mongoDB/models/users"; // Importar el modelo de usuarios
import { auth } from "@clerk/nextjs/server";

const PROFESSIONAL_ID = process.env.CLERK_DOCTOR_ID;

export async function POST(req: NextRequest) {
  if (!PROFESSIONAL_ID) {
    return NextResponse.json(
      { error: "No configured professional." },
      { status: 500 }
    );
  }

  // 1) Auth
  const { userId } = await auth(); // auth() lleva await
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  // 2) Conectar a la base de datos y buscar el rol del usuario
  try {
    await db(); // Asegurarse de que la base de datos esté conectada

    const user = await User.findOne({ clerkUserId: userId }); // Buscar el usuario en la base de datos
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    console.log("Rol del usuario desde la base de datos:", user.role); // Log para depuración

    if (!user.role || user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
  } catch (err) {
    console.error("Error al verificar el rol del usuario:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }

  // 3) Lógica de habilitar turnos
  try {
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
        professionalId: PROFESSIONAL_ID,
      });
      if (!exists) {
        const newAppt = await Appointment.create({
          date: appointmentDate,
          timeSlot: slot,
          professionalId: PROFESSIONAL_ID,
          isBlocked: false,
        });
        createdSlots.push(newAppt);
      }
    }

    return NextResponse.json({ success: true, createdSlots });
  } catch (err) {
    console.error("Error habilitando turnos:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
