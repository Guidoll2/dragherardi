// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/mongoDB/db";
import Appointment from "@/mongoDB/models/appointment";

const PROFESSIONAL_ID = process.env.CLERK_DOCTOR_ID;

export async function GET(req: NextRequest) {
  if (!PROFESSIONAL_ID) {
    return NextResponse.json(
      { error: "No configured professional." },
      { status: 500 }
    );
  }

  try {
    await db();
    // Traemos sólo las citas de la médica (o quita esta línea para traer todas)
    const appointments = await Appointment.find({
      professionalId: PROFESSIONAL_ID,
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error obteniendo citas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
