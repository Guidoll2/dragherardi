// src/app/api/appointments/reserve/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/mongoDB/db";
import Appointment from "@/mongoDB/models/appointment";
import User from "@/mongoDB/models/users";
import sendEmail from "../../../../lib/utils/sendEmail";

export async function POST(req: NextRequest) {
  try {
    await db();
    const { date, timeSlot, userId } = await req.json();

    if (!date || !timeSlot || !userId) {
      return NextResponse.json(
        { error: "Datos incompletos." },
        { status: 400 }
      );
    }

    const PROFESSIONAL_ID = process.env.CLERK_DOCTOR_ID!;
    const appointment = await Appointment.findOne({
      date: new Date(date),
      timeSlot,
      professionalId: PROFESSIONAL_ID,
    });

    if (!appointment || appointment.userId || appointment.isBlocked) {
      return NextResponse.json(
        { error: "Turno no disponible." },
        { status: 400 }
      );
    }

    appointment.userId = userId;
    await appointment.save();

    // Notificar al profesional
    const professional = await User.findOne({ clerkUserId: PROFESSIONAL_ID });
    if (professional?.email) {
      await sendEmail({
        to: professional.email,
        subject: "Nuevo turno reservado",
        text: `Se ha reservado un turno para el ${date} en el horario ${timeSlot}.`,
      });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("Error reservando turno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
