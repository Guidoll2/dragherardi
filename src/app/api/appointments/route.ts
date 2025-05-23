// src/app/api/appointments/route.ts
import { NextResponse } from "next/server";
import db from "@/mongoDB/db";
import Appointment from "@/mongoDB/models/appointment";

// Remove the PROFESSIONAL_ID constant or make it optional if only used for filtering
// const PROFESSIONAL_ID = process.env.CLERK_DOCTOR_ID;

export async function GET() {
  try {
    await db();
    // Traemos todas las citas, o puedes filtrar por un ID si es necesario para otros roles.
    // Si necesitas filtrar por un profesional específico, asegúrate de que PROFESSIONAL_ID
    // esté definido o maneja su ausencia adecuadamente.
    const appointments = await Appointment.find({}); // Fetch all appointments
    // If you still want to filter by professionalId for non-admin users,
    // you'll need to pass that ID in the GET request or handle it differently.
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error obteniendo citas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}