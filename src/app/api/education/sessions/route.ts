import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserInfo } from "@/lib/utils/auth";
import connectToDatabase from "@/mongoDB/db";
import LiveSessionModel from "@/mongoDB/models/liveSession";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");

    if (!classroomId) {
      return NextResponse.json({ error: "classroomId requerido" }, { status: 400 });
    }

    await connectToDatabase();

    const sessions = await LiveSessionModel.find({ classroomId })
      .sort({ scheduledFor: -1 });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error getting sessions:", error);
    return NextResponse.json({ error: "Error al obtener sesiones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo || userInfo.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { classroomId, title, description, scheduledFor, duration, streamUrl, isPrivate, accessCode } = body;

    if (!classroomId || !title || !description || !scheduledFor) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Si es privada, generar código si no se proporcionó
    let finalAccessCode = accessCode;
    if (isPrivate && !accessCode) {
      finalAccessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    await connectToDatabase();

    const session = await LiveSessionModel.create({
      classroomId,
      title,
      description,
      scheduledFor: new Date(scheduledFor),
      duration: duration || 60,
      streamUrl: streamUrl || "",
      isLive: false,
      isPrivate: isPrivate || false,
      accessCode: finalAccessCode || "",
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Error al crear sesión" }, { status: 500 });
  }
}
